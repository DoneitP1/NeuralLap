import sys
import os
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select

# Add logical path to sys.path
# sys.path.append... removed


# Mocking database for test
from app.core.config import settings
os.environ["SQLITEDB_URL"] = "sqlite:///./test_verification.db"

# Import after setting env if needed, but config.py is already loaded likely.
# We will override the engine in database.py if possible or just use the default file but simpler.
# Actually, let's use the main app.

from main import app
from app.core.database import engine, create_db_and_tables
from app.engine.models.user import User
from app.engine.models.telemetry_session import TelemetrySession

client = TestClient(app)

def test_mobile_integration():
    print("Testing Mobile Integration...")
    # 1. Sync
    payload = {
        "session_id": "sess_123",
        "user_id": "user_1",
        "data": [
            {
                "time": 1.0, "speed": 100, "throttle": 1.0, "brake": 0,
                "gear": 3, "rpm": 10000, "lat": 0, "lon": 0
            }
        ]
    }
    response = client.post("/api/mobile/sync", json=payload)
    if response.status_code == 200:
        print("  [PASS] /api/mobile/sync")
    else:
        print(f"  [FAIL] /api/mobile/sync: {response.text}")

    # 2. Analysis
    response = client.get("/api/mobile/analysis/sess_123")
    if response.status_code == 200:
        print("  [PASS] /api/mobile/analysis")
    else:
        print(f"  [FAIL] /api/mobile/analysis: {response.text}")

def test_strategy_engine():
    print("\nTesting Strategy Engine...")
    payload = {
        "laps_completed": 20,
        "total_laps": 50,
        "fuel_level": 5.0, # Low fuel
        "tire_compound": "SOFT",
        "track_temp": 35.0
    }
    response = client.post("/api/strategy/recommendation", json=payload)
    if response.status_code == 200:
        data = response.json()
        print(f"  [PASS] /api/strategy/recommendation -> Recommendation: {data.get('pit_recommendation')}")
        if data.get('pit_recommendation') == "BOX BOX":
            print("  [PASS] Logic Check (Low Fuel -> Box)")
        else:
            print("  [FAIL] Logic Check (Low Fuel but no Box?)")
    else:
        print(f"  [FAIL] /api/strategy/recommendation: {response.text}")

def test_auth_system():
    print("\nTesting Auth System...")
    # Re-create DB for clean state
    SQLModel.metadata.drop_all(engine)
    create_db_and_tables()
    
    # 1. Register
    reg_payload = {
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User"
    }
    response = client.post("/api/auth/register", json=reg_payload)
    if response.status_code == 200:
        print("  [PASS] /api/auth/register")
    else:
        print(f"  [FAIL] /api/auth/register: {response.text}")
        return None

    # 2. Login
    login_payload = {
        "username": "test@example.com",
        "password": "password123"
    }
    response = client.post("/api/auth/login", data=login_payload)
    if response.status_code == 200:
        token = response.json().get("access_token")
        print("  [PASS] /api/auth/login")
        return token
    else:
        print(f"  [FAIL] /api/auth/login: {response.text}")
        return None

def main():
    print("=== STARTING VERIFICATION ===\n")
    try:
        create_db_and_tables()
        test_mobile_integration()
        test_strategy_engine()
        token = test_auth_system()
        
        if token:
            print(f"\nAuth Token acquired: {token[:10]}...")
            
        print("\n=== VERIFICATION COMPLETE ===")
    except Exception as e:
        print(f"\n[ERROR] Verification Script Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
