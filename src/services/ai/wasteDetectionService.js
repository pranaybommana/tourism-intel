/**
 * Waste Detection Simulation — Demo AI module.
 * Does NOT require an external computer vision API.
 * Simulates detection results for the Report Issue flow.
 */

export const WASTE_TYPES = [
  {
    id: "plastic",
    label: "Plastic Waste",
    emoji: "🧴",
    baseConfidence: 94,
    severity: "HIGH",
    description: "Single-use plastic bags, bottles, or packaging detected near tourist area.",
    reportCategory: "Plastic & Recyclable Waste",
    urgency: "Report within 24 hours",
  },
  {
    id: "general",
    label: "General Waste",
    emoji: "🗑️",
    baseConfidence: 88,
    severity: "MEDIUM",
    description: "Mixed solid waste accumulation. Requires scheduled cleaning or bin placement.",
    reportCategory: "General Solid Waste",
    urgency: "Report when convenient",
  },
  {
    id: "overflowing_bin",
    label: "Overflowing Bin",
    emoji: "📦",
    baseConfidence: 97,
    severity: "HIGH",
    description: "Public dustbin at or over capacity. Immediate attention from municipal services required.",
    reportCategory: "Bin Overflow",
    urgency: "Report immediately",
  },
  {
    id: "mixed",
    label: "Mixed Waste Dump",
    emoji: "⚠️",
    baseConfidence: 91,
    severity: "CRITICAL",
    description: "Unsegregated dump with possible hazardous materials. Tourist heritage site at risk.",
    reportCategory: "Illegal Dump / Mixed Waste",
    urgency: "Report immediately",
  },
  {
    id: "food",
    label: "Food & Organic Waste",
    emoji: "🍌",
    baseConfidence: 85,
    severity: "LOW",
    description: "Organic waste attracting pests near tourist zone. Requires prompt composting or removal.",
    reportCategory: "Organic / Food Waste",
    urgency: "Report within 48 hours",
  },
];

/**
 * Simulate waste detection for a given waste type ID.
 * Returns a detection result after a simulated scan delay.
 */
export async function detectWaste(wasteTypeId = null) {
  // Simulate scan processing time
  await new Promise((r) => setTimeout(r, 1500));

  const wasteType = wasteTypeId
    ? WASTE_TYPES.find((w) => w.id === wasteTypeId)
    : WASTE_TYPES[Math.floor(Math.random() * WASTE_TYPES.length)];

  if (!wasteType) {
    return { detected: false, message: "Unable to identify waste type. Please try again." };
  }

  // Slightly vary confidence (±3%)
  const variance = Math.floor(Math.random() * 7) - 3;
  const finalConfidence = Math.min(99, Math.max(70, wasteType.baseConfidence + variance));

  return {
    detected: true,
    wasteType,
    confidence: finalConfidence,
    severity: wasteType.severity,
    description: wasteType.description,
    reportCategory: wasteType.reportCategory,
    urgency: wasteType.urgency,
    sourceLabel: "Demo AI Vision Simulation — Prototype Intelligence",
    note: "Detection confidence values are demonstration estimates.",
    reportPayload: {
      category: wasteType.reportCategory,
      severity: wasteType.severity,
      confidence: finalConfidence,
      description: wasteType.description,
      detectedAt: new Date().toISOString(),
    },
  };
}

export default { detectWaste, WASTE_TYPES };
