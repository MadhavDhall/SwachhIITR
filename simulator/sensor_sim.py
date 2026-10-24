#!/usr/bin/env python3
"""
WasteOS — ESP32 + HC-SR04 Ultrasonic Sensor Simulator
Simulates physical ultrasonic sensor nodes publishing telemetry
over MQTT to AWS IoT Core or local MQTT brokers.
"""

import time
import json
import random
import argparse
from datetime import datetime, timezone

try:
    import paho.mqtt.client as mqtt
    PAHO_AVAILABLE = True
except ImportError:
    PAHO_AVAILABLE = False
    print("[WARN] paho-mqtt not installed. Telemetry will be simulated to console.")

# Default simulation parameters
DEFAULT_BINS = [
    {"bin_id": "bin_001", "label": "MRN-A01", "height_cm": 120, "base_fill": 85},
    {"bin_id": "bin_002", "label": "BND-B02", "height_cm": 120, "base_fill": 45},
    {"bin_id": "bin_003", "label": "ANR-C03", "height_cm": 120, "base_fill": 92},
    {"bin_id": "bin_005", "label": "CST-E05", "height_cm": 120, "base_fill": 70},
    {"bin_id": "bin_010", "label": "CLB-J10", "height_cm": 120, "base_fill": 95},
]

def calculate_reading(bin_info: dict) -> dict:
    height = bin_info["height_cm"]
    base = bin_info["base_fill"]
    # Add random fluctuation (-2% to +5%)
    fill_pct = min(100.0, max(5.0, base + random.uniform(-1.5, 3.5)))
    bin_info["base_fill"] = fill_pct  # persist drift

    # Ultrasonic distance is inverse of fill
    min_headspace = 10.0
    distance_cm = max(min_headspace, height - (fill_pct / 100.0) * (height - min_headspace))

    return {
        "device_id": f"ESP32-NODE-{bin_info['bin_id']}",
        "bin_id": bin_info["bin_id"],
        "bin_label": bin_info["label"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "distance_cm": round(distance_cm, 1),
        "fill_pct": round(fill_pct, 1),
        "battery_pct": random.randint(88, 98),
        "rssi_dbm": random.randint(-74, -58),
        "temperature_c": round(random.uniform(26.0, 31.5), 1),
        "is_simulated": True,
    }

def main():
    parser = argparse.ArgumentParser(description="WasteOS ESP32 Sensor Telemetry Simulator")
    parser.add_argument("--broker", default="localhost", help="MQTT broker host")
    parser.add_argument("--port", type=int, default=1883, help="MQTT broker port")
    parser.add_argument("--interval", type=int, default=5, help="Publish interval in seconds")
    parser.add_argument("--topic-prefix", default="wasteos/sensors", help="MQTT topic prefix")
    parser.add_argument("--dry-run", action="store_true", help="Print telemetry without connecting to broker")
    args = parser.parse_args()

    client = None
    if PAHO_AVAILABLE and not args.dry_run:
        try:
            client = mqtt.Client(client_id="wasteos-sensor-sim")
            client.connect(args.broker, args.port, 60)
            client.loop_start()
            print(f"[OK] Connected to MQTT broker at {args.broker}:{args.port}")
        except Exception as e:
            print(f"[WARN] Could not connect to MQTT broker ({e}). Falling back to stdout mode.")
            client = None

    print(f"[*] Starting ESP32 Sensor Simulation ({len(DEFAULT_BINS)} nodes)...")
    print(f"[*] Publishing every {args.interval}s. Press Ctrl+C to stop.\n")

    try:
        while True:
            for b in DEFAULT_BINS:
                payload = calculate_reading(b)
                topic = f"{args.topic_prefix}/{b['bin_id']}/data"
                payload_json = json.dumps(payload, indent=2)

                if client:
                    client.publish(topic, json.dumps(payload))
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] MQTT -> {topic} | Fill: {payload['fill_pct']}% ({payload['distance_cm']} cm)")
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] TELEMETRY [{b['label']}]: {payload['fill_pct']}% fill, {payload['distance_cm']} cm, Bat: {payload['battery_pct']}%, RSSI: {payload['rssi_dbm']} dBm")

            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\n[*] Stopping sensor simulator.")
        if client:
            client.loop_stop()
            client.disconnect()

if __name__ == "__main__":
    main()
