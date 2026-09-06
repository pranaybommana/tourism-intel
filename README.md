# TOURISM INTEL

**Lost Less. Travel Safer. Explore Smarter.**

An AI-assisted, offline-first tourism and safe navigation platform for India. Built with React + Vite on the frontend and Python Flask on the backend.

---

## Overview

Tourism Intel helps domestic and international travelers navigate Indian destinations safely. It combines real-time Google Maps navigation, a 180-meter route deviation safety guardian, AI-powered travel intelligence (chatbot, fare auditing, landmark recognition, waste detection), full offline support via IndexedDB, and an admin incident triage dashboard — all wrapped in a premium Oceanic glassmorphism UI.

---

## Features

### 🗺️ Tourism Discovery
- Curated Indian destination database (Hyderabad, Goa, Visakhapatnam, and more)
- Real-time destination search with autocomplete
- Category filtering (Heritage, Beaches, Nature, Spiritual, Adventure, Urban)
- Destination detail pages with safety scores, verified safe zones, and emergency contacts

### 🧭 Navigation & Safety
- **Google Maps Integration** — interactive map with walking routes
- **Live GPS location** via browser Geolocation API
- **Safe Travel Mode** — activates monitored safe corridor
- **180m Route Deviation Engine** — Haversine algorithm detects when user strays from the safe corridor
- **Audio Safety Warnings** — speech synthesis alerts on deviation
- **Return-to-route confirmation** — verbal confirmation when corridor is re-entered
- **SOS Emergency UI** — instant 112 dialer, tourist helpline directory, GPS coordinate clipboard

### 🤖 AI Intelligence
- **Multilingual AI Assistant** — English and Telugu, voice input/output
- **Smart Recommendations** — multi-factor scoring by crowd, budget, vibe, and safety
- **FairPrice AI** — regulated fare calculator for auto rickshaws, taxis, and bike taxis with scam detection
- **Landmark Scanner** — visual landmark identification with historical and cultural context
- **Waste Detection AI** — environmental hazard classification with community report filing

### 📡 Offline Intelligence
- **4-tier state machine**: ONLINE → LOW_CONNECTION → OFFLINE → LOW_BATTERY
- **IndexedDB caching** — destinations, places, saved locations, and sync queue
- **Reconnect synchronization** — mutex-locked sync queue with duplicate protection via `clientActionId`
- **Sync status indicator** and queue modal

### 🖥️ Admin Dashboard
- Live safety metrics overview (active, reviewing, in-progress, resolved incidents)
- Incident triage table with search, severity filter, and status filter
- Status lifecycle management: PENDING → REVIEWING → IN_PROGRESS → VERIFIED → RESOLVED
- Incident detail dossier modal with backend persistence

### 🔧 Backend REST API
- Flask Python backend with SQLAlchemy ORM
- SQLite database (upgradeable to PostgreSQL)
- Endpoints: destinations, places, safety, saved places, AI query, batch sync
- Full offline sync: `POST /api/safety/sync` with deduplication

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite 6 |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 + Vanilla CSS |
| Maps | `@vis.gl/react-google-maps` + Google Maps JavaScript API |
| Charts | Recharts |
| Icons | Lucide React |
| Offline Storage | IndexedDB (via custom `indexedDBService.js`) |
| AI Features | Client-side simulation engines (no external LLM required) |
| Backend | Python 3.13 + Flask 3 |
| ORM | Flask-SQLAlchemy |
| CORS | Flask-Cors |
| Database | SQLite (default) / PostgreSQL (production) |
| Package Manager | npm |

---

## Project Structure

```
tourism-intel/
├── src/                         # React frontend
│   ├── App.jsx                  # Route definitions
│   ├── main.jsx                 # Entry point
│   ├── components/              # Reusable UI components
│   │   ├── ai/                  # AI feature components
│   │   ├── layout/              # MainLayout, Navbar, etc.
│   │   ├── navigation/          # Map, MapErrorBoundary
│   │   ├── place/               # PlaceCard, PlaceDetailsModal
│   │   ├── safety/              # SOSModal, SafetyStatusPanel
│   │   └── ui/                  # GlassCard, GlassButton, etc.
│   ├── context/                 # React context providers
│   │   ├── AppStateContext.jsx  # Network/battery state machine
│   │   ├── DestinationContext.jsx
│   │   └── SyncContext.jsx      # Offline sync engine
│   ├── data/                    # Static curated datasets
│   │   ├── destinations.js
│   │   ├── touristPlaces.js
│   │   └── states.js
│   ├── hooks/                   # Custom React hooks
│   ├── pages/                   # Route-level page components
│   │   ├── Home/
│   │   ├── Explore/
│   │   ├── Navigate/            # Safe navigation + 180m deviation engine
│   │   ├── Assistant/           # AI chatbot
│   │   ├── AI/                  # FairPrice, Landmark, Waste pages
│   │   ├── Profile/
│   │   └── Admin/               # Incident triage dashboard
│   ├── services/                # API, AI, navigation, sync services
│   │   ├── api.js               # REST API layer with offline fallback
│   │   ├── indexedDBService.js  # IndexedDB abstraction
│   │   ├── syncService.js       # Reconnect sync queue
│   │   ├── navigationService.js # Haversine deviation engine
│   │   └── ai/                  # Chatbot, recommendations, fairprice, etc.
│   └── utils/                   # Speech utils, helpers
│
├── backend/                     # Flask Python backend
│   ├── app.py                   # Application factory + entry point
│   ├── config.py                # Environment-driven configuration
│   ├── requirements.txt         # Python dependencies
│   ├── test_backend.py          # Automated integration test suite
│   ├── database/
│   │   └── db.py                # SQLAlchemy instance
│   ├── models/                  # SQLAlchemy ORM models
│   ├── routes/                  # Flask blueprints
│   │   ├── destinations.py
│   │   ├── places.py
│   │   ├── safety.py            # Incidents, metrics, sync
│   │   ├── saved_places.py
│   │   └── ai.py
│   └── services/
│       └── mock_data_service.py # Database seeding
│
├── public/                      # Static assets
│   ├── favicon.svg
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker
│
├── index.html                   # Vite HTML entry
├── vite.config.js               # Vite + dev proxy config
├── tailwind.config.js
├── package.json
├── .env.example                 # ← Copy this to .env and fill in values
└── .gitignore
```

