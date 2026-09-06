import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.database.db import db
from backend.routes.destinations import destinations_bp
from backend.routes.places import places_bp
from backend.routes.safety import safety_bp
from backend.routes.saved_places import saved_places_bp
from backend.routes.ai import ai_bp
from backend.services.mock_data_service import seed_initial_data

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)

    # Initialize CORS with configurable allowed origins
    allowed_origins = app.config.get('CORS_ORIGINS', [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ])
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)

    # Register blueprints
    app.register_blueprint(destinations_bp)
    app.register_blueprint(places_bp)
    app.register_blueprint(safety_bp)
    app.register_blueprint(saved_places_bp)
    app.register_blueprint(ai_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Tourism Intel Backend Intelligence Engine',
            'version': '1.0.0',
            'environment': os.getenv('FLASK_ENV', 'production'),
        })

    # Global JSON Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'error': 'Bad Request',
            'message': str(error.description) if hasattr(error, 'description') else 'Invalid request parameters',
            'status': 400,
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Resource Not Found',
            'message': str(error.description) if hasattr(error, 'description') else 'The requested resource was not found on this server',
            'status': 404,
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'error': 'Method Not Allowed',
            'message': 'HTTP method is not allowed on this endpoint',
            'status': 405,
        }), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An internal processing error occurred. Please try again later.',
            'status': 500,
        }), 500

    with app.app_context():
        # Ensure database tables exist
        db.create_all()
        # Seed initial dataset if missing
        seed_initial_data()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
