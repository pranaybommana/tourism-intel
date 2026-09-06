/**
 * Safety level metadata and helpers for Tourism Intel
 */
export const SAFETY_LEVELS = {
  SAFE: {
    label: 'High Safety',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Well-patrolled tourist zone with verified facilities and 24/7 security presence.',
  },
  MODERATE: {
    label: 'Moderate Safety',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Standard tourist area. Remain mindful of belongings and avoid deserted alleys after dark.',
  },
  CAUTION: {
    label: 'Exercise Caution',
    color: 'orange',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    description: 'High crowd density or remote terrain. Follow marked trails and stay in groups.',
  },
  RESTRICTED: {
    label: 'Restricted / Check Advisory',
    color: 'rose',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    description: 'Entry permits or safety escort recommended. Check local advisories before visiting.',
  },
};

export function getSafetyConfig(level = 'SAFE') {
  const normalized = String(level).toUpperCase();
  return SAFETY_LEVELS[normalized] || SAFETY_LEVELS.SAFE;
}

export function formatCrowdLevel(level) {
  switch (String(level).toLowerCase()) {
    case 'low': return { label: 'Light Crowd', class: 'text-emerald-400' };
    case 'medium':
    case 'moderate': return { label: 'Moderate Crowd', class: 'text-sky-400' };
    case 'high': return { label: 'High Crowd', class: 'text-amber-400' };
    case 'very high': return { label: 'Heavy Crowd', class: 'text-rose-400' };
    default: return { label: level || 'Normal', class: 'text-slate-400' };
  }
}
