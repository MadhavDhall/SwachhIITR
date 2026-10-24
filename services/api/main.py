"""
WasteOS — Python AI & Optimization Microservice
FastAPI service providing YOLOv8 object detection (WasteDNA)
and Google OR-Tools capacitated vehicle routing (BinSync).
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

from routers import inference, optimizer
from routers import telemetry
from services import router_optimizer
from services.mqtt_ingest import MqttIngestor

mqtt_ingestor = MqttIngestor()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    mqtt_ingestor.start()
    yield
    mqtt_ingestor.stop()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wasteos-api")

app = FastAPI(
    title="WasteOS AI & Route Optimization API",
    description="Inference for WasteDNA (YOLOv8) and VRP optimization (OR-Tools) for BinSync",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inference.router, prefix="/api/v1/inference", tags=["WasteDNA Vision"])
app.include_router(optimizer.router, prefix="/api/v1/optimizer", tags=["BinSync Route Optimization"])
app.include_router(telemetry.router, prefix="/api/v1/telemetry", tags=["IoT Telemetry"])

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "WasteOS Engine",
        "yolo_ready": inference.detector.is_ready,
        "ortools_ready": router_optimizer.ORTOOLS_AVAILABLE,
        "inference_mode": "yolo" if inference.detector.is_ready else "mock_fallback",
        "optimizer_mode": "ortools" if router_optimizer.ORTOOLS_AVAILABLE else "heuristic_fallback",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("ENVIRONMENT", "development") == "development",
    )
