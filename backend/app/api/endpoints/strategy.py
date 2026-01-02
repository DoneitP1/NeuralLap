from fastapi import APIRouter
from pydantic import BaseModel
from app.engine.strategy import strategy_engine

router = APIRouter()

class SessionData(BaseModel):
    laps_completed: int
    total_laps: int
    fuel_level: float
    tire_compound: str
    track_temp: float

@router.post("/recommendation")
async def get_strategy_recommendation(data: SessionData):
    """
    Get real-time strategy recommendation.
    """
    result = strategy_engine.get_strategy_recommendation(data.dict())
    return result
