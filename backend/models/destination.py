from backend.database.db import db
from datetime import datetime
import json

class Destination(db.Model):
    __tablename__ = 'destinations'

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(100), default='Tourist Destination')
    state = db.Column(db.String(100), nullable=False)
    state_id = db.Column(db.String(100), nullable=True)
    region = db.Column(db.String(50), nullable=False, index=True)
    country = db.Column(db.String(50), default='India')
    categories = db.Column(db.Text, nullable=True) # JSON encoded array
    image = db.Column(db.String(500), nullable=True)
    description = db.Column(db.Text, nullable=True)
    safety_level = db.Column(db.String(20), default='SAFE')
    best_season = db.Column(db.String(100), nullable=True)
    place_count = db.Column(db.Integer, default=0)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    places = db.relationship('TouristPlace', backref='destination', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        cats = []
        if self.categories:
            try:
                cats = json.loads(self.categories) if isinstance(self.categories, str) else self.categories
            except Exception:
                cats = [self.categories]

        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'state': self.state,
            'stateId': self.state_id or self.id,
            'region': self.region,
            'country': self.country,
            'categories': cats,
            'image': self.image,
            'description': self.description,
            'safetyLevel': self.safety_level,
            'bestSeason': self.best_season,
            'placeCount': self.place_count or len(self.places),
            'touristPlaceCount': self.place_count or len(self.places),
            'coordinates': {
                'lat': self.latitude,
                'lng': self.longitude,
            } if self.latitude and self.longitude else None,
        }
