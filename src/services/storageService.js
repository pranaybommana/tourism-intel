/**
 * LocalStorage management service with namespace isolation and JSON parsing
 */
const PREFIX = 'tourism_intel_';

export const storageService = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`${PREFIX}${key}`);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (err) {
      console.warn(`[storageService] Failed to read ${key}:`, err);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`[storageService] Failed to write ${key}:`, err);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(`${PREFIX}${key}`);
    } catch (err) {
      console.warn(`[storageService] Failed to remove ${key}:`, err);
    }
  },

  clear() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
      keys.forEach(k => localStorage.removeItem(k));
    } catch (err) {
      console.warn(`[storageService] Failed to clear storage:`, err);
    }
  },
};

export default storageService;
