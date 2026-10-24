import os

from fastapi import APIRouter, Header, HTTPException
from typing import Any

from services.mqtt_ingest import MqttIngestor

router = APIRouter()


@router.post("/reading")
def ingest_reading(payload: dict[str, Any], x_ingestion_key: str | None = Header(default=None)):
    expected_key = os.getenv("INGESTION_API_KEY")
    if not expected_key or x_ingestion_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid ingestion credentials")
    try:
        MqttIngestor.persist_reading(payload, "wasteos/sensors/manual/data")
        return {"success": True}
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Telemetry persistence failed: {error}") from error
