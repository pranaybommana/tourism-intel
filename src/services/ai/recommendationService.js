import { DESTINATIONS } from '../../data/destinations';
import { TOURIST_PLACES } from '../../data/touristPlaces';

/**
 * Score calculation weights based on user preferences.
 */
function getWeights(safetyPriority = 'standard', crowdPreference = 'balanced') {
  let safetyWeight = safetyPriority === 'high' ? 0.45 : 0.30;
  let crowdWeight = crowdPreference === 'low' ? 0.35 : crowdPreference === 'balanced' ? 0.25 : 0.15;
  let categoryWeight = 0.30;
  let sustainabilityWeight = 0.15;

  const total = safetyWeight + crowdWeight + categoryWeight + sustainabilityWeight;
  return {
    safety: safetyWeight / total,
    crowd: crowdWeight / total,
    category: categoryWeight / total,
    sustainability: sustainabilityWeight / total,
  };
}

/**
 * Map crowd level string to normalized score (0.0 to 1.0)
 */
function getCrowdScore(level, preference = 'balanced') {
  const cl = String(level || '').toLowerCase();
  if (preference === 'low') {
    if (cl === 'low') return 1.0;
    if (cl === 'moderate' || cl === 'medium') return 0.55;
    if (cl === 'high') return 0.20;
    if (cl === 'very high') return 0.05;
    return 0.50;
  }
  if (preference === 'any') return 0.85;
  // Balanced default
  if (cl === 'low') return 0.95;
  if (cl === 'moderate' || cl === 'medium') return 0.85;
  if (cl === 'high') return 0.45;
  if (cl === 'very high') return 0.20;
  return 0.60;
}

/**
 * Map safety level to normalized score (0.0 to 1.0)
 */
function getSafetyScore(level, priority = 'standard') {
  const l = String(level || 'SAFE').toUpperCase();
  if (priority === 'high') {
    if (l === 'SAFE') return 1.0;
    if (l === 'MODERATE') return 0.65;
    if (l === 'CAUTION') return 0.30;
    if (l === 'RESTRICTED') return 0.10;
    return 0.50;
  }
  if (l === 'SAFE') return 1.0;
  if (l === 'MODERATE') return 0.75;
  if (l === 'CAUTION') return 0.45;
  if (l === 'RESTRICTED') return 0.20;
  return 0.65;
}

/**
 * Check category/interest match score
 */
function getCategoryMatchScore(placeCategory, userPreference) {
  if (!userPreference || userPreference === 'ALL') return 0.85;
  const pCat = String(placeCategory || '').toLowerCase();
  const uPref = String(userPreference || '').toLowerCase();

  if (pCat === uPref) return 1.0;
  if (uPref === 'relaxed' && (pCat.includes('nature') || pCat.includes('beach') || pCat.includes('spiritual'))) return 0.95;
  if (uPref === 'family friendly' && (pCat.includes('heritage') || pCat.includes('nature') || pCat.includes('culture'))) return 0.95;
  if (pCat.includes(uPref) || uPref.includes(pCat)) return 0.90;
  return 0.25;
}

/**
 * Build dynamic explanation based on actual place fields and user inputs
 */
function buildExplanation(place, prefs = {}) {
  const reasons = [];
  const crowd = String(place.crowdLevel || '').toLowerCase();
  const safety = String(place.safetyLevel || 'SAFE').toUpperCase();
  const pref = prefs.preference || prefs.category || 'ALL';

  if (pref !== 'ALL') {
    reasons.push(`Matches your ${pref} travel interest`);
  }

  if (crowd === 'low') {
    reasons.push('lower visitor crowd density for comfortable exploration');
  } else if (crowd === 'moderate' || crowd === 'medium') {
    reasons.push('balanced visitor flow during peak hours');
  }

  if (safety === 'SAFE') {
    reasons.push('verified high safety rating with nearby response stations');
  } else if (safety === 'MODERATE') {
    reasons.push('standard verified tourist corridor rating');
  }

  if (place.duration) {
    reasons.push(`manageable ${place.duration} recommended stay`);
  }

  if (reasons.length === 0) {
    return 'Balanced destination recommendation based on verified safety and visitor pacing indicators.';
  }

  return reasons.join(', ') + '.';
}

/**
 * Score and rank tourist places with multi-factor weighting.
 */
