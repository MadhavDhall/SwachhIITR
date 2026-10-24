# SwachhIITR — Sustainable Campus Cleanliness Platform

> A practical campus operations platform for cleaner, more sustainable IIT Roorkee facilities.

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8)](https://tailwindcss.com/)
[![IIT Roorkee](https://img.shields.io/badge/Campus-IIT%20Roorkee-0b6b3a)](https://iitr.ac.in/)

---

## 🌟 Platform Highlights

### 1. Command Center (`/dashboard`)
- Campus operations dashboard with live database-backed bin readings.
- Priority collection matrix flagging bins approaching threshold volume (&ge;70% and &ge;90%).
- Manual bin readings saved to Render PostgreSQL for reliable demonstration.
- Recent waste image reviews and circular sorting recommendations.

### 2. Waste Image Review (`/scanner`)
- Multi-object edge classification powered by YOLOv8.
- Real-time localized bounding box rendering with confidence percentages.
- Automated material categorization: Plastics, Cardboard, Organics, Metals, Glass, and E-Waste.
- Circular economy disposal recommendations for each stream.
- Auditor verification workflow (Accept, Reject, Reclassify) with flag for low-confidence detections (<70%).

### 3. IIT Roorkee Campus Bins (`/bins`)
- Interactive Leaflet + OpenStreetMap map of IIT Roorkee campus containers.
- Color-coded urgency pins (Green normal, Amber warning, Red critical, Gray offline).
- Slide-over inspector drawer with ultrasonic fill meter, battery level, RSSI, and time-to-overflow forecast.
- Filter by campus zone, urgency category, and search query.

### 4. Route Planner & Fleet Optimizer (`/routes`)
- Multi-vehicle Capacitated Vehicle Routing Problem (CVRP) solved with Google OR-Tools.
- Dynamic fill threshold triggering (e.g. only dispatch for bins &ge;70% capacity).
- Fuel and carbon emission savings metrics (-31.4% reduction vs. static routes).
- Real-time dispatch execution lifecycle: `Planned` &rarr; `In Progress` &rarr; `Completed`.

### 5. Circular Waste Ledger (`/ledger`)
- Searchable, filterable audit log of all waste scans, verified collections, and detected items.
- High-resolution detection review with auditor notes and timestamps.
- JSON data export for ESG compliance and municipal reporting.

### 6. Analytics & ESG Trends (`/analytics`)
- Recharts 7-day fill rate progression by campus zone.
- Campus waste composition breakdown.
- Daily volume collected (kg) vs. overflows prevented.

### 7. System Architecture & Settings (`/settings`)
- Configurable operational alert thresholds (warning fill, critical overflow, offline timeout).
- Render PostgreSQL, Cloudinary, and FastAPI connector status monitoring.
- Manual sensor ping controls that persist readings to PostgreSQL.

---

## 🎨 Design System & Philosophy

SwachhIITR uses a calm, nature-inspired campus operations design:
- **Palette**: Campus green, leaf, soil, and amber warning accents.
- **Typography**: Geist Sans + Geist Mono with tight display tracking (`tracking-tight`) and comfortable reading body.
- **Micro-Interactions**: Direct manipulation tactile press feedback (`active:scale-[0.98]`), translucent headers (`backdrop-blur-md`), and critically damped transitions.
- **Zero AI Clichés**: No generic purple gradient blobs, no floating fake cards, and no unmotivated infinite loops.

---

## 🚀 Quickstart Guide

### 1. Frontend Next.js Application
```bash
# Navigate to the project root
cd c:/Drive-D/hackathon/wasteos

# Run development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

#### Demo Quick-Login Accounts
| Role | Email | Password |
|---|---|---|
| **Operations Lead / Admin** | `priya.sharma@wasteos.demo` | *(any password)* |
| **Route Supervisor** | `marco.reyes@wasteos.demo` | *(any password)* |
| **Collection Driver** | `aisha.patel@wasteos.demo` | *(any password)* |

*(One-click quick login buttons are also provided on the sign-in screen.)*

---

### 2. Python AI & Optimization Microservice (Optional)
```bash
cd services/api
pip install -r requirements.txt
python main.py
```
FastAPI server runs on **[http://localhost:8000](http://localhost:8000)** (Swagger docs at `/docs`).

---

### 3. ESP32 Sensor Simulator
```bash
cd simulator
python sensor_sim.py --dry-run
```

### 4. Render + Cloudinary production setup

The production deployment uses Render for the Next.js service and PostgreSQL,
and Cloudinary for waste image storage. Copy `.env.example` to `.env.local`
for local development, then set the same variables as secret environment
variables in Render. Never commit the real values.

```bash
npm run db:migrate
```

The migration creates the relational schema for bins, sensor readings, scans,
detections, vehicles, routes, collections, alerts, and audit events. Images
are uploaded through `POST /api/uploads`; Cloudinary credentials stay on the
server and are never exposed to the browser.

`GET /api/health` reports database and Cloudinary readiness. It returns HTTP
200 with an explicit `degraded` status when optional environment variables are
not configured yet, so Render can keep the web process healthy while setup is
being completed. The included `render.yaml` provisions a Render PostgreSQL
database and configures the web service.

The optional FastAPI service is also defined in `render.yaml`. Set
`NEXT_PUBLIC_FASTAPI_URL` to its public Render URL to enable real inference
requests from the scanner. The service uses a custom
`models/yolov8n_waste.pt` file when present; without that file it explicitly
reports `mock_fallback` and uses deterministic demo detections. OR-Tools is
used when installed, with a heuristic fallback if it is unavailable.

For real WasteDNA predictions, place the trained weights at
`services/api/models/yolov8n_waste.pt` before deploying, or change
`YOLO_MODEL_PATH` to a mounted model path in Render. The model file is ignored
by Git because trained weights are usually too large for the repository.

### Sensor readings

The dashboard's Ping action writes a sensor reading to PostgreSQL and updates
the selected bin's fill level. This keeps the demo operational without an
external broker. The manual FastAPI telemetry endpoint remains available for
future device integrations.

```json
{
  "bin_id": "bin_001",
  "bin_label": "MRN-A01",
  "fill_pct": 87.2,
  "distance_cm": 24.7,
  "battery_pct": 92,
  "rssi_dbm": -64,
  "timestamp": "2026-10-24T08:00:00Z"
}
```

---

## 📚 Technical Documentation

Detailed engineering specifications are available in the [`docs/`](file:///c:/Drive-D/hackathon/wasteos/docs) directory:
- [API Contracts](file:///c:/Drive-D/hackathon/wasteos/docs/API_CONTRACTS.md): Full REST schemas
- [Sensor Wiring](file:///c:/Drive-D/hackathon/wasteos/docs/SENSOR_WIRING.md): ESP32 + HC-SR04 pinout & deep-sleep battery budgeting
