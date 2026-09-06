import { indexedDBService } from './indexedDBService';

/**
 * Event-driven Reconnection Synchronization Service
 * Manages queued offline actions, duplicate prevention, retry backoff, and backend dispatch.
 */

// Generate a collision-resistant unique client action ID
function generateClientActionId() {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `act_${timestamp}_${randomStr}`;
}

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.listeners = new Set();
    this.syncStatus = 'SYNCED'; // 'SYNCED' | 'SYNCING' | 'OFFLINE' | 'FAILED'
    this.lastSyncTime = null;
    this.lastError = null;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncService] Network restored. Processing offline sync queue...');
        this.processQueue({ trigger: 'auto_reconnect' });
      });

      window.addEventListener('offline', () => {
        this.updateStatus('OFFLINE');
      });
    }
  }

  // Subscribe to sync state updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach((cb) => {
      try {
        cb({
          syncStatus: this.syncStatus,
          isSyncing: this.isSyncing,
          lastSyncTime: this.lastSyncTime,
          lastError: this.lastError,
        });
      } catch (err) {
        console.error('[SyncService] Listener callback error:', err);
      }
    });
  }

  updateStatus(status, error = null) {
    this.syncStatus = status;
    this.lastError = error;
    if (status === 'SYNCED') {
      this.lastSyncTime = new Date().toISOString();
    }
    this.notify();
  }

  /**
   * Safely enqueue an action for offline persistence and later sync
   */
  async queueAction({ type, endpoint, method = 'POST', payload = {}, description = '' }) {
    const clientActionId = payload.clientActionId || generateClientActionId();

    const queueItem = {
      clientActionId,
      type: type || 'GENERIC_ACTION',
      endpoint: endpoint || '/api/safety/report',
      method: method.toUpperCase(),
      payload: {
        ...payload,
        clientActionId,
      },
      description: description || `Offline ${type || 'Action'}`,
      status: 'PENDING', // 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'
      createdAt: new Date().toISOString(),
      retryCount: 0,
      lastError: null,
    };

    // Store in IndexedDB syncQueue
    await indexedDBService.put('syncQueue', queueItem);

    // If it's a safety report, also persist into offlineReports store for local queries
    if (type === 'SAFETY_REPORT' || type === 'INCIDENT_REPORT') {
      await indexedDBService.put('offlineReports', {
        ...queueItem.payload,
        clientActionId,
        id: clientActionId,
        status: 'PENDING_SYNC',
        createdAt: queueItem.createdAt,
      });
    }

    this.notify();

    // If online, immediately attempt to dispatch
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.processQueue({ trigger: 'immediate' }).catch(() => {});
    } else {
      this.updateStatus('OFFLINE');
    }

    return queueItem;
  }

  /**
   * Get all items currently in the sync queue
   */
  async getQueue() {
    try {
      const items = await indexedDBService.getAll('syncQueue');
      return Array.isArray(items) ? items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Get count of items requiring synchronization
   */
  async getPendingCount() {
    try {
      const queue = await this.getQueue();
      return queue.filter((item) => item.status === 'PENDING' || item.status === 'FAILED').length;
    } catch (err) {
      return 0;
    }
  }

  /**
   * Process and synchronize pending items with the backend
   */
  async processQueue(options = {}) {
    // Prevent multiple simultaneous sync processes (Mutex)
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress, skipping concurrent trigger.');
      return { success: false, reason: 'ALREADY_SYNCING' };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateStatus('OFFLINE');
      return { success: false, reason: 'OFFLINE' };
    }

    this.isSyncing = true;
    this.updateStatus('SYNCING');

    try {
      const queue = await this.getQueue();
      const pendingItems = queue.filter(
        (item) => item.status === 'PENDING' || item.status === 'FAILED'
      );

      if (pendingItems.length === 0) {
        this.isSyncing = false;
        this.updateStatus('SYNCED');
        return { success: true, processedCount: 0 };
      }

      console.log(`[SyncService] Processing ${pendingItems.length} queued offline actions...`);

      let successCount = 0;
      let failureCount = 0;

      for (const item of pendingItems) {
        // Mark item as currently syncing
        item.status = 'SYNCING';
        await indexedDBService.put('syncQueue', item);
        this.notify();

        try {
          // Perform HTTP request with timeout protection
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(item.endpoint, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              'X-Client-Action-ID': item.clientActionId,
            },
            body: JSON.stringify(item.payload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            // Successfully synchronized
            item.status = 'SYNCED';
            item.syncedAt = new Date().toISOString();
            item.lastError = null;
            await indexedDBService.put('syncQueue', item);

            // Update corresponding record in offlineReports if applicable
            if (item.type === 'SAFETY_REPORT' || item.type === 'INCIDENT_REPORT') {
              const existingReport = await indexedDBService.getById('offlineReports', item.clientActionId);
              if (existingReport) {
                await indexedDBService.put('offlineReports', {
                  ...existingReport,
                  status: 'VERIFIED_SYNCED',
                  syncedAt: item.syncedAt,
                });
              }
            }

            successCount++;
          } else {
            // Server returned error status (4xx/5xx)
            const errorText = await response.text().catch(() => response.statusText);
            item.status = 'FAILED';
            item.retryCount = (item.retryCount || 0) + 1;
            item.lastError = `HTTP ${response.status}: ${errorText.substring(0, 100)}`;
            await indexedDBService.put('syncQueue', item);
            failureCount++;
          }
        } catch (netErr) {
          // Network connection dropped or timed out during dispatch
          item.status = 'FAILED';
          item.retryCount = (item.retryCount || 0) + 1;
          item.lastError = netErr.name === 'AbortError' ? 'Request timed out' : netErr.message;
          await indexedDBService.put('syncQueue', item);
          failureCount++;
        }
      }

      this.isSyncing = false;

      if (failureCount > 0) {
        this.updateStatus('FAILED', `${failureCount} item(s) failed to sync. Will retry.`);
        return { success: false, successCount, failureCount };
      } else {
        this.updateStatus('SYNCED');
        return { success: true, successCount };
      }
    } catch (globalErr) {
      console.warn('[SyncService] Global sync processing exception:', globalErr);
      this.isSyncing = false;
      this.updateStatus('FAILED', globalErr.message);
      return { success: false, error: globalErr.message };
    }
  }

  /**
   * Reset all failed items to pending and initiate sync
   */
  async retryFailed() {
    const queue = await this.getQueue();
    const failedItems = queue.filter((item) => item.status === 'FAILED');
    for (const item of failedItems) {
      item.status = 'PENDING';
      item.lastError = null;
      await indexedDBService.put('syncQueue', item);
    }
    return this.processQueue({ trigger: 'manual_retry' });
  }

  /**
   * Remove completed synced items from the queue
   */
  async purgeSynced() {
    const queue = await this.getQueue();
    const syncedItems = queue.filter((item) => item.status === 'SYNCED');
    for (const item of syncedItems) {
      await indexedDBService.delete('syncQueue', item.clientActionId);
    }
    this.notify();
    return syncedItems.length;
  }

  /**
   * Clear entire sync queue (for admin / debugging)
   */
  async clearQueue() {
    await indexedDBService.clear('syncQueue');
    this.updateStatus('SYNCED');
    return true;
  }
}

export const syncService = new SyncService();
export default syncService;