---

## Requirements

| Requirement | Minimum Version |
|---|---|
| Node.js | 18.x (tested on 22.17.0) |
| npm | 8.x+ (bundled with Node.js) |
| Python | 3.10+ (tested on 3.13.3) |
| Flask | 3.0.0+ |
| Flask-SQLAlchemy | 3.1.1+ |
| Flask-Cors | 4.0.0+ |
| SQLite | Bundled with Python — no separate install needed |

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/tourism-intel.git
cd tourism-intel
```

### 2. Configure Environment Variables

```bash
# Copy the template
cp .env.example .env

# Open .env and fill in your values (see Environment Variables section below)
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Install Backend Dependencies

It is strongly recommended to use a Python virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate — Windows
venv\Scripts\activate

# Activate — macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 5. Start the Backend

```bash
# From project root (with virtual environment active)
python -m backend.app
```

The Flask server starts at **http://localhost:5000**

The database (`backend/database/tourism_intel.db`) and all seed data are created automatically on first startup.

### 6. Start the Frontend

```bash
# From project root (in a separate terminal)
npm run dev
```

The Vite dev server starts at **http://localhost:3000**

Vite automatically proxies all `/api/*` requests to `http://localhost:5000` — no CORS configuration needed in development.

---

## Environment Variables

### Setup

```bash
cp .env.example .env
```

Then edit `.env` and fill in your values. **Never commit `.env`** — it is excluded by `.gitignore`.

### Required Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | **Yes** | Google Maps JavaScript API key |
| `VITE_API_BASE_URL` | No | Backend URL (default: `http://localhost:5000`) |
| `FLASK_ENV` | No | `development` or `production` (default: `production`) |
| `SECRET_KEY` | Recommended | Flask session secret. Generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | No | SQLAlchemy DB URI. Defaults to local SQLite. |
| `CORS_ORIGINS` | No | Comma-separated allowed origins. Default covers localhost:3000 and :5173 |

---

## Google Maps Setup

The Navigate page uses the **Google Maps JavaScript API**. The following APIs must be enabled in your Google Cloud project:

- **Maps JavaScript API** — renders the interactive map
- **Directions API** — calculates walking routes
- **Geocoding API** — resolves location queries (optional enhancement)

### Getting Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
2. Create a project (or select an existing one)
3. Enable the APIs listed above
4. Create an API key under **Credentials**
5. Restrict the key to your domain for production use
6. Add it to your local `.env` file:

```
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

> **Important:** Every developer on the team should use their own API key, or the team should manage a shared key securely (e.g., via a password manager or environment secrets manager). Do not hardcode or share API keys in source code.

---

## Development

To run the full application locally, you need **two terminal windows**:

**Terminal 1 — Backend:**
```bash
# Activate virtual environment first
source venv/bin/activate       # macOS/Linux
venv\Scripts\activate          # Windows

python -m backend.app
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Then open **http://localhost:3000** in your browser.

### Running Backend Tests

```bash
# With both servers running:
python backend/test_backend.py
```

All 8 integration test suites should report `100% PASSED`.

---

## Troubleshooting

### Map not loading / blank map
- Check that `VITE_GOOGLE_MAPS_API_KEY` is set in your `.env`
- Verify the Maps JavaScript API and Directions API are enabled in Google Cloud Console
- Check browser console for a `Google Maps API error` message with an error code

### Location permission denied
- The browser must be granted location permission for Safe Travel Mode to function
- On Chrome: click the lock icon in the address bar → Site Settings → Location → Allow
- The app gracefully degrades — all other features work without location

### Backend not reachable (API errors in the UI)
- Confirm the Flask server is running: `python -m backend.app`
- Check it is on port 5000: open http://localhost:5000/api/health
- Confirm the virtual environment is activated before running the backend

### CORS error in browser console
- Ensure the frontend is running on port 3000 or 5173 (the defaults in `CORS_ORIGINS`)
- If using a custom port, add it to `CORS_ORIGINS` in your `.env`

### IndexedDB errors in console
- Some browsers disable IndexedDB in private/incognito mode
- The app has an in-memory fallback — offline caching will not persist across sessions in this mode

### `ModuleNotFoundError: No module named 'backend'`
- Run the backend from the **project root** using `python -m backend.app`, not from inside the `backend/` directory

---

## Team Collaboration

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/tourism-intel.git
cd tourism-intel

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes, then stage and commit
git add .
git commit -m "feat: describe your change clearly"

# 4. Push to GitHub
git push origin feature/your-feature-name

# 5. Open a Pull Request on GitHub
#    → Compare your branch → main
#    → Request a review from a team member
```

### Branch Naming Convention

| Prefix | Use case |
|---|---|
| `feature/` | New feature |
| `fix/` | Bug fix |
| `chore/` | Config, dependencies, tooling |
| `docs/` | Documentation only |

---

## License

No license has been explicitly selected for this project. All rights reserved by the project authors unless otherwise stated.
