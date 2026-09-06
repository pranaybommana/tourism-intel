import { TOURIST_PLACES } from "../../data/touristPlaces";
import { DESTINATIONS } from "../../data/destinations";
import {
  getRecommendations,
  recommendDestinations,
} from "./recommendationService";

const DELAY_MS = 400;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** Utility: pick top N results */
const top = (arr, n = 3) => arr.slice(0, n);

/** Crowd label helper */
function crowdLabel(level, isTelugu = false) {
  const cl = String(level).toLowerCase();

  if (isTelugu) {
    if (cl === "low") return "తక్కువ రద్దీ (Light Crowd)";
    if (cl === "moderate" || cl === "medium") return "మధ్యస్థ రద్దీ (Moderate Crowd)";
    if (cl === "high") return "ఎక్కువ రద్దీ (High Crowd)";
    return "రద్దీ";
  }

  if (cl === "low") return "light crowd";
  if (cl === "moderate" || cl === "medium") return "moderate crowd";
  if (cl === "high") return "high crowd";

  return "crowd";
}

/**
 * Language / Intent Normalization Layer
 * Normalizes Telugu travel queries to semantic English tokens and intents
 * while retaining the user's language context.
 */
function normalizeQuery(rawInput, preferredLang = 'en-IN') {
  const text = String(rawInput || '').trim();
  const hasTeluguChars = /[\u0C00-\u0C7F]/.test(text);
  const isTelugu = hasTeluguChars || preferredLang === 'te-IN';

  let normalized = text.toLowerCase();

  // Telugu City and Place Entity Mapping
  const entityMap = [
    { telugu: /విశాఖపట్నం|వైజాగ్|విశాఖ/gi, english: 'Visakhapatnam' },
    { telugu: /బోర్రా గుహలు|బొర్రా గుహలు|గుహలు/gi, english: 'Borra Caves' },
    { telugu: /రుషికొండ|రిషికొండ/gi, english: 'Rishikonda Beach' },
    { telugu: /కైలాసగిరి/gi, english: 'Kailasagiri' },
    { telugu: /హైదరాబాద్|భాగ్యనగరం/gi, english: 'Hyderabad' },
    { telugu: /చార్మినార్/gi, english: 'Charminar' },
    { telugu: /గోల్కొండ|గోల్కొండ కోట/gi, english: 'Golconda Fort' },
    { telugu: /హుస్సేన్ సాగర్/gi, english: 'Hussain Sagar' },
    { telugu: /బిర్లా మందిర్/gi, english: 'Birla Mandir' },
    { telugu: /రామోజీ/gi, english: 'Ramoji Film City' },
    { telugu: /సాలార్ జంగ్/gi, english: 'Salar Jung Museum' },
    { telugu: /తిరుపతి/gi, english: 'Tirupati' },
    { telugu: /గోవా/gi, english: 'Goa' },
    { telugu: /జైపూర్/gi, english: 'Jaipur' },
    { telugu: /ఆగ్రా|తాజ్ మహల్|తాజ్/gi, english: 'Agra Taj Mahal' },
    { telugu: /వారణాసి|కాశీ/gi, english: 'Varanasi' },
    { telugu: /ఢిల్లీ/gi, english: 'Delhi' },
    { telugu: /ముంబై/gi, english: 'Mumbai' },
    { telugu: /ఊటీ/gi, english: 'Ooty' },
    { telugu: /అరకు|అరకు లోయ/gi, english: 'Araku Valley' },
    { telugu: /మనాలి/gi, english: 'Manali' },
    { telugu: /కొచ్చి/gi, english: 'Kochi' },
  ];

  // Telugu Intent Keywords
  const intentKeywords = [
    // Low crowd
    { telugu: /తక్కువ రద్దీ|రద్దీ తక్కువ|రద్దీ లేని|ప్రశాంతమైన|తక్కువ జనం/gi, english: 'less crowd quiet uncrowded' },
    // Fair price / Auto fare
    { telugu: /ధర|ఆటో ధర|ఎక్కువ ధర|ఖరీదు|ఛార్జీ|ఎక్కువ ఉందా|ఎక్కువైందా|ఎంత అవుతుంది|ఆటో/gi, english: 'auto fair price fare check cost' },
    // Safety
    { telugu: /సేఫ్|భద్రత|సురక్షిత|సేఫ్గా|రక్షణ|అత్యవసర|సహాయం|పోలీస్|ఆపద/gi, english: 'safe safety emergency police help' },
    // Route / Navigation
    { telugu: /ఎలా వెళ్లాలి|దారి|రూట్|నావిగేషన్|వెళ్లే మార్గం/gi, english: 'how to reach navigate directions route' },
    // Nearby / Attractions
    { telugu: /దగ్గరలో|నా దగ్గరలో|సమీపంలో|మంచి ప్రదేశం|చూడదగిన ప్రదేశాలు|దర్శనీయ స్థలాలు/gi, english: 'nearby attractions best places visit' },
    // Heritage
    { telugu: /చారిత్రక|కోట|వారసత్వ/gi, english: 'heritage historical fort' },
    // Nature / Beaches
    { telugu: /సముద్ర తీరం|బీచ్/gi, english: 'beach coast' },
    { telugu: /ప్రకృతి|కొండలు|జలపాతం/gi, english: 'nature scenic hill waterfall' },
  ];

  entityMap.forEach(({ telugu, english }) => {
    normalized = normalized.replace(telugu, ` ${english.toLowerCase()} `);
  });

  intentKeywords.forEach(({ telugu, english }) => {
    normalized = normalized.replace(telugu, ` ${english} `);
  });

  return {
    raw: text,
    normalized: normalized.replace(/\s+/g, ' ').trim(),
    isTelugu,
  };
}

