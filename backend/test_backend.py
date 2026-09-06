import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/..'))
from backend.app import create_app

def run_tests():
    app = create_app()
    client = app.test_client()

    print('=== 1. Health Check ===')
    res = client.get('/api/health')
    assert res.status_code == 200, f'Health failed: {res.status_code}'
    print('Health OK:', res.get_json())

    print('\n=== 2. Destinations API ===')
    res = client.get('/api/destinations')
    assert res.status_code == 200, f'Destinations failed: {res.status_code}'
    dests = res.get_json()
    assert len(dests) > 0, 'No destinations returned'
    print(f'Destinations count: {len(dests)}, First: {dests[0]["name"]}')

    res = client.get('/api/destinations/hyderabad')
    assert res.status_code == 200
    print('Get single destination OK:', res.get_json()['name'])

    res = client.get('/api/destinations/nonexistent_id')
    assert res.status_code == 404
    print('404 for invalid destination OK:', res.get_json())

    print('\n=== 3. Tourist Places API ===')
    res = client.get('/api/places')
    assert res.status_code == 200
    places = res.get_json()
    assert len(places) > 0, 'No places returned'
    print(f'Places count: {len(places)}, First: {places[0]["name"]}')

    res = client.get('/api/places/categories')
    assert res.status_code == 200
    print('Categories OK:', res.get_json())

    res = client.get('/api/places?destinationId=hyderabad')
    assert res.status_code == 200
    print('Places for Hyderabad count:', len(res.get_json()))

    print('\n=== 4. Verified Services & Safe Zones ===')
    res = client.get('/api/safety/services?destinationId=hyderabad')
    assert res.status_code == 200
    print('Verified Services for Hyderabad count:', len(res.get_json()))

    res = client.get('/api/safety/safe-zones?placeId=charminar')
    assert res.status_code == 200
    print('Safe zones OK:', res.get_json())

    res = client.get('/api/safety/metrics')
    assert res.status_code == 200
    metrics = res.get_json()
    assert 'totalIncidents' in metrics
    print('Safety Metrics OK:', metrics)

    print('\n=== 5. Incident Reports API & Admin Status Pipeline ===')
    res = client.post('/api/safety/report', json={})
    assert res.status_code == 400, 'Empty report should fail with 400'
    print('Validation error 400 OK:', res.get_json())

    report_payload = {
        'clientActionId': 'test_action_001',
        'placeId': 'charminar',
        'destinationId': 'hyderabad',
        'reportType': 'safety_alert',
        'severity': 'HIGH',
        'description': 'Overcrowding near Laad Bazaar entrance'
    }
    res = client.post('/api/safety/report', json=report_payload)
    assert res.status_code in [200, 201]
    created_id = res.get_json()['report']['id']
    print('Create report response:', res.get_json()['message'])

    # Test PATCH status pipeline update
    res = client.patch(f'/api/safety/reports/{created_id}', json={'status': 'IN_PROGRESS', 'severity': 'CRITICAL'})
    assert res.status_code == 200
    assert res.get_json()['report']['status'] == 'IN_PROGRESS'
    assert res.get_json()['report']['severity'] == 'CRITICAL'
    print('PATCH status pipeline OK:', res.get_json()['report']['status'])

    # Test PATCH invalid status
    res = client.patch(f'/api/safety/reports/{created_id}', json={'status': 'INVALID_STATUS'})
    assert res.status_code == 400
    print('PATCH invalid status 400 OK:', res.get_json())

    # Duplicate submission test
    res = client.post('/api/safety/report', json=report_payload)
    assert res.status_code == 200
    assert res.get_json().get('duplicate') is True
    print('Duplicate check OK:', res.get_json()['message'])

    print('\n=== 6. Batch Offline Sync ===')
    sync_payload = {
        'items': [
            {'clientActionId': 'test_action_001', 'description': 'Duplicate action'},
            {'clientActionId': 'test_action_002', 'description': 'New offline incident 2', 'severity': 'MEDIUM'}
        ]
    }
    res = client.post('/api/safety/sync', json=sync_payload)
    assert res.status_code == 200
    sync_data = res.get_json()
    assert sync_data['syncedCount'] == 2
    assert 'test_action_001' in sync_data['skippedDuplicates']
    print('Batch sync OK:', sync_data)

    print('\n=== 7. Saved Places API ===')
    res = client.get('/api/saved-places?user=test_user')
    assert res.status_code == 200
    print('Initial saved places:', res.get_json()['count'])

    res = client.post('/api/saved-places', json={'placeId': 'charminar', 'user': 'test_user'})
    assert res.status_code in [200, 201]
    print('Save place OK:', res.get_json()['message'])

    res = client.get('/api/saved-places?user=test_user')
    assert res.status_code == 200
    assert res.get_json()['count'] == 1
    print('Saved places after add:', res.get_json()['savedPlaceIds'])

    res = client.delete('/api/saved-places/charminar?user=test_user')
    assert res.status_code == 200
    print('Delete saved place OK:', res.get_json()['message'])

    print('\n=== 8. AI Query API ===')
    res = client.post('/api/ai/query', json={'query': 'Is this area safe? Emergency hotlines'})
    assert res.status_code == 200
    print('AI Safety Query OK:', res.get_json()['title'])

    res = client.post('/api/ai/query', json={'query': 'హైదరాబాద్ లో చూడదగిన ప్రదేశాలు'})
    assert res.status_code == 200
    print('AI Telugu Query OK:', res.get_json()['title'])

    print('\n=== ALL BACKEND INTEGRATION TESTS PASSED 100% ===')

if __name__ == '__main__':
    run_tests()
