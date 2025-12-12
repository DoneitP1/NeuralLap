from fastapi import APIRouter
from app.engine.analysis import analysis_engine

router = APIRouter()

@router.get("/dna")
async def get_driver_dna():
    """Get calculated Driver DNA and Archetype."""
    return analysis_engine.get_driver_dna()

@router.get("/weaknesses")
async def get_weaknesses():
    """Get top track weaknesses and AI recommendations."""
    return analysis_engine.get_weaknesses()

@router.get("/pro-comparison")
async def get_pro_comparison():
    """Get mock pro-comparison dataset (You vs Verstappen)."""
    # Mock data for a graph
    return {
        "driver": "Max Verstappen",
        "track": "Spa Francorchamps",
        "delta": "+1.2s",
        "trace_you": [0, 50, 100, 150, 200, 250, 100, 50, 0], # Mock Speed/Brake
        "trace_pro": [0, 55, 110, 160, 210, 260, 120, 60, 0]
    }
