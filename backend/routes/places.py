from flask import Blueprint, jsonify, request
from backend.models.tourist_place import TouristPlace

places_bp = Blueprint('places', __name__, url_prefix='/api/places')

@places_bp.route('', methods=['GET'])
def get_places():
    dest_id = request.args.get('destinationId')
    category = request.args.get('category')
    search = request.args.get('search', '').strip().lower()
    crowd_level = request.args.get('crowdLevel')
    safety_level = request.args.get('safetyLevel')

    query = TouristPlace.query

    if dest_id:
        query = query.filter_by(destination_id=dest_id)
    if category and category.upper() != 'ALL':
        query = query.filter_by(category=category)
    if crowd_level:
        query = query.filter_by(crowd_level=crowd_level)
    if safety_level:
        query = query.filter_by(safety_level=safety_level)

    places = query.all()

    if search:
        places = [
            p for p in places
            if search in p.name.lower() or
               search in p.state.lower() or
               search in p.category.lower() or
               (p.description and search in p.description.lower()) or
               (p.destination_name and search in p.destination_name.lower())
        ]

    return jsonify([p.to_dict() for p in places])

@places_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = TouristPlace.query.with_entities(TouristPlace.category).distinct().all()
    cat_list = sorted([c[0] for c in categories if c[0]])
    return jsonify({
        'categories': ['ALL'] + cat_list,
        'count': len(cat_list)
    })

@places_bp.route('/<string:place_id>', methods=['GET'])
def get_place(place_id):
    place = TouristPlace.query.get(place_id)
    if not place:
        return jsonify({'error': 'Tourist place not found', 'status': 404}), 404
    return jsonify(place.to_dict())
