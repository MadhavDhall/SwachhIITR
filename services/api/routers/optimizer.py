"""
BinSync — Route Optimization Router
Exposes endpoint to calculate multi-vehicle routes using Google OR-Tools
Capacitated Vehicle Routing Problem (CVRP) with time constraints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional

from services.router_optimizer import RouteOptimizer, BinStop, VehicleSpec

router = APIRouter()
optimizer = RouteOptimizer()

class OptimizeRequest(BaseModel):
    bins: List[BinStop]
    vehicles: List[VehicleSpec]
    depot_lat: float = 18.9400
    depot_lng: float = 72.8353
    min_fill_threshold: float = 70.0

@router.post("/optimize-routes")
def solve_vrp_routes(payload: OptimizeRequest):
    """
    Computes optimal multi-vehicle collection routing based on current bin fill percentages.
    """
    try:
        results = optimizer.solve(
            bins=payload.bins,
            vehicles=payload.vehicles,
            depot_lat=payload.depot_lat,
            depot_lng=payload.depot_lng,
            min_fill_threshold=payload.min_fill_threshold,
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")
