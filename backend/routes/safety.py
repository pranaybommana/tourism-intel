from flask import Blueprint, jsonify, request
from backend.models.report import Report
from backend.models.verified_service import VerifiedService
from backend.models.tourist_place import TouristPlace
from backend.models.destination import Destination
from backend.database.db import db

safety_bp = Blueprint('safety', __name__, url_prefix='/api/safety')

@safety_bp.route('/services', methods=['GET'])
def get_verified_services():
    dest_id = request.args.get('destinationId')
    service_type = request.args.get('serviceType')

    query = VerifiedService.query
    if dest_id:
        query = query.filter_by(destination_id=dest_id)
    if service_type:
        query = query.filter_by(service_type=service_type.upper())

    services = query.all()
    return jsonify([s.to_dict() for s in services])

@safety_bp.route('/safe-zones', methods=['GET'])
def get_safe_zones():
    place_id = request.args.get('placeId')
    dest_id = request.args.get('destinationId')

    if place_id:
        place = TouristPlace.query.get(place_id)
        if place and place.nearby_safe_zones:
            import json
            try:
                zones = json.loads(place.nearby_safe_zones)
            except Exception:
                zones = [place.nearby_safe_zones]
            return jsonify({'placeId': place_id, 'safeZones': zones})

    # Default emergency safe checkpoints
    return jsonify({
        'nationalEmergency': '112',
        'touristPoliceHelp': '1363',
        'womenHelpline': '1091',
        'safeZones': [
            'Verified Police Tourist Outpost (24/7 Patrol)',
            'Government Certified Tourism Assistance Center',
            'District Central Hospital Emergency Unit'
        ]
    })

@safety_bp.route('/metrics', methods=['GET'])
def get_safety_metrics():
    """
    Aggregated safety metrics for Admin Dashboard
    """
    total_incidents = Report.query.count()
    pending_incidents = Report.query.filter(Report.status.in_(['PENDING', 'NEW'])).count()
    reviewing_incidents = Report.query.filter(Report.status.in_(['REVIEWING', 'IN_PROGRESS'])).count()
    resolved_incidents = Report.query.filter(Report.status.in_(['RESOLVED', 'VERIFIED'])).count()
    critical_alerts = Report.query.filter(Report.status != 'RESOLVED', Report.severity.in_(['HIGH', 'CRITICAL'])).count()
    destinations_count = Destination.query.count()
    places_count = TouristPlace.query.count()
    services_count = VerifiedService.query.count()

    return jsonify({
        'totalIncidents': total_incidents,
        'pendingIncidents': pending_incidents,
        'reviewingIncidents': reviewing_incidents,
        'resolvedIncidents': resolved_incidents,
        'activeIncidents': total_incidents - resolved_incidents,
        'criticalAlerts': critical_alerts,
        'destinationsCount': destinations_count,
        'placesCount': places_count,
        'servicesCount': services_count,
    })

@safety_bp.route('/reports', methods=['GET'])
def get_reports():
    status = request.args.get('status')
    severity = request.args.get('severity')
    report_type = request.args.get('reportType')
    destination_id = request.args.get('destinationId')
    search = request.args.get('search', '').strip().lower()

    query = Report.query
    if status and status.upper() != 'ALL':
        query = query.filter_by(status=status.upper())
    if severity and severity.upper() != 'ALL':
        query = query.filter_by(severity=severity.upper())
    if report_type and report_type.upper() != 'ALL':
        query = query.filter_by(report_type=report_type)
    if destination_id and destination_id.upper() != 'ALL':
        query = query.filter_by(destination_id=destination_id)

    reports = query.order_by(Report.created_at.desc()).all()

    if search:
        reports = [
            r for r in reports
            if (r.description and search in r.description.lower()) or
               (r.place_id and search in r.place_id.lower()) or
               (r.destination_id and search in r.destination_id.lower()) or
               (r.reported_by and search in r.reported_by.lower()) or
               (r.report_type and search in r.report_type.lower())
        ]

    return jsonify([r.to_dict() for r in reports])

@safety_bp.route('/reports/<int:report_id>', methods=['GET'])
def get_report_by_id(report_id):
    report = Report.query.get(report_id)
    if not report:
        return jsonify({'error': 'Report not found', 'status': 404}), 404
    return jsonify(report.to_dict())

