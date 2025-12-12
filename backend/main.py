from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uvicorn
from app.api import api_router
from app.core.config import settings
from loguru import logger

# 1. Create FastAPI App
app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For Electron, allow all or specific local schemes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Socket.IO Setup (Async)
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
sio_app = socketio.ASGIApp(sio, app)

# 4. Include Routers
app.include_router(api_router, prefix="/api")

from app.engine.telemetry import TelemetryEngine # (Correction: Should be relative or absolute)
from app.engine.strategy import strategy_engine # NEW

# Global Engine Instance
telemetry_engine = None

import asyncio

@app.on_event("startup")
async def startup_event():
    from app.core.database import create_db_and_tables
    create_db_and_tables()
    global telemetry_engine
    logger.info("Neural Lap Backend Starting...")
    loop = asyncio.get_running_loop()
    telemetry_engine = TelemetryEngine(sio, loop)
    telemetry_engine.start()

@app.on_event("shutdown")
async def shutdown_event():
    global telemetry_engine
    if telemetry_engine:
        telemetry_engine.stop()

@app.get("/")
async def root():
    return {"message": "Neural Lap Backend Running", "version": settings.VERSION}

# Socket.IO Events
@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

def start():
    """Launched with `poetry run start` at root level"""
    uvicorn.run(
        "main:sio_app", 
        host="127.0.0.1", 
        port=8000, 
        reload=True
    )

if __name__ == "__main__":
    start()