/**
 * TravelGuard AI Chatbot
 * Processes user messages using rule-based pattern matching, Telugu-English intent normalization,
 * and local tourism datasets.
 */
export async function processChat(userInput, appContext = {}) {
  await delay(DELAY_MS + Math.random() * 200);

  const {
    selectedDestination,
    savedPlaceIds = [],
    isOffline = false,
    appState,
    language = 'en-IN',
  } = appContext;

  const { raw, normalized: input, isTelugu } = normalizeQuery(userInput, language);

  // Offline note
  const offlineNote = isOffline
    ? isTelugu
      ? "\n\n_గమనిక: ఆఫ్‌లైన్ డెమో ఇంటెలిజెన్స్ — స్థానికంగా సేవ్ చేసిన సమాచారాన్ని ఉపయోగిస్తున్నాము._"
      : "\n\n_Note: Offline Demo Intelligence — using locally saved destination data._"
    : "";

  // ── 1. Emergency / Safety ──
  if (
    /help|emergency|police|hospital|lost|sos|danger|unsafe|సేఫ్|భద్రత|సహాయం|పోలీస్|ఆపద/.test(input) ||
    /help|emergency|police|hospital|lost|sos|danger|unsafe/.test(raw.toLowerCase())
  ) {
    return {
      type: "safety_alert",
      confidence: 0.98,
      title: isTelugu ? "అత్యవసర భద్రతా సమాచారం (Emergency Safety)" : "Emergency Safety Intelligence",

      text: isTelugu
        ? `ధైర్యంగా ఉండండి. అత్యవసర సహాయం కోసం **112** (జాతీయ ఎమర్జెన్సీ) లేదా **1363** (టూరిస్ట్ పోలీస్ హెల్ప్‌లైన్) కు వెంటనే కాల్ చేయవచ్చు.\n\nమీరు సురక్షితంగా ప్రయాణించడానికి **Navigate page → Emergency SOS 112** బటన్ క్లిక్ చేసి పోలీస్ డెస్క్‌లకు మీ స్థానాన్ని పంపవచ్చు.${offlineNote}`
        : `Stay calm. In India, dial **112** (National Emergency) or **1363** (Tourist Police Helpline) for immediate assistance.\n\nIf you are on this app, use the **Navigate page → Emergency SOS 112** button to broadcast your coordinates to nearby police.${offlineNote}`,

      actions: [
        {
          label: isTelugu ? "నావిగేట్ & SOS తెరవండి" : "Open Navigate & SOS",
          link: "/navigate",
        },
        {
          label: "Tourist Helpline: 1363",
          href: "tel:1363",
        },
      ],

      sourceLabel: isTelugu ? "భద్రతా ప్రోటోకాల్ — ఆఫ్‌లైన్‌లో ఎల్లప్పుడూ అందుబాటులో ఉంటుంది" : "Safety Protocol — Always Offline Available",
    };
  }

  // ── 2. FairPrice / Auto Fare Queries (e.g. "ఈ ఆటో ధర ఎక్కువగా ఉందా?", "auto fare") ──
  if (
    /auto|fair price|fare|price|rate|cost|ధర|ఎక్కువ ధర|ఛార్జీ|ఎక్కువ ఉందా/.test(input)
  ) {
    return {
      type: "fair_price_guide",
      confidence: 0.94,
      title: isTelugu ? "FairPrice AI — రవాణా ధరల పరిశీలన" : "FairPrice AI — Transport Price Check",

      text: isTelugu
        ? `ఆటో లేదా క్యాబ్ ధర అధికంగా ఉందో లేదో తెలుసుకోవడానికి **FairPrice AI** ని ఉపయోగించండి:\n• స్థానిక ప్రాంత ప్రామాణిక ఆటో రేటు సుమారు ₹15/km (కనీస ఛార్జీ ₹30).\n• పర్యాటక ప్రాంతాల్లో రద్దీ ఛార్జీ సుమారు 20-30% వరకు ఉండవచ్చు.\n• అనవసరమైన అధిక ఛార్జీలు చెల్లించకుండా క్రింది బటన్ ద్వారా చెక్ చేయండి.${offlineNote}`
        : `To check whether your auto, cab, or bus fare is within reasonable limits, use **FairPrice AI**:\n• Standard auto rickshaw base fare is ₹30 + ₹15/km.\n• Tourist zones may include a standard 20–30% seasonal allowance.\n• Click below to run a deterministic price check against local rate cards.${offlineNote}`,

      actions: [
        {
          label: isTelugu ? "ధరను తనిఖీ చేయండి (FairPrice AI)" : "Check Fare with FairPrice AI",
          link: "/ai/fairprice",
        },
        {
          label: isTelugu ? "సురక్షిత నావిగేషన్" : "Navigate Safely",
          link: "/navigate",
        },
      ],

      sourceLabel: isTelugu ? "డెమో ప్రైస్ ఇంటెలిజెన్స్" : "Demo Price Intelligence",
    };
  }

  // ── 3. Less crowded places ──
  if (
    /less crowd|light crowd|quiet|uncrowded|avoid crowd|peaceful/.test(input)
  ) {
    // Check if user specified a city (e.g. "విశాఖపట్నంలో తక్కువ రద్దీ ఉన్న ప్రదేశం")
    const matchedDest = DESTINATIONS.find(
      (d) =>
        input.includes(d.name.toLowerCase()) ||
        input.includes(d.id.toLowerCase())
    );

    const recResult = getRecommendations({
      destinationId: matchedDest ? matchedDest.id : undefined,
      crowdPreference: 'low',
      limit: 3,
    });

    const recs = Array.isArray(recResult)
      ? recResult
      : (recResult.allScored || (recResult.topPick ? [recResult.topPick, ...(recResult.alternatives || [])] : []));

    if (!recs || recs.length === 0) {
      return noDataResponse(offlineNote, isTelugu);
    }

    const list = recs
      .map(
        (p) =>
          `• **${p.name}** (${p.destination}) — ${crowdLabel(p.crowdLevel, isTelugu)}, Safety: ${p.safetyLevel}`
      )
      .join("\n");

    const introText = isTelugu
      ? `డెమో క్రౌడ్ ఇంటెలిజెన్స్ ఆధారంగా ${matchedDest ? `**${matchedDest.name}** లో` : ''} తక్కువ రద్దీ ఉన్న ప్రశాంతమైన ప్రదేశాలు:`
      : `Based on demo crowd intelligence, here are quieter alternatives${matchedDest ? ` in **${matchedDest.name}**` : ''}:`;

    return {
      type: "recommendation",
      confidence: 0.93,
      title: isTelugu ? "తక్కువ రద్దీ ప్రదేశాల సిఫార్సులు" : "TravelGuard AI — Low Crowd Picks",

      text: `${introText}\n\n${list}${offlineNote}`,

      places: recs,

      actions: recs.slice(0, 1).map((p) => ({
        label: isTelugu ? `${p.name} కు నావిగేట్ చేయండి` : `Navigate to ${p.name}`,
        navigatePlace: p,
      })),

      sourceLabel: isTelugu ? "డెమో AI ఇంటెలిజెన్స్" : "Prototype Intelligence",
    };
  }

  // ── 4. Safer destinations ──
  if (
    /safer|most safe|safe destination|high safety|best safety/.test(input)
  ) {
    const recs = recommendDestinations("safest", 4);

    const list = recs
      .map(
        (d) =>
          `• **${d.name}** (${d.state}) — Safety: ${d.safetyLevel}, Score: ${d.recommendationScore}`
      )
      .join("\n");

    return {
      type: "recommendation",
      confidence: 0.94,
      title: isTelugu ? "అత్యంత సురక్షితమైన ప్రదేశాలు (Safest Destinations)" : "TravelGuard AI — Safest Destinations",

      text: isTelugu
        ? `ధృవీకరించబడిన భద్రతా సూచిక ప్రకారం భారతదేశంలో అత్యుత్తమ సురక్షిత గమ్యస్థానాలు ఇక్కడ ఉన్నాయి:\n\n${list}${offlineNote}`
        : `Here are top-rated safe destinations based on demo intelligence:\n\n${list}${offlineNote}`,

      destinations: recs,

      actions: [
        {
          label: isTelugu ? "గమ్యస్థానాలను అన్వేషించండి" : "Explore Destinations",
          link: "/explore",
        },
      ],

      sourceLabel: isTelugu ? "డెమో భద్రతా ఇంటెలిజెన్స్" : "Demo Intelligence",
    };
  }

  // ── 5. Specific place lookup (e.g. Borra Caves, Charminar) ──
  const matchedPlace = TOURIST_PLACES.find(
    (p) =>
      input.includes(p.name.toLowerCase()) ||
      (p.description && input.includes(p.description.toLowerCase().slice(0, 20)))
  );

  if (matchedPlace) {
    const text = isTelugu
      ? `**${matchedPlace.name}** (${matchedPlace.destination}, ${matchedPlace.state}) వివరాలు:\n\n• వర్గం: **${matchedPlace.category}**\n• ఉత్తమ సమయం: **${matchedPlace.bestTime}**\n• సందర్శన సమయం: **${matchedPlace.duration}**\n• రద్దీ సూచిక: **${crowdLabel(matchedPlace.crowdLevel, true)}**\n• భద్రతా స్థాయి: **${matchedPlace.safetyLevel}**\n\n_${matchedPlace.description}_${offlineNote}`
      : `**${matchedPlace.name}** is located in ${matchedPlace.destination}, ${matchedPlace.state}.\n\nCategory: ${matchedPlace.category}\nBest Time: ${matchedPlace.bestTime}\nDuration: ${matchedPlace.duration}\nCrowd: ${crowdLabel(matchedPlace.crowdLevel)}\nSafety: ${matchedPlace.safetyLevel}${offlineNote}`;

    return {
      type: "place_guide",
      confidence: 0.95,
      title: isTelugu ? `${matchedPlace.name} వివరాలు` : `${matchedPlace.name} Details`,

      text,

      places: [matchedPlace],

      actions: [
        {
          label: isTelugu ? `${matchedPlace.name} కు సురక్షితంగా నావిగేట్ చేయండి` : `Navigate to ${matchedPlace.name}`,
          navigatePlace: matchedPlace,
        },
      ],

      sourceLabel: isTelugu ? "డెమో ప్లేస్ ఇంటెలిజెన్స్" : "Prototype Intelligence",
    };
  }

  // ── 6. Specific city lookup (e.g. Visakhapatnam, Hyderabad, Goa) ──
  const matchedDest = DESTINATIONS.find(
    (d) =>
      input.includes(d.name.toLowerCase()) ||
      input.includes(d.id.toLowerCase()) ||
      input.includes(d.state.toLowerCase().split(" ")[0])
  );

  if (matchedDest) {
    const cityPlaces = TOURIST_PLACES.filter(
      (p) => p.destinationId === matchedDest.id
    );

    const topPlaces = top(cityPlaces, 4);

    const list = topPlaces
      .map(
        (p) =>
          `• **${p.name}** — ${p.category}, ${crowdLabel(p.crowdLevel, isTelugu)}`
      )
      .join("\n");

    const text = isTelugu
      ? `**${matchedDest.name}** (${matchedDest.state}) — భద్రతా రేటింగ్: **${matchedDest.safetyLevel}**, ఉత్తమ కాలం: **${matchedDest.bestSeason}**.\n\nప్రధాన దర్శనీయ స్థలాలు:\n${list}${offlineNote}`
      : `**${matchedDest.name}** (${matchedDest.state}) — Safety: ${matchedDest.safetyLevel}, Best Season: ${matchedDest.bestSeason}.\n\nTop ${topPlaces.length} attractions:\n${list}${offlineNote}`;

    return {
      type: "destination_guide",
      confidence: 0.94,
      title: isTelugu ? `${matchedDest.name} పర్యటన సమాచారం` : `${matchedDest.name} Travel Intelligence`,

      text,

      places: topPlaces,

      destination: matchedDest,

      actions: [
        {
          label: isTelugu ? `${matchedDest.name} అన్ని ప్రదేశాలు` : `Explore All in ${matchedDest.name}`,
          link: `/explore?city=${matchedDest.id}`,
        },
        {
          label: isTelugu ? "నగరానికి నావిగేట్ చేయండి" : "Navigate to City",
          link: `/navigate?city=${matchedDest.id}`,
        },
      ],

      sourceLabel: isTelugu ? "డెమో గమ్యస్థాన సమాచారం" : "Demo Destination Intelligence",
    };
  }

  // ── 7. Offline / saved places ──
  if (
    /offline|save|download|no internet|no signal|no connection|ఆఫ్‌లైన్|సేవ్/.test(input)
  ) {
    const saved = TOURIST_PLACES.filter((p) =>
      savedPlaceIds.includes(p.id)
    );

    if (saved.length > 0) {
      const list = saved
        .map((p) => `• **${p.name}** (${p.destination})`)
        .join("\n");

      return {
        type: "offline_info",
        confidence: 0.96,
        title: isTelugu ? "మీ ఆఫ్‌లైన్ సేవ్ చేసిన ప్రదేశాలు" : "Your Offline Saved Places",

        text: isTelugu
          ? `మీరు ఆఫ్‌లైన్ కోసం **${saved.length}** ప్రదేశం(లు) నిల్వ చేశారు:\n\n${list}\n\nవీటిని ఇంటర్నెట్ లేకుండా సురక్షితంగా చూడవచ్చు.`
          : `You have **${saved.length}** place(s) saved offline in IndexedDB:\n\n${list}\n\nThese are accessible without internet.`,

        places: saved,

        sourceLabel: isTelugu ? "స్థానిక డేటాబేస్ — ఆఫ్‌లైన్‌లో లభ్యం" : "Locally Cached — Available Offline",
      };
    }

    return {
      type: "offline_info",
      confidence: 0.88,
      title: isTelugu ? "ఆఫ్‌లైన్ మోడ్ మార్గదర్శకం" : "Offline Mode Guidance",

      text: isTelugu
        ? `ప్రస్తుతం ఆఫ్‌లైన్‌లో ఏ ప్రదేశాలూ సేవ్ చేయలేదు. Explore పేజీలో ఏదైనా ప్రదేశం వద్ద **"Save Offline"** బటన్ క్లిక్ చేసి ఇంటర్నెట్ లేని సమయాల్లోనూ ఉపయోగించుకోవచ్చు.${offlineNote}`
        : `No places are currently saved offline. Browse any destination, click **"Save Offline"** on a place card to bookmark it in IndexedDB for zero-signal access.${offlineNote}`,

      actions: [
        {
          label: isTelugu ? "ప్రదేశాలను చూడండి" : "Explore Destinations",
          link: "/explore",
        },
      ],

      sourceLabel: "Offline Mode",
    };
  }

  // ── 8. Category queries ──
  const categoryMap = {
    "beach|sea|coast|ocean|సముద్ర తీరం|బీచ్": "Beaches",
    "heritage|fort|palace|history|historical|చారిత్రక|కోట": "Heritage",
    "hill|mountain|shimla|darjeeling|mist|కొండలు": "Hill Stations",
    "spiritual|temple|ghat|pilgrimage|religious|ఆలయం|గుడి": "Spiritual",
    "nature|forest|lake|wildlife|bird|ప్రకృతి": "Nature",
    "food|culture|cuisine|eat|street food|ఆహారం": "Food & Culture",
    "adventure|trek|rafting|camp|climb|సాహసం": "Adventure",
  };

  for (const [pattern, cat] of Object.entries(categoryMap)) {
    if (new RegExp(pattern).test(input)) {
      const catPlaces = top(
        TOURIST_PLACES.filter((p) => p.category === cat),
        4
      );

      const list = catPlaces
        .map((p) => `• **${p.name}** (${p.destination})`)
        .join("\n");

      return {
        type: "category_recommendation",
        confidence: 0.90,
        title: isTelugu ? `టాప్ ${cat} పర్యాటక ప్రదేశాలు` : `TravelGuard AI — Top ${cat} Picks`,

        text: isTelugu
          ? `భారతదేశంలో ప్రసిద్ధి చెందిన **${cat}** పర్యాటక ఆకర్షణలు:\n\n${list}${offlineNote}`
          : `Here are recommended **${cat}** destinations across India:\n\n${list}${offlineNote}`,

        places: catPlaces,

        sourceLabel: isTelugu ? "డెమో ఇంటెలిజెన్స్" : "Demo Intelligence",
      };
    }
  }

  // ── 9. Context-based: "what should I visit here?" / "nearby" ──
  if (
    /visit here|near here|nearby|this city|current destination|where am i|దగ్గరలో|సమీపంలో|మంచి ప్రదేశం/.test(input)
  ) {
    const targetDest = selectedDestination || DESTINATIONS[0];
    const nearbyPlaces = top(
      TOURIST_PLACES.filter((p) => p.destinationId === targetDest.id),
      4
    );

    const list = nearbyPlaces
      .map((p) => `• **${p.name}** — ${p.category} (${crowdLabel(p.crowdLevel, isTelugu)})`)
      .join("\n");

    return {
      type: "nearby_suggestion",
      confidence: 0.91,
      title: isTelugu ? `${targetDest.name} సమీపంలోని మంచి ప్రదేశాలు` : `Nearby in ${targetDest.name}`,

      text: isTelugu
        ? `మీ ప్రస్తుత గమ్యస్థానం **${targetDest.name}** సమీపంలోని ఉత్తమ పర్యాటక ప్రదేశాలు:\n\n${list}${offlineNote}`
        : `Based on your selected destination **${targetDest.name}**, here are top places:\n\n${list}${offlineNote}`,

      places: nearbyPlaces,

      actions: nearbyPlaces.slice(0, 1).map((p) => ({
        label: isTelugu ? `${p.name} కు నావిగేట్ చేయండి` : `Navigate to ${p.name}`,
        navigatePlace: p,
      })),

      sourceLabel: isTelugu ? "డెమో ఇంటెలిజెన్స్" : "Demo Intelligence",
    };
  }

  // ── 10. Default Fallback ──
  return {
    type: "general",
    confidence: 0.75,
    title: isTelugu ? "ట్రావెల్‌గార్డ్ AI అసిస్టెంట్" : "TravelGuard AI Assistant",

    text: isTelugu
      ? `నేను మీకు ఈ విషయాలలో సహాయం చేయగలను:\n• నగరాలు మరియు ప్రదేశాల భద్రతా సమాచారం (ఉదా: 'విశాఖపట్నంలో తక్కువ రద్దీ ఉన్న ప్రదేశం ఏది?')\n• దర్శనీయ స్థలాల నావిగేషన్ (ఉదా: 'బోర్రా గుహలకు ఎలా వెళ్లాలి?')\n• ఆటో/క్యాబ్ ఫెయిర్ ప్రైస్ పరిశీలన (ఉదా: 'ఈ ఆటో ధర ఎక్కువగా ఉందా?')\n• అత్యవసర సేఫ్టీ హెల్ప్‌లైన్లు & ఆఫ్‌లైన్ సేవ్ చేసిన ప్రదేశాలు\n\nమీరు తెలుగు లేదా ఇంగ్లీషులో ప్రశ్నను టైప్ చేయవచ్చు లేదా మైక్రోఫోన్ ద్వారా మాట్లాడవచ్చు.`
      : `I can assist with:\n• Safety ratings & emergency protocols\n• Tourist places in any Indian city\n• Less crowded / safest destinations\n• Transport fair price checks\n• Offline saved places & Landmark recognition\n\nTry asking: _"What should I visit in Hyderabad?"_ or _"Find me a quieter place in Visakhapatnam."_`,

    actions: [
      {
        label: isTelugu ? "గమ్యస్థానాలు చూడండి" : "Browse Destinations",
        link: "/explore",
      },
      {
        label: isTelugu ? "సురక్షిత నావిగేషన్" : "Safe Navigation",
        link: "/navigate",
      },
      {
        label: isTelugu ? "ధర తనిఖీ (FairPrice)" : "FairPrice AI",
        link: "/ai/fairprice",
      },
    ],

    sourceLabel: isTelugu ? "డెమో AI ఇంటెలిజెన్స్" : "Prototype Intelligence",
  };
}

function noDataResponse(offlineNote, isTelugu = false) {
  return {
    type: "no_data",
    confidence: 0.50,
    title: isTelugu ? "ట్రావెల్‌గార్డ్ AI" : "TravelGuard AI",

    text: isTelugu
      ? `డెమో ఇంటెలిజెన్స్ వద్ద ఆ అభ్యర్థనకు సరిపడా సమాచారం లేదు. దయచేసి వేరొక ప్రశ్నను అడగండి.${offlineNote}`
      : `Demo intelligence does not have enough information for that request.${offlineNote}`,

    sourceLabel: isTelugu ? "డెమో AI ఇంటెలిజెన్స్" : "Prototype Intelligence",
  };
}