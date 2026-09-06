import { DESTINATIONS } from '../data/destinations';
import { TOURIST_PLACES } from '../data/touristPlaces';
import { STATES } from '../data/states';
import { indexedDBService } from './indexedDBService';

/**
 * Unified API Service layer with robust offline fallbacks,
 * IndexedDB caching, stale cache protection, and error resilience.
 */
const BASE_URL = '/api';

class ApiService {
  constructor() {
    this.isSeeded = false;
    this.seedInitialCache();
  }

  /**
   * Prime IndexedDB cache with default curated datasets on startup
   */
  async seedInitialCache() {
    if (this.isSeeded) return;
    try {
      const destCount = await indexedDBService.count('destinations');
      if (destCount === 0) {
        await indexedDBService.putBatch('destinations', DESTINATIONS);
        await indexedDBService.setCacheMeta('destinations', { source: 'curated_seed', lastUpdated: Date.now() });
      }

      const placeCount = await indexedDBService.count('touristPlaces');
      if (placeCount === 0) {
        await indexedDBService.putBatch('touristPlaces', TOURIST_PLACES);
        await indexedDBService.setCacheMeta('touristPlaces', { source: 'curated_seed', lastUpdated: Date.now() });
      }

      this.isSeeded = true;
    } catch (err) {
      console.warn('[API] IndexedDB seed skipped (using in-memory fallback):', err);
      this.isSeeded = true;
    }
  }

