/**
 * aiService.js — Legacy compatibility shim.
 * Delegates to the modular AI services introduced in Phase 4.
 * All logic is rule-based / demo intelligence. No paid API required.
 */
export { processChat as processQuery } from "./ai/chatbotService";
export { getRecommendations, recommendDestinations } from "./ai/recommendationService";
export { evaluateFairPrice, getTransportTypes } from "./ai/fairPriceService";
export { recognizeLandmark, getLandmarkCategories } from "./ai/landmarkService";
export { detectWaste, WASTE_TYPES } from "./ai/wasteDetectionService";

// Default export preserves backwards compatibility for existing AssistantPage
import { processChat } from "./ai/chatbotService";
export const aiService = { processQuery: processChat };
export default aiService;
