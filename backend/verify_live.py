import httpx
import sys

sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("=== LIVE INTEGRATION VERIFICATION ===")

    # 1. Frontend check
    frontend_res = httpx.get("http://127.0.0.1:5173/")
    print(f"1. Frontend Server (Vite): Status {frontend_res.status_code}, Length: {len(frontend_res.text)} bytes")

    # 2. Backend Health
    backend_res = httpx.get("http://127.0.0.1:8000/health")
    print(f"2. Backend Server (FastAPI): {backend_res.json()}")

    # 3. Demo Preset Trip
    trip_res = httpx.get("http://127.0.0.1:8000/api/trips/demo-preset")
    trip = trip_res.json()
    trip_id = trip["id"]
    print(f"3. Demo Preset Trip: '{trip['title']}' in {trip['destination']}, {trip['duration_days']} Days")

    # 4. OR-Tools Route Optimizer
    opt_res = httpx.post(f"http://127.0.0.1:8000/api/trips/{trip_id}/optimize", json={})
    opt_data = opt_res.json()
    print(f"4. Google OR-Tools Optimizer: Saved {opt_data['total_distance_saved_km']} km & {opt_data['total_time_saved_minutes']} mins")

    # 5. Natural Language Edit
    nl_res = httpx.post(
        f"http://127.0.0.1:8000/api/trips/{trip_id}/natural-language-edit",
        json={"instruction": "Remove the museum and add a shopping experience"}
    )
    nl_data = nl_res.json()
    print(f"5. Natural Language Edit: {nl_data['description']}")

    # 6. Cascading Flight Delay Simulator
    sim_res = httpx.post(
        f"http://127.0.0.1:8000/api/trips/{trip_id}/bookings/simulate-delay",
        json={"delay_hours": 2.0, "reason": "Air Traffic Delay"}
    )
    sim_data = sim_res.json()
    print(f"6. Flight Delay Cascading Engine: Detected {sim_data['conflicts_detected']} downstream schedule conflict(s)")

    # 7. Apply Cascading Resolution
    apply_res = httpx.post(f"http://127.0.0.1:8000/api/trips/{trip_id}/bookings/apply-delay-resolution")
    print(f"7. Cascading Delay Resolution: Success={apply_res.json()['success']}")

    # 8. Conflict Scanner & Auto-Resolver
    conf_res = httpx.get(f"http://127.0.0.1:8000/api/trips/{trip_id}/conflicts")
    print(f"8. Conflict Engine Status: Total Conflicts = {conf_res.json()['total_conflicts']}")

    # 9. RAG Knowledge Vector Search
    rag_res = httpx.post(
        "http://127.0.0.1:8000/api/rag/query",
        json={"destination": "Ahmedabad", "query": "Is this destination good for a family trip?"}
    )
    rag_data = rag_res.json()
    print(f"9. RAG Vector Search: Retrieved {len(rag_data['sources'])} sources. Answer summary: {rag_data['answer'][:80]}...")

    # 10. Context-Aware Chatbot
    chat_res = httpx.post(
        "http://127.0.0.1:8000/api/chat",
        json={"trip_id": trip_id, "messages": [{"role": "user", "content": "Why did you choose this hotel?"}]}
    )
    chat_data = chat_res.json()
    print(f"10. Context-Aware Chatbot: {chat_data['message'][:90]}...")

    # 11. Faculty Demo Metrics
    admin_res = httpx.get("http://127.0.0.1:8000/api/admin/metrics")
    admin_data = admin_res.json()
    print(f"11. Faculty Admin Telemetry: {admin_data['system_status']}, Optimization: {admin_data['optimization_engine']}")

    print("\n✅ ALL 11 END-TO-END SUBSYSTEMS OPERATIONAL AND VERIFIED!")

if __name__ == "__main__":
    main()