@safety_bp.route('/reports/<int:report_id>', methods=['PATCH', 'PUT'])
def update_report(report_id):
    report = Report.query.get(report_id)
    if not report:
        return jsonify({'error': 'Report not found', 'status': 404}), 404

    data = request.get_json() or {}

    if 'status' in data:
        valid_statuses = ['PENDING', 'REVIEWING', 'IN_PROGRESS', 'VERIFIED', 'RESOLVED', 'DISMISSED']
        new_status = str(data['status']).upper()
        if new_status in valid_statuses:
            report.status = new_status
        else:
            return jsonify({
                'error': f'Invalid status. Allowed values: {", ".join(valid_statuses)}',
                'status': 400
            }), 400

    if 'severity' in data:
        valid_severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        new_severity = str(data['severity']).upper()
        if new_severity in valid_severities:
            report.severity = new_severity
        else:
            return jsonify({
                'error': f'Invalid severity. Allowed values: {", ".join(valid_severities)}',
                'status': 400
            }), 400

    if 'description' in data and data['description']:
        report.description = data['description'].strip()

    db.session.commit()
    return jsonify({
        'message': 'Report updated successfully',
        'report': report.to_dict()
    }), 200

@safety_bp.route('/reports/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    report = Report.query.get(report_id)
    if not report:
        return jsonify({'error': 'Report not found', 'status': 404}), 404

    db.session.delete(report)
    db.session.commit()
    return jsonify({'message': 'Report deleted successfully', 'id': report_id}), 200

@safety_bp.route('/report', methods=['POST'])
def submit_report():
    data = request.get_json() or {}
    description = data.get('description', '').strip()

    if not description:
        return jsonify({
            'error': 'Description is required',
            'status': 400,
            'field': 'description'
        }), 400

    client_action_id = data.get('clientActionId') or request.headers.get('X-Client-Action-ID')

    # Duplicate Prevention: If report with this clientActionId already exists, return existing record
    if client_action_id:
        existing = Report.query.filter_by(client_action_id=client_action_id).first()
        if existing:
            return jsonify({
                'message': 'Duplicate report acknowledged (already synchronized)',
                'report': existing.to_dict(),
                'duplicate': True,
            }), 200

    report = Report(
        client_action_id=client_action_id,
        place_id=data.get('placeId'),
        destination_id=data.get('destinationId'),
        report_type=data.get('reportType', 'safety_alert'),
        severity=data.get('severity', 'LOW').upper(),
        description=description,
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        reported_by=data.get('reportedBy', 'Anonymous Traveler'),
    )
    db.session.add(report)
    db.session.commit()
    return jsonify({'message': 'Report submitted successfully', 'report': report.to_dict()}), 201

@safety_bp.route('/sync', methods=['POST'])
def sync_reports():
    """
    Batch Reconnection Synchronization Endpoint
    Accepts an array of queued offline actions, prevents duplicates, and commits new items.
    """
    data = request.get_json() or {}
    items = data.get('items', [])
    if isinstance(data, list):
        items = data

    if not isinstance(items, list):
        return jsonify({'error': 'Payload must contain a list of items', 'status': 400}), 400

    synced_ids = []
    skipped_duplicates = []
    errors = []

    for item in items:
        try:
            payload = item.get('payload') or item
            desc = payload.get('description')
            if not desc:
                errors.append({'clientActionId': item.get('clientActionId'), 'error': 'Missing description'})
                continue

            action_id = item.get('clientActionId') or payload.get('clientActionId')

            if action_id:
                existing = Report.query.filter_by(client_action_id=action_id).first()
                if existing:
                    skipped_duplicates.append(action_id)
                    synced_ids.append(action_id)
                    continue

            report = Report(
                client_action_id=action_id,
                place_id=payload.get('placeId'),
                destination_id=payload.get('destinationId'),
                report_type=payload.get('reportType', 'safety_alert'),
                severity=payload.get('severity', 'LOW').upper(),
                description=desc,
                latitude=payload.get('latitude'),
                longitude=payload.get('longitude'),
                reported_by=payload.get('reportedBy', 'Anonymous Traveler'),
            )
            db.session.add(report)
            synced_ids.append(action_id or str(report.id))
        except Exception as e:
            errors.append({'clientActionId': item.get('clientActionId'), 'error': str(e)})

    db.session.commit()

    return jsonify({
        'success': True,
        'syncedCount': len(synced_ids),
        'syncedIds': synced_ids,
        'skippedDuplicates': skipped_duplicates,
        'errors': errors,
    }), 200
