import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, Base, engine
from app.services.seed_service import seed_database

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
    yield

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_auth_login():
    res = client.post("/api/auth/login", json={
        "email": "demo@travelplanner.com",
        "password": "demo123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@travelplanner.com"

def test_demo_preset_trip():
    res = client.get("/api/trips/demo-preset")
    assert res.status_code == 200
    trip = res.json()
    assert trip["destination"] == "Ahmedabad"
    assert len(trip["days"]) >= 3

def test_route_optimization():
    trip_res = client.get("/api/trips/demo-preset")
    trip_id = trip_res.json()["id"]

    res = client.post(f"/api/trips/{trip_id}/optimize", json={})
    assert res.status_code == 200
    data = res.json()
    assert "total_distance_saved_km" in data
    assert "day_results" in data

def test_conflict_detection_and_resolution():
    trip_res = client.get("/api/trips/demo-preset")
    trip_id = trip_res.json()["id"]

    scan_res = client.get(f"/api/trips/{trip_id}/conflicts")
    assert scan_res.status_code == 200
    data = scan_res.json()
    assert "conflicts" in data

    res_res = client.post(f"/api/trips/{trip_id}/conflicts/resolve", json={})
    assert res_res.status_code == 200
    scan_after = client.get(f"/api/trips/{trip_id}/conflicts").json()
    print("REMAINING CONFLICTS:", scan_after["conflicts"])
    assert res_res.json()["remaining_conflicts"] == 0

def test_flight_delay_simulation():
    trip_res = client.get("/api/trips/demo-preset")
    trip_id = trip_res.json()["id"]

    sim_res = client.post(f"/api/trips/{trip_id}/bookings/simulate-delay", json={
        "delay_hours": 2.0,
        "reason": "Air Traffic Control Delay"
    })
    assert sim_res.status_code == 200
    data = sim_res.json()
    assert data["conflicts_detected"] >= 2
    assert len(data["affected_items"]) >= 2

    apply_res = client.post(f"/api/trips/{trip_id}/bookings/apply-delay-resolution")
    assert apply_res.status_code == 200
    assert apply_res.json()["success"] is True

def test_rag_knowledge_search():
    res = client.post("/api/rag/query", json={
        "destination": "Ahmedabad",
        "query": "Is this destination good for a family trip?"
    })
    assert res.status_code == 200
    data = res.json()
    assert "family" in data["answer"].lower() or len(data["sources"]) > 0

def test_chatbot():
    trip_res = client.get("/api/trips/demo-preset")
    trip_id = trip_res.json()["id"]

    res = client.post("/api/chat", json={
        "trip_id": trip_id,
        "messages": [{"role": "user", "content": "How much have I spent?"}]
    })
    assert res.status_code == 200
    data = res.json()
    assert "budget" in data["message"].lower() or "spent" in data["message"].lower() or "cost" in data["message"].lower()
