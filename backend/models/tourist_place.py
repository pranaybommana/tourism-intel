from backend.database.db import db
from datetime import datetime
import json

class TouristPlace(db.Model):
    __tablename__ = 'tourist_places'

    id = db.Column(db.String(50), primary_key=True)
    destination_id = db.Column(db.String(50), db.ForeignKey('destinations.id'), nullable=False, index=True)
    destination_name = db.Column(db.String(100), nullable=True)
    name = db.Column(db.String(150), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    region = db.Column(db.String(50), nullable=False, index=True)
    category = db.Column(db.String(100), nullable=False, index=True)
    image = db.Column(db.String(500), nullable=True)
    description = db.Column(db.Text, nullable=True)
    best_time = db.Column(db.String(100), nullable=True)
    duration = db.Column(db.String(50), nullable=True)
    crowd_level = db.Column(db.String(50), default='Moderate')
    safety_level = db.Column(db.String(20), default='SAFE')
    things_to_see = db.Column(db.Text, nullable=True) # JSON encoded
    things_to_do = db.Column(db.Text, nullable=True)  # JSON encoded
    nearby_attractions = db.Column(db.Text, nullable=True) # JSON encoded
    nearby_safe_zones = db.Column(db.Text, nullable=True)  # JSON encoded
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        def parse_json_field(val):
            if not val:
                return []
            if isinstance(val, list):
                return val
            try:
                return json.loads(val)
            except Exception:
                return [val]

        return {
            'id': self.id,
            'destinationId': self.destination_id,
            'destination': self.destination_name or (self.destination.name if self.destination else self.destination_id),
            'name': self.name,
            'state': self.state,
            'region': self.region,
            'category': self.category,
            'image': self.image,
            'description': self.description,
            'bestTime': self.best_time,
            'duration': self.duration,
            'crowdLevel': self.crowd_level,
            'safetyLevel': self.safety_level,
            'thingsToSee': parse_json_field(self.things_to_see),
            'thingsToDo': parse_json_field(self.things_to_do),
            'nearbyAttractions': parse_json_field(self.nearby_attractions),
            'nearbySafeZones': parse_json_field(self.nearby_safe_zones),
            'coordinates': {
                'lat': self.latitude,
                'lng': self.longitude,
            } if self.latitude and self.longitude else None,
        }
