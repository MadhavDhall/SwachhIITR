# WasteOS — The Intelligent Circular Waste Management Platform

> Unified urban waste management combining **WasteDNA** (real-time AI material stream classification) and **BinSync** (predictive ultrasonic bin telemetry & multi-vehicle route optimization).

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8)](https://tailwindcss.com/)
[![YOLOv8](https://img.shields.io/badge/AI_Vision-Ultralytics_YOLOv8-10b981)](https://ultralytics.com/)
[![OR-Tools](https://img.shields.io/badge/Optimization-Google_OR--Tools-blue)](https://developers.google.com/optimization)
[![ESP32](https://img.shields.io/badge/IoT-ESP32_+_MQTT-red)](https://www.espressif.com/)

---

## 🌟 Platform Highlights

### 1. Command Center (`/dashboard`)
- Cockpit-density operations dashboard with real-time urban telemetry.
- Priority collection matrix flagging bins approaching threshold volume (&ge;70% and &ge;90%).
- Live ESP32 ultrasonic distance (cm) telemetry stream with instantaneous simulated MQTT pinging.
- Recent WasteDNA detections preview with automated circular sorting recommendations.

### 2. WasteDNA Vision (`/scanner`)
- Multi-object edge classification powered by YOLOv8.
- Real-time localized bounding box rendering with confidence percentages.
- Automated material categorization: Plastics, Cardboard, Organics, Metals, Glass, and E-Waste.
- Circular economy disposal recommendations for each stream.
- Auditor verification workflow (Accept, Reject, Reclassify) with flag for low-confidence detections (<70%).

### 3. BinSync Geospatial Fleet (`/bins`)
- Interactive Leaflet + OpenStreetMap spatial map of all monitored municipal containers.
- Color-coded urgency pins (Green normal, Amber warning, Red critical, Gray offline).
- Slide-over inspector drawer with ultrasonic fill meter, battery level, RSSI, and time-to-overflow forecast.
- Filter by municipal zone, urgency category, and search query.

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
- Recharts 7-day fill rate progression by zone (South Mumbai, Western Suburbs, Eastern Suburbs).
- WasteDNA stream composition donut breakdown.
- Daily volume collected (kg) vs. overflows prevented.

### 7. System Architecture & Settings (`/settings`)
- Configurable operational alert thresholds (warning fill, critical overflow, offline timeout).
- AWS IoT Core, DynamoDB, S3, and FastAPI connector status monitoring.
- Background sensor simulation engine toggle.

---

## 🎨 Design System & Philosophy

WasteOS was built adhering strictly to the **Anti-Slop Design Taste** guidelines and **Apple Design Principles**:
- **Palette**: Forest theme — deep slate surfaces (`#020617`, `#0f172a`), emerald green accent (`#10b981`), amber warnings (`#f59e0b`), and bone contrast text.
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

---

## 📚 Technical Documentation

Detailed engineering specifications are available in the [`docs/`](file:///c:/Drive-D/hackathon/wasteos/docs) directory:
- [API Contracts](file:///c:/Drive-D/hackathon/wasteos/docs/API_CONTRACTS.md): Full REST & MQTT schemas
- [Sensor Wiring](file:///c:/Drive-D/hackathon/wasteos/docs/SENSOR_WIRING.md): ESP32 + HC-SR04 pinout & deep-sleep battery budgeting
- [AWS Deployment](file:///c:/Drive-D/hackathon/wasteos/docs/AWS_DEPLOYMENT.md): IoT Core, DynamoDB single-table design, and ECS architecture
- [Cost & Security](file:///c:/Drive-D/hackathon/wasteos/docs/COST_SECURITY.md): AWS monthly calculator ($0.035/bin/mo) & security guardrails
