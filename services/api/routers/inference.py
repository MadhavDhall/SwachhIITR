"""
WasteDNA — Inference Router
Provides endpoint for uploading waste images and receiving YOLOv8 bounding boxes,
class counts, confidence scores, and recycling recommendations.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import io
from PIL import Image

from services.detector import WasteDetector

router = APIRouter()
detector = WasteDetector()

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class DetectionResult(BaseModel):
    class_name: str
    confidence: float
    bounding_box: BoundingBox
    recommendation: Dict[str, Any] if "Any" in globals() else dict

class InferenceResponse(BaseModel):
    total_objects: int
    average_confidence: float
    has_uncertain_results: bool
    class_counts: Dict[str, int]
    detections: List[dict]

@router.post("/detect")
async def detect_waste(file: UploadFile = File(...)):
    """
    Accepts an uploaded image, runs YOLO inference, and returns localized waste objects.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

    results = detector.predict(image)
    return results

@router.get("/classes")
def get_supported_classes():
    return detector.get_classes()
