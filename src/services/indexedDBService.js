/**
 * Robust IndexedDB storage service with in-memory fallback,
 * cache metadata, stale cache detection, and sync queue support.
 */
const DB_NAME = 'TourismIntelDB';
const DB_VERSION = 2; // Incremented for syncQueue & cacheMeta object stores

class InMemoryStorageFallback {
  constructor() {
    this.stores = {
      destinations: new Map(),
      touristPlaces: new Map(),
      savedPlaces: new Map(),
      offlineReports: new Map(),
      syncQueue: new Map(),
      cacheMeta: new Map(),
    };
  }

  async getAll(storeName) {
    const store = this.stores[storeName] || new Map();
    return Array.from(store.values());
  }

  async getById(storeName, id) {
    const store = this.stores[storeName];
    if (!store) return null;
    return store.get(id) || null;
  }

  async put(storeName, value) {
    if (!this.stores[storeName]) {
      this.stores[storeName] = new Map();
    }
    const key = value.id || value.clientActionId || value.key || String(Date.now());
    this.stores[storeName].set(key, { ...value });
    return key;
  }

  async putBatch(storeName, items) {
    if (!Array.isArray(items)) return true;
    for (const item of items) {
      await this.put(storeName, item);
    }
    return true;
  }

  async delete(storeName, id) {
    const store = this.stores[storeName];
    if (store) {
      store.delete(id);
    }
    return true;
  }

  async clear(storeName) {
    const store = this.stores[storeName];
    if (store) {
      store.clear();
    }
    return true;
  }

  async count(storeName) {
    const store = this.stores[storeName];
    return store ? store.size : 0;
  }
}

class IndexedDBService {
  constructor() {
    this.db = null;
    this.isSupported = typeof window !== 'undefined' && Boolean(window.indexedDB);
    this.fallback = new InMemoryStorageFallback();
    this.initPromise = this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.info('[IndexedDBService] IndexedDB unavailable in this environment; utilizing in-memory fallback.');
      return null;
    }

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // 1. Destinations Store
          if (!db.objectStoreNames.contains('destinations')) {
            db.createObjectStore('destinations', { keyPath: 'id' });
          }

          // 2. Tourist Places Store
          if (!db.objectStoreNames.contains('touristPlaces')) {
            const placeStore = db.createObjectStore('touristPlaces', { keyPath: 'id' });
            placeStore.createIndex('destinationId', 'destinationId', { unique: false });
            placeStore.createIndex('category', 'category', { unique: false });
          }

          // 3. Saved Places Store
          if (!db.objectStoreNames.contains('savedPlaces')) {
            db.createObjectStore('savedPlaces', { keyPath: 'id' });
          }

          // 4. Offline Reports Store
          if (!db.objectStoreNames.contains('offlineReports')) {
            const reportStore = db.createObjectStore('offlineReports', { keyPath: 'id', autoIncrement: true });
            reportStore.createIndex('clientActionId', 'clientActionId', { unique: false });
          }

