from backend.database.db import db
from datetime import datetime
import json

class SavedPlace(db.Model):
    __tablename__ = 'saved_places'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_identifier = db.Column(db.String(100), nullable=False, default='local_user', index=True)
    place_id = db.Column(db.String(50), nullable=False, index=True)
    place_data = db.Column(db.Text, nullable=True) # JSON cached data
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Unique constraint per user and place
    __table_args__ = (
        db.UniqueConstraint('user_identifier', 'place_id', name='uq_user_place'),
    )

    def to_dict(self):
        parsed_data = None
        if self.place_data:
            try:
                parsed_data = json.loads(self.place_data)
            except Exception:
                parsed_data = None

        return {
            'id': self.id,
            'userIdentifier': self.user_identifier,
            'placeId': self.place_id,
            'placeData': parsed_data,
            'savedAt': self.saved_at.isoformat() if self.saved_at else None,
        }
