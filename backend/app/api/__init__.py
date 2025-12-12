from fastapi import APIRouter
from app.api import analysis

api_router = APIRouter()

# Include Analysis Router
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])

from app.api.endpoints import community, network
api_router.include_router(community.router, prefix="/community", tags=["community"])
api_router.include_router(network.router, prefix="/network", tags=["network"])