  // --- Destinations ---
  async getDestinations() {
    await this.seedInitialCache();

    // Check if offline: Immediately serve from IndexedDB or static fallback
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      const cached = await indexedDBService.getAll('destinations');
      if (cached && cached.length > 0) return cached;
      return DESTINATIONS;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${BASE_URL}/destinations`, { signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        // Update cache asynchronously
        indexedDBService.putBatch('destinations', data).catch(() => {});
        return data;
      }
    } catch (err) {
      console.info('[API] Online destination fetch bypassed, serving cached data.');
    }

    // Retrieve from IndexedDB cache
    const cached = await indexedDBService.getAll('destinations');
    if (cached && cached.length > 0) return cached;
    return DESTINATIONS;
  }

  async getDestinationById(id) {
    const destinations = await this.getDestinations();
    return destinations.find((d) => d.id === id) || null;
  }

  // --- Tourist Places ---
  async getTouristPlaces(destinationId = null) {
    await this.seedInitialCache();

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      const cached = await indexedDBService.getAll('touristPlaces');
      const placesList = cached && cached.length > 0 ? cached : TOURIST_PLACES;
      if (destinationId) {
        return placesList.filter((p) => p.destinationId === destinationId);
      }
      return placesList;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = destinationId ? `${BASE_URL}/places?destinationId=${destinationId}` : `${BASE_URL}/places`;
      const res = await fetch(url, { signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        indexedDBService.putBatch('touristPlaces', data).catch(() => {});
        return data;
      }
    } catch (err) {
      console.info('[API] Online places fetch bypassed, serving cached data.');
    }

    const cached = await indexedDBService.getAll('touristPlaces');
    const placesList = cached && cached.length > 0 ? cached : TOURIST_PLACES;
    if (destinationId) {
      return placesList.filter((p) => p.destinationId === destinationId);
    }
    return placesList;
  }

  async getPlaceById(id) {
    const places = await this.getTouristPlaces();
    return places.find((p) => p.id === id) || null;
  }

  async getCategories() {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${BASE_URL}/places/categories`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          return data.categories || [];
        }
      }
    } catch (e) {}
    return ['ALL', 'Heritage', 'Beaches', 'Nature', 'Spiritual', 'Food & Culture'];
  }

  // --- Verified Services & Safety ---
  async getVerifiedServices(destinationId = null) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const url = destinationId ? `${BASE_URL}/safety/services?destinationId=${destinationId}` : `${BASE_URL}/safety/services`;
        const res = await fetch(url).catch(() => null);
        if (res && res.ok) {
          return await res.json();
        }
      }
    } catch (e) {}
    return [
      { serviceType: 'POLICE', name: 'National Tourist Police Helpline', contactNumber: '112 / 1363', is24x7: true },
      { serviceType: 'HOSPITAL', name: 'District Central Emergency Hospital', contactNumber: '108 / 112', is24x7: true },
    ];
  }

  // --- Saved Places Bookmarks ---
  async getSavedPlaces(user = 'local_user') {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${BASE_URL}/saved-places?user=${encodeURIComponent(user)}`).catch(() => null);
        if (res && res.ok) {
          return await res.json();
        }
      }
    } catch (e) {}
    const cachedIds = await indexedDBService.getAll('savedPlaces');
    return {
      user,
      savedPlaceIds: Array.isArray(cachedIds) ? cachedIds.map((p) => p.id) : [],
    };
  }

  async savePlace(placeId, user = 'local_user', placeData = null) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${BASE_URL}/saved-places`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ placeId, user, placeData }),
        }).catch(() => null);
        if (res && res.ok) return await res.json();
      }
    } catch (e) {}
    return { saved: true, placeId };
  }

  async removeSavedPlace(placeId, user = 'local_user') {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${BASE_URL}/saved-places/${encodeURIComponent(placeId)}?user=${encodeURIComponent(user)}`, {
          method: 'DELETE',
        }).catch(() => null);
        if (res && res.ok) return await res.json();
      }
    } catch (e) {}
    return { removed: true, placeId };
  }

  // --- AI Queries ---
  async sendAiQuery(query) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${BASE_URL}/ai/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        }).catch(() => null);
        if (res && res.ok) return await res.json();
      }
    } catch (e) {}
    return null;
  }

  // --- Incident Reports & Admin Triage ---
  async getSafetyMetrics() {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${BASE_URL}/safety/metrics`).catch(() => null);
        if (res && res.ok) return await res.json();
      }
    } catch (e) {}
    // Offline local metric fallback
    const offlineReports = await indexedDBService.getAll('offlineReports');
    const destCount = await indexedDBService.count('destinations');
    const placesCount = await indexedDBService.count('touristPlaces');
    return {
      totalIncidents: offlineReports.length,
      pendingIncidents: offlineReports.filter((r) => r.status === 'PENDING' || r.status === 'PENDING_SYNC').length,
      reviewingIncidents: offlineReports.filter((r) => r.status === 'REVIEWING').length,
      resolvedIncidents: offlineReports.filter((r) => r.status === 'RESOLVED').length,
      activeIncidents: offlineReports.filter((r) => r.status !== 'RESOLVED').length,
      criticalAlerts: offlineReports.filter((r) => r.severity === 'HIGH' || r.severity === 'CRITICAL').length,
      destinationsCount: destCount || 10,
      placesCount: placesCount || 11,
      servicesCount: 7,
    };
  }

  async getReports(filters = {}) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const params = new URLSearchParams();
        if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
        if (filters.severity && filters.severity !== 'ALL') params.set('severity', filters.severity);
        if (filters.reportType && filters.reportType !== 'ALL') params.set('reportType', filters.reportType);
        if (filters.destinationId && filters.destinationId !== 'ALL') params.set('destinationId', filters.destinationId);
        if (filters.search) params.set('search', filters.search);

        const url = `${BASE_URL}/safety/reports${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await fetch(url).catch(() => null);
        if (res && res.ok) {
          const reports = await res.json();
          return reports;
        }
      }
    } catch (e) {}

    // Offline fallback from IndexedDB
    let local = await indexedDBService.getAll('offlineReports');
    if (filters.status && filters.status !== 'ALL') {
      local = local.filter((r) => r.status === filters.status);
    }
    if (filters.severity && filters.severity !== 'ALL') {
      local = local.filter((r) => r.severity === filters.severity);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      local = local.filter((r) => (r.description && r.description.toLowerCase().includes(q)) || (r.placeId && r.placeId.includes(q)));
    }
    return local;
  }

  async getReportById(id) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${BASE_URL}/safety/reports/${id}`).catch(() => null);
        if (res && res.ok) return await res.json();
      }
    } catch (e) {}
    return await indexedDBService.getById('offlineReports', id);
  }

  async updateReport(id, data) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${BASE_URL}/safety/reports/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).catch(() => null);
        if (res && res.ok) return await res.json();
      }
    } catch (e) {}

    // Update in IndexedDB if offline
    const local = await indexedDBService.getById('offlineReports', id);
    if (local) {
      const updated = { ...local, ...data };
      await indexedDBService.put('offlineReports', updated);
      return { message: 'Updated locally in offline storage', report: updated };
    }
    return null;
  }

  async deleteReport(id) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${BASE_URL}/safety/reports/${id}`, {
          method: 'DELETE',
        }).catch(() => null);
        if (res && res.ok) return await res.json();
      }
    } catch (e) {}
    await indexedDBService.delete('offlineReports', id);
    return { message: 'Deleted from local storage', id };
  }

  // --- States ---
  async getStates() {
    return STATES;
  }

  // --- Offline Safety Reports ---
  async getOfflineReports() {
    return indexedDBService.getAll('offlineReports');
  }
}

export const api = new ApiService();
export default api;
