from flask import Blueprint, jsonify, request
from backend.models.saved_place import SavedPlace
from backend.models.tourist_place import TouristPlace
from backend.database.db import db
import json

saved_places_bp = Blueprint('saved_places', __name__, url_prefix='/api/saved-places')

@saved_places_bp.route('', methods=['GET'])
def get_saved_places():
    user_id = request.args.get('user', 'local_user')
    saved = SavedPlace.query.filter_by(user_identifier=user_id).order_by(SavedPlace.saved_at.desc()).all()
    place_ids = [s.place_id for s in saved]

    # Join with full place details if available
    places = []
    if place_ids:
        tourist_places = TouristPlace.query.filter(TouristPlace.id.in_(place_ids)).all()
        places = [p.to_dict() for p in tourist_places]

    return jsonify({
        'user': user_id,
        'savedPlaceIds': place_ids,
        'places': places,
        'count': len(place_ids),
    })

@saved_places_bp.route('', methods=['POST'])
def save_place():
    data = request.get_json() or {}
    place_id = data.get('placeId')
    user_id = data.get('user', 'local_user')

    if not place_id:
        return jsonify({'error': 'placeId is required'}), 400

    existing = SavedPlace.query.filter_by(user_identifier=user_id, place_id=place_id).first()
    if existing:
        return jsonify({
            'message': 'Place already saved',
            'saved': True,
            'item': existing.to_dict()
        }), 200

    place_data = json.dumps(data.get('placeData')) if data.get('placeData') else None
    saved = SavedPlace(user_identifier=user_id, place_id=place_id, place_data=place_data)
    db.session.add(saved)
    db.session.commit()

    return jsonify({
        'message': 'Place saved successfully',
        'saved': True,
        'item': saved.to_dict()
    }), 201

@saved_places_bp.route('/<string:place_id>', methods=['DELETE'])
def remove_saved_place(place_id):
    user_id = request.args.get('user', 'local_user')
    existing = SavedPlace.query.filter_by(user_identifier=user_id, place_id=place_id).first()

    if not existing:
        return jsonify({'message': 'Place was not in saved collection', 'removed': False}), 404

    db.session.delete(existing)
    db.session.commit()
    return jsonify({'message': 'Place removed from saved collection', 'removed': True}), 200

@saved_places_bp.route('/sync', methods=['POST'])
def sync_saved_places():
    data = request.get_json() or {}
    user_id = data.get('user', 'local_user')
    place_ids = data.get('placeIds', [])

    if not isinstance(place_ids, list):
        return jsonify({'error': 'placeIds must be an array'}), 400

    synced_count = 0
    for pid in place_ids:
        if not pid:
            continue
        existing = SavedPlace.query.filter_by(user_identifier=user_id, place_id=pid).first()
        if not existing:
            saved = SavedPlace(user_identifier=user_id, place_id=pid)
            db.session.add(saved)
            synced_count += 1

    db.session.commit()
    return jsonify({
        'success': True,
        'syncedCount': synced_count,
        'user': user_id,
    }), 200