          // 5. Sync Queue Store for Reconnect Actions
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'clientActionId' });
            syncStore.createIndex('status', 'status', { unique: false });
            syncStore.createIndex('createdAt', 'createdAt', { unique: false });
          }

          // 6. Cache Metadata Store
          if (!db.objectStoreNames.contains('cacheMeta')) {
            db.createObjectStore('cacheMeta', { keyPath: 'key' });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this.db);
        };

        request.onerror = (event) => {
          console.warn('[IndexedDBService] Open failed, switching to memory fallback:', event.target.error);
          this.isSupported = false;
          resolve(null);
        };

        request.onblocked = () => {
          console.warn('[IndexedDBService] Database open blocked by another connection');
        };
      } catch (err) {
        console.warn('[IndexedDBService] Initialization exception:', err);
        this.isSupported = false;
        resolve(null);
      }
    });
  }

  async getStore(storeName, mode = 'readonly') {
    await this.initPromise;
    if (!this.db || !this.isSupported) return null;
    try {
      const tx = this.db.transaction(storeName, mode);
      return tx.objectStore(storeName);
    } catch (err) {
      console.warn(`[IndexedDBService] Failed to get transaction for ${storeName}:`, err);
      return null;
    }
  }

  async getAll(storeName) {
    try {
      const store = await this.getStore(storeName, 'readonly');
      if (!store) {
        return this.fallback.getAll(storeName);
      }

      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (err) => {
          console.warn(`[IndexedDBService] getAll error on ${storeName}:`, err);
          resolve(this.fallback.getAll(storeName));
        };
      });
    } catch (err) {
      return this.fallback.getAll(storeName);
    }
  }

  async getById(storeName, id) {
    if (!id) return null;
    try {
      const store = await this.getStore(storeName, 'readonly');
      if (!store) {
        return this.fallback.getById(storeName, id);
      }

      return new Promise((resolve) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(this.fallback.getById(storeName, id));
      });
    } catch (err) {
      return this.fallback.getById(storeName, id);
    }
  }

  async put(storeName, value) {
    if (!value) return null;
    try {
      const store = await this.getStore(storeName, 'readwrite');
      if (!store) {
        return this.fallback.put(storeName, value);
      }

      return new Promise((resolve, reject) => {
        const request = store.put(value);
        request.onsuccess = () => {
          // Also update cache metadata timestamp
          this.setCacheMeta(storeName, { lastUpdated: Date.now(), count: 1 }).catch(() => {});
          resolve(request.result);
        };
        request.onerror = (err) => {
          console.warn(`[IndexedDBService] put failed on ${storeName}:`, err);
          this.fallback.put(storeName, value).then(resolve).catch(reject);
        };
      });
    } catch (err) {
      return this.fallback.put(storeName, value);
    }
  }

  async putBatch(storeName, items) {
    if (!Array.isArray(items) || items.length === 0) return true;
    try {
      await this.initPromise;
      if (!this.db || !this.isSupported) {
        return this.fallback.putBatch(storeName, items);
      }

      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);

          // Deduplicate items by key before writing
          const seenKeys = new Set();
          items.forEach((item) => {
            const key = item.id || item.clientActionId || item.key;
            if (key) {
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                store.put(item);
              }
            } else {
              store.put(item);
            }
          });

          tx.oncomplete = () => {
            this.setCacheMeta(storeName, { lastUpdated: Date.now(), count: items.length }).catch(() => {});
            resolve(true);
          };

          tx.onerror = (err) => {
            console.warn(`[IndexedDBService] putBatch error on ${storeName}:`, err);
            this.fallback.putBatch(storeName, items).then(() => resolve(true));
          };
        } catch (txErr) {
          console.warn(`[IndexedDBService] Transaction error in putBatch:`, txErr);
          this.fallback.putBatch(storeName, items).then(() => resolve(true));
        }
      });
    } catch (err) {
      return this.fallback.putBatch(storeName, items);
    }
  }

  async delete(storeName, id) {
    if (!id) return true;
    try {
      const store = await this.getStore(storeName, 'readwrite');
      if (!store) {
        return this.fallback.delete(storeName, id);
      }

      return new Promise((resolve) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          this.fallback.delete(storeName, id).then(resolve);
        };
      });
    } catch (err) {
      return this.fallback.delete(storeName, id);
    }
  }

  async clear(storeName) {
    try {
      const store = await this.getStore(storeName, 'readwrite');
      if (!store) {
        return this.fallback.clear(storeName);
      }

      return new Promise((resolve) => {
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          this.fallback.clear(storeName).then(resolve);
        };
      });
    } catch (err) {
      return this.fallback.clear(storeName);
    }
  }

  async count(storeName) {
    try {
      const store = await this.getStore(storeName, 'readonly');
      if (!store) {
        return this.fallback.count(storeName);
      }

      return new Promise((resolve) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result || 0);
        request.onerror = () => resolve(this.fallback.count(storeName));
      });
    } catch (err) {
      return this.fallback.count(storeName);
    }
  }

  // --- Cache Metadata & Stale Handling ---
  async setCacheMeta(key, data) {
    try {
      const meta = {
        key,
        lastUpdated: Date.now(),
        ...data,
      };
      const store = await this.getStore('cacheMeta', 'readwrite');
      if (store) {
        store.put(meta);
      } else {
        this.fallback.put('cacheMeta', meta);
      }
    } catch (err) {
      // Non-critical cache metadata failure
    }
  }

  async getCacheMeta(key) {
    try {
      const store = await this.getStore('cacheMeta', 'readonly');
      if (!store) {
        return this.fallback.getById('cacheMeta', key);
      }
      return new Promise((resolve) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch (err) {
      return null;
    }
  }

  /**
   * Check if a cached dataset is older than maxAgeMs (default 24 hours)
   */
  async isCacheStale(key, maxAgeMs = 24 * 60 * 60 * 1000) {
    const meta = await this.getCacheMeta(key);
    if (!meta || !meta.lastUpdated) return true;
    return Date.now() - meta.lastUpdated > maxAgeMs;
  }
}

export const indexedDBService = new IndexedDBService();
export default indexedDBService;
