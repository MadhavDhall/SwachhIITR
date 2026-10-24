# WasteOS — ESP32 Sensor Simulator & Hardware Guide

This directory contains the telemetry simulator and hardware specifications for the WasteOS IoT bin sensing nodes.

---

## 1. Running the Simulator

### Prerequisites
```bash
pip install paho-mqtt
```

### Usage
```bash
# Dry-run mode (prints telemetry to console without an MQTT broker)
python sensor_sim.py --dry-run

# Connect to local Mosquitto broker
python sensor_sim.py --broker localhost --port 1883 --interval 5

# Connect to AWS IoT Core Endpoint (using TLS/X.509 certs)
python sensor_sim.py --broker a1b2c3d4e5f6-ats.iot.eu-west-1.amazonaws.com --port 8883
```

---

## 2. Telemetry Payload Schema

Payloads are published to `wasteos/sensors/{bin_id}/data`:

```json
{
  "device_id": "ESP32-NODE-bin_001",
  "bin_id": "bin_001",
  "bin_label": "MRN-A01",
  "timestamp": "2026-10-23T18:45:00Z",
  "distance_cm": 24.5,
  "fill_pct": 82.5,
  "battery_pct": 91,
  "rssi_dbm": -68,
  "temperature_c": 29.4,
  "is_simulated": true
}
```

---

## 3. Physical Hardware Specifications

| Component | Part | Purpose |
|---|---|---|
| Microcontroller | ESP32-WROOM-32D / ESP32-S3 | WiFi / BLE / Deep-Sleep battery management |
| Distance Sensor | HC-SR04P (3.3V) or JSN-SR04T (Waterproof) | Headspace acoustic echo measurement |
| Power Source | 3.7V 18650 Li-ion (3400mAh) + TP4056 USB-C | 6+ months runtime with 15-min deep sleep cycles |
| Solar Harvester | 5V 1W Monocrystalline Panel | Continuous autonomous field recharge |
| Enclosure | IP67 Polycarbonate Weatherproof Box | Lid-mounted, downward-facing ultrasonic transceiver |
