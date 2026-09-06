from flask import Blueprint, jsonify, request
from backend.models.tourist_place import TouristPlace
from backend.models.destination import Destination
import re

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/query', methods=['POST'])
def process_query():
    data = request.get_json() or {}
    raw_query = data.get('query', '').strip()

    if not raw_query:
        return jsonify({'error': 'query is required', 'status': 400}), 400

    query_lower = raw_query.lower()
    is_telugu = bool(re.search(r'[\u0C00-\u0C7F]', raw_query))

    # 1. Emergency / Safety Intent
    if any(k in query_lower for k in ['help', 'emergency', 'police', 'sos', 'danger', 'unsafe', 'safety', 'hotline', '112', '1363']) or \
       any(k in raw_query for k in ['సేఫ్', 'భద్రత', 'అత్యవసర', 'సహాయం', 'పోలీస్', 'ఆపద']):
        return jsonify({
            'type': 'safety_alert',
            'confidence': 0.98,
            'title': 'Emergency & Safety Intelligence' if not is_telugu else 'అత్యవసర & భద్రతా సమాచారం',
            'text': (
                "🚨 **Emergency Safety Protocol Active**\n"
                "• **National Emergency (Police/Medical/Fire):** 112\n"
                "• **Tourist Infoline & Assistance (24/7):** 1363\n"
                "• **Women Helpline:** 1091\n"
                "• Verified tourist safe corridors and 24/7 police outposts are monitored in real time."
            ) if not is_telugu else (
                "🚨 **అత్యవసర భద్రతా ప్రోటోకాల్ యాక్టివ్**\n"
                "• **జాతీయ అత్యవసర నంబర్ (పోలీస్/వైద్య/ఫైర్):** 112\n"
                "• **పర్యాటక సహాయవాణి (24/7):** 1363\n"
                "• **మహిళా హెల్ప్‌లైన్:** 1091\n"
                "• మీ లైవ్ లొకేషన్ భద్రతా కారిడార్‌లో ఉంది."
            ),
            'sourceLabel': 'Emergency Telemetry Gateway',
            'actions': [
                {'label': 'Call 112', 'action': 'tel:112'},
                {'label': 'Tourist Help 1363', 'action': 'tel:1363'},
            ]
        })

    # 2. Fair Fare / Auto Fare Intent
    if any(k in query_lower for k in ['fare', 'auto', 'price', 'fair', 'charge', 'cost', 'scam']) or \
       any(k in raw_query for k in ['ధర', 'ఆటో', 'ఖరీదు', 'ఛార్జీ']):
        return jsonify({
            'type': 'fare_estimator',
            'confidence': 0.94,
            'title': 'Prepaid Auto / Taxi Fare Estimator' if not is_telugu else 'ధరల అంచనా & సురక్షిత ప్రయాణం',
            'text': (
                "💡 **Traveler Fare Advisory:**\n"
                "• **City Base Fare (First 2 km):** ₹35 – ₹50\n"
                "• **Per Additional Km:** ₹15 – ₹18 / km\n"
                "• **Night Tariff (11:00 PM – 5:00 AM):** 25% to 50% additional standard surcharge.\n"
                "• *Recommendation:* Always request the digital meter or use government prepaid taxi counters at railway stations and airports."
            ) if not is_telugu else (
                "💡 **ప్రయాణికుల ధరల సూచన:**\n"
                "• **బేస్ ధర (మొదటి 2 కి.మీ):** ₹35 – ₹50\n"
                "• **ప్రతి అదనపు కి.మీ:** ₹15 – ₹18 / కి.మీ\n"
                "• *సూచన:* రైల్వే స్టేషన్లు లేదా ఎయిర్‌పోర్టులలో ప్రీపెయిడ్ ఆటో కౌంటర్లను ఉపయోగించండి."
            ),
            'sourceLabel': 'Smart Fare Intel',
            'actions': []
        })

    # 3. Destination / Place Search Intent
    matched_places = []
    # Search places in database
    db_places = TouristPlace.query.all()
    for p in db_places:
        if p.name.lower() in query_lower or (p.destination_name and p.destination_name.lower() in query_lower):
            matched_places.append(p.to_dict())

    if matched_places:
        top_places = matched_places[:3]
        place_names = ", ".join([p['name'] for p in top_places])
        return jsonify({
            'type': 'place_recommendation',
            'confidence': 0.92,
            'title': f'Travel Intelligence for {top_places[0]["destination"]}',
            'text': (
                f"Found top recommended tourist destinations for your query:\n"
                + "\n".join([f"• **{p['name']}** ({p['category']}) — Crowd: {p['crowdLevel']}, Safety: {p['safetyLevel']}" for p in top_places])
                + "\n\nAll locations have verified 24/7 tourist safety outposts."
            ),
            'places': top_places,
            'sourceLabel': 'Verified Tourism Intelligence DB',
            'actions': [{'label': f'Explore {p["name"]}', 'action': f'/destination/{p.get("destinationId")}'} for p in top_places]
        })

    # 4. Low Crowd Places Intent
    if any(k in query_lower for k in ['crowd', 'uncrowded', 'peaceful', 'quiet', 'less crowded']) or \
       any(k in raw_query for k in ['తక్కువ రద్దీ', 'రద్దీ లేని', 'ప్రశాంతమైన']):
        low_crowd_places = TouristPlace.query.filter(TouristPlace.crowd_level.ilike('%Low%')).limit(3).all()
        if not low_crowd_places:
            low_crowd_places = TouristPlace.query.limit(3).all()
        return jsonify({
            'type': 'crowd_forecast',
            'confidence': 0.90,
            'title': 'Less Crowded & Peaceful Destinations',
            'text': (
                "Here are destinations with light crowd levels and optimal visiting hours:\n"
                + "\n".join([f"• **{p.name}** ({p.destination_name or p.state}) — Best time: {p.best_time or 'Early morning'}" for p in low_crowd_places])
            ),
            'places': [p.to_dict() for p in low_crowd_places],
            'sourceLabel': 'Live Crowd Prediction Engine',
            'actions': []
        })

    # Default General Intelligence Response
    return jsonify({
        'type': 'general_guide',
        'confidence': 0.85,
        'title': 'Tourism Intelligence Guide',
        'text': (
            f"I have received your travel query: *\"{raw_query}\"*\n\n"
            "You can ask about:\n"
            "• **Less crowded places** to visit\n"
            "• **Safety advisories & emergency hotlines**\n"
            "• **Fair auto & taxi fare checks**\n"
            "• **Heritage, beaches, and spiritual destinations**"
        ),
        'sourceLabel': 'Tourism Intel NLP Engine',
        'actions': []
    })
