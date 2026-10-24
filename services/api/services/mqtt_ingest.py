"""MQTT telemetry subscriber and PostgreSQL persistence."""

import json
import logging
import os
import threading
import tempfile
from datetime import datetime, timezone
from typing import Any

import paho.mqtt.client as mqtt
import psycopg

logger = logging.getLogger("wasteos-mqtt")


def _number(payload: dict[str, Any], *keys: str, default: float = 0) -> float:
    for key in keys:
        value = payload.get(key)
        if value is not None:
            return float(value)
    return default


class MqttIngestor:
    def __init__(self) -> None:
        self.enabled = bool(os.getenv("MQTT_BROKER"))
        self.client: mqtt.Client | None = None
        self.thread: threading.Thread | None = None

    def start(self) -> None:
        if not self.enabled:
            logger.info("MQTT disabled: MQTT_BROKER is not configured")
            return

        broker = os.environ["MQTT_BROKER"]
        port = int(os.getenv("MQTT_PORT", "8883"))
        self.client = mqtt.Client(
            mqtt.CallbackAPIVersion.VERSION2,
            client_id=os.getenv("MQTT_CLIENT_ID", "wasteos-api"),
        )
        username = os.getenv("MQTT_USERNAME")
        password = os.getenv("MQTT_PASSWORD")
        if username:
            self.client.username_pw_set(username, password)
        if os.getenv("MQTT_TLS", "true").lower() == "true":
            self.client.tls_set(
                ca_certs=self._certificate_path("MQTT_CA_CERT"),
                certfile=self._certificate_path("MQTT_CLIENT_CERT"),
                keyfile=self._certificate_path("MQTT_CLIENT_KEY"),
            )

        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.connect_async(broker, port, keepalive=60)
        self.thread = threading.Thread(target=self.client.loop_forever, daemon=True)
        self.thread.start()
        logger.info("MQTT subscriber started for %s:%s", broker, port)

    @staticmethod
    def _certificate_path(variable: str) -> str | None:
        value = os.getenv(variable)
        if not value:
            return None
        if "-----BEGIN" not in value:
            return value
        file = tempfile.NamedTemporaryFile(mode="w", prefix="wasteos-", delete=False)
        file.write(value.replace("\\n", "\n"))
        file.close()
        return file.name

    def stop(self) -> None:
        if self.client:
            self.client.disconnect()
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=5)

    def _on_connect(self, client: mqtt.Client, _userdata: Any, _flags: Any, reason_code: Any, _properties: Any = None) -> None:
        if reason_code == 0 or getattr(reason_code, "value", reason_code) == 0:
            topic = os.getenv("MQTT_TOPIC", "wasteos/sensors/+/data")
            client.subscribe(topic, qos=1)
            logger.info("MQTT connected and subscribed to %s", topic)
        else:
            logger.error("MQTT connection failed: %s", reason_code)

    def _on_message(self, _client: mqtt.Client, _userdata: Any, message: mqtt.MQTTMessage) -> None:
        try:
            payload = json.loads(message.payload.decode("utf-8"))
            self.persist_reading(payload, message.topic)
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError, KeyError) as error:
            logger.error("Invalid MQTT telemetry on %s: %s", message.topic, error)
        except Exception:
            logger.exception("Could not persist MQTT telemetry on %s", message.topic)

    @staticmethod
    def persist_reading(payload: dict[str, Any], topic: str) -> None:
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise RuntimeError("DATABASE_URL is required for MQTT persistence")

        bin_id = str(payload.get("bin_id") or topic.split("/")[2])
        fill_pct = max(0, min(100, _number(payload, "fill_pct", "fillPct")))
        distance_cm = max(0, _number(payload, "distance_cm", "distanceCm"))
        battery_pct = _number(payload, "battery_pct", "batteryPct", default=0)
        rssi = int(_number(payload, "rssi_dbm", "rssi", default=0))
        timestamp = payload.get("timestamp") or datetime.now(timezone.utc).isoformat()
        sensor_id = str(payload.get("device_id") or payload.get("sensor_id") or f"mqtt-{bin_id}")

        with psycopg.connect(database_url) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO bins (
                      id, label, address, zone, latitude, longitude,
                      capacity_liters, sensor_id, current_fill_pct, last_reading_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, 240, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                      sensor_id = EXCLUDED.sensor_id,
                      current_fill_pct = EXCLUDED.current_fill_pct,
                      last_reading_at = EXCLUDED.last_reading_at
                    """,
                    (
                        bin_id,
                        str(payload.get("bin_label") or bin_id),
                        str(payload.get("address") or "MQTT provisioned location"),
                        str(payload.get("zone") or "Unassigned"),
                        float(payload.get("latitude") or 0),
                        float(payload.get("longitude") or 0),
                        sensor_id,
                        fill_pct,
                        timestamp,
                    ),
                )
                cursor.execute(
                    """
                    INSERT INTO sensor_readings (
                      id, bin_id, sensor_id, recorded_at, distance_cm,
                      fill_pct, battery_pct, rssi, is_simulated, payload
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                    """,
                    (
                        f"mqtt_{bin_id}_{datetime.now(timezone.utc).timestamp()}",
                        bin_id,
                        sensor_id,
                        timestamp,
                        distance_cm,
                        fill_pct,
                        battery_pct,
                        rssi,
                        bool(payload.get("is_simulated", False)),
                        json.dumps(payload),
                    ),
                )
