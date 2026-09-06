from backend.database.db import db
from datetime import datetime

class VerifiedService(db.Model):
    __tablename__ = 'verified_services'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    destination_id = db.Column(db.String(50), nullable=False)
    service_type = db.Column(db.String(50), nullable=False) # 'POLICE', 'HOSPITAL', 'TOURIST_DESK', 'EMBASSY'
    name = db.Column(db.String(150), nullable=False)
    contact_number = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(300), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    is_24_7 = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'destinationId': self.destination_id,
            'serviceType': self.service_type,
            'name': self.name,
            'contactNumber': self.contact_number,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'is24x7': self.is_24_7,
        }
