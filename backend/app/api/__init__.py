from fastapi import APIRouter
from app.api import analysis

api_router = APIRouter()

# Include Analysis Router
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
