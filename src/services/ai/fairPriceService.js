/**
 * FairPrice AI — Prototype Transport Price Intelligence
 * All price ranges are demo estimates. Not real-time commercial data.
 */

/** Demo base rates per km (INR) */
const BASE_RATES = {
  auto:        { perKm: 15,  base: 30,  label: "Auto Rickshaw" },
  cab:         { perKm: 18,  base: 50,  label: "App Cab / Taxi" },
  bus:         { perKm: 3,   base: 10,  label: "City Bus" },
  metro:       { perKm: 2.5, base: 10,  label: "Metro Rail" },
  rental_bike: { perKm: 5,   base: 100, label: "Rental Bike (per day incl.)" },
  boat:        { perKm: 25,  base: 50,  label: "Ferry / Boat" },
  tonga:       { perKm: 20,  base: 40,  label: "Tonga / Horse Carriage" },
};

/** Tourist premium surcharge factor (common at major sites) */
const TOURIST_PREMIUM = 1.3;

/**
 * Evaluate quoted price for a given transport type and distance.
 * @param {string} transportType - 'auto' | 'cab' | 'bus' | 'metro' | 'rental_bike'
 * @param {number} distanceKm
 * @param {number} quotedPrice - INR quoted by driver/service
 * @param {boolean} isTouristArea
 * @returns FairPrice result object
 */
export function evaluateFairPrice({ transportType, distanceKm, quotedPrice, isTouristArea = true }) {
  const type = String(transportType).toLowerCase().replace(" ", "_");
  const rate = BASE_RATES[type] || BASE_RATES.cab;
  const dist = parseFloat(distanceKm) || 3;
  const quoted = parseFloat(quotedPrice) || 0;

  const localFare = Math.round(rate.base + rate.perKm * dist);
  const touristFare = Math.round(localFare * TOURIST_PREMIUM);

  const expectedMin = isTouristArea ? localFare : Math.round(localFare * 0.85);
  const expectedMax = isTouristArea ? touristFare : localFare;

  const overchargeAmount = Math.max(0, quoted - expectedMax);
  const overchargePercent = expectedMax > 0 ? Math.round((overchargeAmount / expectedMax) * 100) : 0;

  let riskLevel, recommendation;
  if (quoted <= expectedMax) {
    riskLevel = "FAIR";
    recommendation = `The quoted price of ₹${quoted} is within the expected range of ₹${expectedMin}–₹${expectedMax}. Proceed safely.`;
  } else if (overchargePercent <= 30) {
    riskLevel = "MODERATE";
    recommendation = `Slightly above expected range. Try negotiating to ₹${expectedMax}. Use the app meter if available.`;
  } else if (overchargePercent <= 70) {
    riskLevel = "HIGH";
    recommendation = `Significant overcharge detected (≈${overchargePercent}% above estimate). Use an app cab or Tourist Helpline 1363.`;
  } else {
    riskLevel = "CRITICAL";
    recommendation = `Severe overcharge risk (≈${overchargePercent}% above estimate). Refuse and contact Tourist Police 1363.`;
  }

  return {
    transportLabel: rate.label,
    distanceKm: dist,
    quotedPrice: quoted,
    expectedMin,
    expectedMax,
    overchargeAmount,
    overchargePercent,
    riskLevel,
    recommendation,
    sourceLabel: "Demo Price Intelligence — Prototype Estimates Only",
  };
}

/** Return available transport types */
export function getTransportTypes() {
  return Object.entries(BASE_RATES).map(([id, r]) => ({ id, label: r.label }));
}
