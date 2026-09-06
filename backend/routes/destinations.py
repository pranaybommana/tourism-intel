from flask import Blueprint, jsonify, request
from backend.models.destination import Destination
from backend.models.tourist_place import TouristPlace

destinations_bp = Blueprint('destinations', __name__, url_prefix='/api/destinations')

@destinations_bp.route('', methods=['GET'])
def get_destinations():
    region = request.args.get('region')
    state = request.args.get('state')
    search = request.args.get('search', '').strip().lower()

    query = Destination.query

    if region and region.upper() != 'ALL':
        query = query.filter_by(region=region)
    if state and state.upper() != 'ALL':
        query = query.filter(
            (Destination.state.ilike(f'%{state}%')) | (Destination.state_id == state)
        )

    destinations = query.all()

    if search:
        destinations = [
            d for d in destinations
            if search in d.name.lower() or
               search in d.state.lower() or
               search in d.region.lower() or
               (d.description and search in d.description.lower())
        ]

    return jsonify([d.to_dict() for d in destinations])

@destinations_bp.route('/<string:dest_id>', methods=['GET'])
def get_destination(dest_id):
    destination = Destination.query.get(dest_id)
    if not destination:
        return jsonify({'error': 'Destination not found', 'status': 404}), 404
    return jsonify(destination.to_dict())

@destinations_bp.route('/<string:dest_id>/places', methods=['GET'])
def get_destination_places(dest_id):
    destination = Destination.query.get(dest_id)
    if not destination:
        return jsonify({'error': 'Destination not found', 'status': 404}), 404

    places = TouristPlace.query.filter_by(destination_id=dest_id).all()
    return jsonify([p.to_dict() for p in places])
