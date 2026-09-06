import os

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        f'sqlite:///{os.path.join(BASE_DIR, "database", "tourism_intel.db")}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'tourism-intel-prod-secret-key-2026')
    CORS_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173'
    ).split(',')
    JSON_SORT_KEYS = False