export function getRecommendations(options = {}) {
  const {
    destinationId,
    places: customPlaces,
    preference = 'ALL',
    crowdPreference = 'balanced', // 'low' | 'balanced' | 'any'
    safetyPriority = 'standard', // 'standard' | 'high'
    limit = 4,
  } = options;

  let pool = Array.isArray(customPlaces) && customPlaces.length > 0
    ? [...customPlaces]
    : [...TOURIST_PLACES];

  // Filter by destination if provided
  if (destinationId && destinationId !== 'ALL') {
    pool = pool.filter((p) => p.destinationId === destinationId);
  }

  const weights = getWeights(safetyPriority, crowdPreference);

  // Score each candidate
  const scoredPlaces = pool.map((place) => {
    const safetyVal = getSafetyScore(place.safetyLevel, safetyPriority);
    const crowdVal = getCrowdScore(place.crowdLevel, crowdPreference);
    const catVal = getCategoryMatchScore(place.category, preference);
    const sustainVal = (place.sustainabilityScore || 85) / 100;

    const composite =
      (safetyVal * weights.safety +
        crowdVal * weights.crowd +
        catVal * weights.category +
        sustainVal * weights.sustainability) *
      100;

    const finalScore = Math.min(99, Math.max(50, Math.round(composite)));
    const reasonText = buildExplanation(place, { preference, crowdPreference, safetyPriority });

    return {
      ...place,
      recommendationScore: finalScore,
      recommendationReason: reasonText,
      safetyScoreVal: Math.round(safetyVal * 100),
      crowdScoreVal: Math.round(crowdVal * 100),
      sustainabilityScoreVal: Math.round(sustainVal * 100),
      sourceLabel: 'Demo AI Intelligence',
    };
  });

  // Sort descending by score
  scoredPlaces.sort((a, b) => b.recommendationScore - a.recommendationScore);

  const topPick = scoredPlaces[0] || null;
  const alternatives = scoredPlaces.slice(1, limit + 1);

  // Identify a less-crowded alternative if top pick is moderate/high
  let lessCrowdedAlternative = null;
  if (topPick && String(topPick.crowdLevel).toLowerCase() !== 'low') {
    lessCrowdedAlternative = scoredPlaces.find(
      (p) => p.id !== topPick.id && String(p.crowdLevel).toLowerCase() === 'low'
    ) || null;
  }

  // Identify a safety-first alternative if top pick isn't top tier safe
  let saferAlternative = null;
  if (topPick && String(topPick.safetyLevel).toUpperCase() !== 'SAFE') {
    saferAlternative = scoredPlaces.find(
      (p) => p.id !== topPick.id && String(p.safetyLevel).toUpperCase() === 'SAFE'
    ) || null;
  }

  return {
    topPick,
    alternatives,
    lessCrowdedAlternative,
    saferAlternative,
    allScored: scoredPlaces.slice(0, limit),
  };
}

/**
 * Return recommended DESTINATIONS for a given query/intent.
 */
export function recommendDestinations(intent = 'safest', limit = 4) {
  let pool = [...DESTINATIONS];

  if (intent === 'heritage') {
    const heritageIds = new Set(
      TOURIST_PLACES.filter((p) => p.category === 'Heritage').map((p) => p.destinationId)
    );
    pool = pool.filter((d) => heritageIds.has(d.id));
  } else if (intent === 'beach') {
    const beachIds = new Set(
      TOURIST_PLACES.filter((p) => p.category === 'Beaches').map((p) => p.destinationId)
    );
    pool = pool.filter((d) => beachIds.has(d.id));
  } else if (intent === 'hill') {
    const hillIds = new Set(
      TOURIST_PLACES.filter((p) => p.category === 'Hill Stations').map((p) => p.destinationId)
    );
    pool = pool.filter((d) => hillIds.has(d.id));
  }

  const scored = pool.map((dest) => {
    const places = TOURIST_PLACES.filter((p) => p.destinationId === dest.id);
    const lowCrowd = places.filter((p) => String(p.crowdLevel).toLowerCase() === 'low').length;
    const safePlaces = places.filter((p) => String(p.safetyLevel).toUpperCase() === 'SAFE').length;
    const score = Math.round(
      getSafetyScore(dest.safetyLevel) * 45 +
        (lowCrowd / Math.max(1, places.length)) * 30 +
        (safePlaces / Math.max(1, places.length)) * 25
    );
    return { dest, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => ({
    ...item.dest,
    recommendationScore: item.score,
    sourceLabel: 'Demo AI Intelligence',
  }));
}

export default {
  getRecommendations,
  recommendDestinations,
};

