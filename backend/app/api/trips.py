from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Trip, User, Booking, Activity
from app.schemas import (
    TripCreate, TripUpdate, TripOut, TripDetailOut, TripStatsOut, BudgetCategoryBreakdown
)
from app.api.auth import get_current_user
from app.services.ai_service import AITravelPlannerService
from app.services.seed_service import create_ahmedabad_demo_trip
from app.services.conflict_service import ConflictDetectionService

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.post("", response_model=TripDetailOut)
def create_trip(trip_in: TripCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate duration
    duration = max(1, trip_in.duration_days)

    trip = Trip(
        user_id=current_user.id,
        title=trip_in.title or f"{trip_in.destination} AI Itinerary",
        destination=trip_in.destination,
        starting_location=trip_in.starting_location or "City Center",
        start_date=trip_in.start_date,
        end_date=trip_in.end_date,
        duration_days=duration,
        travelers_count=trip_in.travelers_count,
        adults=trip_in.adults,
        children=trip_in.children,
        budget_category=trip_in.budget_category,
        total_budget=trip_in.total_budget,
        currency=trip_in.currency,
        travel_preferences=trip_in.travel_preferences,
        travel_pace=trip_in.travel_pace,
        transport_mode=trip_in.transport_mode,
        accommodation_type=trip_in.accommodation_type,
        status="planning"
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    # Automatically generate AI Itinerary & optimize with OR-Tools
    trip = AITravelPlannerService.generate_trip_itinerary(db, trip)
    return TripDetailOut.model_validate(trip)

@router.get("", response_model=List[TripOut])
def list_trips(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).order_by(Trip.created_at.desc()).all()
    return [TripOut.model_validate(t) for t in trips]

@router.get("/demo-preset", response_model=TripDetailOut)
def get_or_create_demo_trip(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Provides instant 1-click access to the Ahmedabad 3-Day Demo Trip for faculty presentation."""
    trip = db.query(Trip).filter(Trip.destination == "Ahmedabad", Trip.user_id == current_user.id).first()
    if not trip:
        trip = create_ahmedabad_demo_trip(db, current_user.id)
    return TripDetailOut.model_validate(trip)

@router.post("/seed-demo", response_model=TripDetailOut)
def reset_demo_trip(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Reset or initialize Ahmedabad demo trip."""
    existing = db.query(Trip).filter(Trip.destination == "Ahmedabad", Trip.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
    trip = create_ahmedabad_demo_trip(db, current_user.id)
    return TripDetailOut.model_validate(trip)

@router.get("/{trip_id}", response_model=TripDetailOut)
def get_trip(trip_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    return TripDetailOut.model_validate(trip)

@router.put("/{trip_id}", response_model=TripOut)
def update_trip(trip_id: int, trip_in: TripUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    for field, val in trip_in.model_dump(exclude_unset=True).items():
        setattr(trip, field, val)

    db.commit()
    db.refresh(trip)
    return TripOut.model_validate(trip)

@router.delete("/{trip_id}")
def delete_trip(trip_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    db.delete(trip)
    db.commit()
    return {"success": True, "message": "Trip deleted successfully."}

@router.get("/{trip_id}/stats", response_model=TripStatsOut)
def get_trip_stats(trip_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    # Calculate category spending breakdown
    total_activities = sum(len(d.activities) for d in trip.days)
    
    # Bookings costs
    flight_cost = sum(b.cost for b in trip.bookings if b.booking_type == "flight")
    hotel_cost = sum(b.cost for b in trip.bookings if b.booking_type == "hotel")
    transport_cost = sum(b.cost for b in trip.bookings if b.booking_type == "transport") + sum(a.travel_distance_km * 18 for d in trip.days for a in d.activities)
    
    # Activity & Food costs
    attraction_cost = sum(a.estimated_cost for d in trip.days for a in d.activities if "Food" not in a.category and "Hotel" not in a.category and "Transport" not in a.category)
    food_cost = sum(a.estimated_cost for d in trip.days for a in d.activities if "Food" in a.category) or (trip.duration_days * 1200.0)
    shopping_cost = sum(a.estimated_cost for d in trip.days for a in d.activities if "Shopping" in a.category) or 800.0
    misc_cost = 600.0

    total_est = flight_cost + hotel_cost + transport_cost + attraction_cost + food_cost + shopping_cost + misc_cost
    trip.total_estimated_cost = round(total_est, 2)
    db.commit()

    breakdown = [
        BudgetCategoryBreakdown(category="Hotels", amount=hotel_cost, percentage=round((hotel_cost/total_est)*100, 1) if total_est else 0, color="#6366f1"),
        BudgetCategoryBreakdown(category="Flights", amount=flight_cost, percentage=round((flight_cost/total_est)*100, 1) if total_est else 0, color="#3b82f6"),
        BudgetCategoryBreakdown(category="Food & Dining", amount=food_cost, percentage=round((food_cost/total_est)*100, 1) if total_est else 0, color="#f59e0b"),
        BudgetCategoryBreakdown(category="Transportation", amount=transport_cost, percentage=round((transport_cost/total_est)*100, 1) if total_est else 0, color="#10b981"),
        BudgetCategoryBreakdown(category="Attractions & Tickets", amount=attraction_cost, percentage=round((attraction_cost/total_est)*100, 1) if total_est else 0, color="#ec4899"),
        BudgetCategoryBreakdown(category="Shopping & Souvenirs", amount=shopping_cost, percentage=round((shopping_cost/total_est)*100, 1) if total_est else 0, color="#8b5cf6"),
        BudgetCategoryBreakdown(category="Miscellaneous", amount=misc_cost, percentage=round((misc_cost/total_est)*100, 1) if total_est else 0, color="#64748b")
    ]

    conflicts_res = ConflictDetectionService.scan_trip_conflicts(db, trip.id)

    remaining = trip.total_budget - total_est

    # AI Budget Insight
    transport_pct = round((transport_cost / total_est) * 100) if total_est else 0
    if transport_pct > 15:
        ai_insight = f"Transportation is consuming {transport_pct}% of your budget. Sticking with centrally located accommodation in {trip.destination} saves ~{trip.currency} 2,400 in inter-city cab fares."
    else:
        ai_insight = f"Your budget allocation is well-balanced. {remaining:,.0f} {trip.currency} remains as a contingency buffer for local shopping & dining."

    return TripStatsOut(
        trip_id=trip.id,
        destination=trip.destination,
        total_budget=trip.total_budget,
        total_estimated_cost=trip.total_estimated_cost,
        remaining_budget=round(remaining, 2),
        total_activities=total_activities,
        total_distance_km=trip.total_distance_km,
        total_travel_time_minutes=trip.total_travel_time_minutes,
        total_bookings=len(trip.bookings),
        conflicts_count=conflicts_res.total_conflicts,
        budget_breakdown=breakdown,
        ai_budget_insight=ai_insight
    )
