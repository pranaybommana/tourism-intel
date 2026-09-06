/**
 * Core Application State Constants for Tourism Intel
 */
export const APP_STATES = {
  ONLINE: 'ONLINE',
  LOW_CONNECTIVITY: 'LOW_CONNECTIVITY',
  OFFLINE_SAFETY: 'OFFLINE_SAFETY',
  LOW_BATTERY: 'LOW_BATTERY',
};

export const APP_STATE_META = {
  [APP_STATES.ONLINE]: {
    label: 'Online',
    description: 'Full real-time intelligence, live map routing, and dynamic updates.',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    color: 'emerald',
    syncMode: 'realtime',
    allowsHeavyAssets: true,
  },
  [APP_STATES.LOW_CONNECTIVITY]: {
    label: 'Low Connectivity',
    description: 'Optimized low-bandwidth mode. Lightweight metadata and cached assets prioritized.',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    color: 'amber',
    syncMode: 'lazy',
    allowsHeavyAssets: false,
  },
  [APP_STATES.OFFLINE_SAFETY]: {
    label: 'Offline Safety Mode',
    description: 'Zero network available. Emergency safe zones, offline SOS hotspots, and cached guides active.',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-glow',
    color: 'cyan',
    syncMode: 'offline_only',
    allowsHeavyAssets: false,
  },
  [APP_STATES.LOW_BATTERY]: {
    label: 'Battery Saver',
    description: 'Power conservation mode. Animations and non-critical GPS polling restricted.',
    badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    color: 'rose',
    syncMode: 'conservative',
    allowsHeavyAssets: false,
  },
};
