"""
WasteOS — Python AI & Optimization Microservice
FastAPI service providing YOLOv8 object detection (WasteDNA)
and Google OR-Tools capacitated vehicle routing (BinSync).
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import logging

from routers import inference, optimizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wasteos-api")

app = FastAPI(
    title="WasteOS AI & Route Optimization API",
    description="Inference for WasteDNA (YOLOv8) and VRP optimization (OR-Tools) for BinSync",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inference.router, prefix="/api/v1/inference", tags=["WasteDNA Vision"])
app.include_router(optimizer.router, prefix="/api/v1/optimizer", tags=["BinSync Route Optimization"])

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "WasteOS Engine",
        "yolo_ready": True,
        "ortools_ready": True,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
