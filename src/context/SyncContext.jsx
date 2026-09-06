import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/syncService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const { isOnline } = useOnlineStatus();
  const [syncState, setSyncState] = useState({
    syncStatus: isOnline ? 'SYNCED' : 'OFFLINE',
    isSyncing: false,
    lastSyncTime: null,
    lastError: null,
  });
  const [queueItems, setQueueItems] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  // Refresh queue items and count
  const refreshQueue = useCallback(async () => {
    try {
      const items = await syncService.getQueue();
      setQueueItems(items);
      const pending = items.filter((i) => i.status === 'PENDING' || i.status === 'FAILED').length;
      setPendingCount(pending);
    } catch (err) {
      console.warn('[SyncContext] Error refreshing queue:', err);
    }
  }, []);

  // Subscribe to syncService state updates
  useEffect(() => {
    refreshQueue();

    const unsubscribe = syncService.subscribe((state) => {
      setSyncState((prev) => ({
        ...prev,
        ...state,
      }));
      refreshQueue();
    });

    return () => unsubscribe();
  }, [refreshQueue]);

  // Update status when network changes
  useEffect(() => {
    if (!isOnline) {
      syncService.updateStatus('OFFLINE');
    } else if (syncState.syncStatus === 'OFFLINE') {
      syncService.updateStatus('SYNCED');
      syncService.processQueue({ trigger: 'online_change' });
    }
  }, [isOnline]);

  // Trigger manual sync
  const triggerSync = useCallback(async () => {
    const result = await syncService.processQueue({ trigger: 'manual' });
    await refreshQueue();
    return result;
  }, [refreshQueue]);

  // Enqueue an action
  const queueAction = useCallback(
    async (action) => {
      const item = await syncService.queueAction(action);
      await refreshQueue();
      return item;
    },
    [refreshQueue]
  );

  // Retry failed items
  const retryFailed = useCallback(async () => {
    const result = await syncService.retryFailed();
    await refreshQueue();
    return result;
  }, [refreshQueue]);

  // Purge synced items
  const purgeSynced = useCallback(async () => {
    const count = await syncService.purgeSynced();
    await refreshQueue();
    return count;
  }, [refreshQueue]);

  // Clear entire queue
  const clearQueue = useCallback(async () => {
    await syncService.clearQueue();
    await refreshQueue();
  }, [refreshQueue]);

  const value = {
    syncStatus: !isOnline ? 'OFFLINE' : syncState.syncStatus,
    isSyncing: syncState.isSyncing,
    lastSyncTime: syncState.lastSyncTime,
    lastError: syncState.lastError,
    queueItems,
    pendingCount,
    triggerSync,
    queueAction,
    retryFailed,
    purgeSynced,
    clearQueue,
    refreshQueue,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}

export default SyncContext;
