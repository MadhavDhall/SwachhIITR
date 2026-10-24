# WasteOS — Complete API Contracts & Specifications

This document defines the REST and MQTT API contracts for WasteOS, covering both the Next.js App Router endpoints and the Python FastAPI AI/Optimization microservice.

---

## 1. Next.js App Router API (`/api/*`)

### `GET /api/bins`
Returns all monitored smart bins with current fill telemetry.
- **Query Parameters**:
  - `zone` (optional): Filter by municipal zone (e.g. `South Mumbai`)
  - `min_fill` (optional): Minimum fill percentage (e.g. `70`)
- **Response `200 OK`**:
```json
{
  "bins": [
    {
      "id": "bin_001",
      "label": "MRN-A01",
      "location": { "lat": 19.076, "lng": 72.8777 },
      "address": "Marine Drive, Nariman Point",
      "zone": "South Mumbai",
      "capacityLiters": 240,
      "sensorId": "sns_001",
      "status": "active",
      "currentFillPct": 87,
      "lastReadingAt": "2026-10-23T18:40:00Z",
      "predictedOverflowAt": "2026-10-23T22:40:00Z"
    }
  ],
  "total": 1,
  "timestamp": "2026-10-23T18:45:00Z"
}
```

### `GET /api/bins/[id]`
Returns single bin detail with recent ultrasonic history.

### `POST /api/scans`
Uploads waste image for YOLOv8 edge/cloud inference.
- **Request**: `multipart/form-data` with `file: Binary` or `imageUrl: string`
- **Response `201 Created`**:
```json
{
  "scan": {
    "id": "scan_1729709100000",
    "imageUrl": "https://...",
    "detections": [
      {
        "class": "Plastic",
        "confidence": 0.94,
        "boundingBox": { "x": 15.0, "y": 20.0, "width": 35.0, "height": 40.0 }
      }
    ],
    "classCounts": { "Plastic": 1 },
    "totalObjects": 1,
    "averageConfidence": 0.94,
    "hasUncertainResults": false,
    "verificationStatus": "pending"
  },
  "success": true
}
```

### `PATCH /api/scans/[id]/verify`
Auditor sign-off endpoint for human verification of waste streams.
- **Request Body**:
```json
{
  "verified": true,
  "auditorName": "Priya Sharma",
  "notes": "Verified high-density PET bottles"
}
```

### `POST /api/routes/optimize`
Triggers multi-vehicle Capacitated Vehicle Routing Problem (CVRP).
- **Request Body**:
```json
{
  "min_fill_threshold": 70.0,
  "depot_lat": 18.9400,
  "depot_lng": 72.8353
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "solver": "Google OR-Tools CVRP (Server Optimized)",
  "routes": [
    {
      "id": "rt_1729709200000_alpha",
      "name": "Optimized Route Alpha - South Cluster",
      "vehicleId": "veh_001",
      "vehicleName": "Eco Hauler 1",
      "totalDistanceKm": 16.4,
      "estimatedDurationMinutes": 48,
      "status": "planned",
      "stops": [
        {
          "order": 1,
          "binId": "bin_001",
          "binLabel": "MRN-A01",
          "fillPct": 87,
          "estimatedArrival": "2026-10-23T19:05:00Z"
        }
      ]
    }
  ],
  "binsIncluded": 3
}
```

---

## 2. Python FastAPI Microservice (`/api/v1/*`)

### `POST /api/v1/inference/detect`
Accepts raw image buffer, executes Ultralytics YOLOv8 inference, returns bounding boxes and circular disposal pathways.

### `POST /api/v1/optimizer/optimize-routes`
Solves the CVRP graph using Google OR-Tools and returns distance matrices and stop sequences.

---

## 3. MQTT IoT Telemetry Topic Hierarchy

| Topic | Publisher | Subscriber | Purpose |
|---|---|---|---|
| `wasteos/sensors/{bin_id}/data` | ESP32 Sensor Nodes | AWS IoT Core / Backend | Regular ultrasonic distance & battery payload |
| `wasteos/sensors/{bin_id}/alerts` | ESP32 Sensor Nodes | Alert Queue / Lambda | Immediate tip-over or rapid fill event |
| `wasteos/vehicles/{vehicle_id}/gps` | Fleet In-Cab Telematics | Route Dispatch Engine | Real-time GPS location updates |
