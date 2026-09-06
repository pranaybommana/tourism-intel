from backend.database.db import db
from datetime import datetime

class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    client_action_id = db.Column(db.String(100), unique=True, nullable=True) # Idempotency / Deduplication key
    place_id = db.Column(db.String(50), nullable=True)
    destination_id = db.Column(db.String(50), nullable=True)
    report_type = db.Column(db.String(50), nullable=False) # 'safety_alert', 'crowd_surge', 'infrastructure_issue'
    severity = db.Column(db.String(20), default='LOW') # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default='PENDING') # 'PENDING', 'VERIFIED', 'RESOLVED'
    reported_by = db.Column(db.String(100), default='Anonymous Traveler')
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'clientActionId': self.client_action_id,
            'placeId': self.place_id,
            'destinationId': self.destination_id,
            'reportType': self.report_type,
            'severity': self.severity,
            'description': self.description,
            'status': self.status,
            'reportedBy': self.reported_by,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }
