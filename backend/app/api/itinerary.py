from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Trip, ItineraryDay, Activity, TripChange, User
from app.schemas import (
    ItineraryDayOut, ActivityOut, ActivityCreate, ActivityUpdate,
    OptimizeRouteRequest, OptimizeRouteResponse, NaturalLanguageEditRequest, TripChangeOut
)
from app.api.auth import get_current_user
from app.services.ai_service import AITravelPlannerService
from app.services.route_service import RouteOptimizerService

router = APIRouter(prefix="/trips/{trip_id}", tags=["Itinerary"])

@router.get("/itinerary", response_model=List[ItineraryDayOut])
def get_itinerary(trip_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    return [ItineraryDayOut.model_validate(d) for d in trip.days]

@router.post("/generate-itinerary", response_model=List[ItineraryDayOut])
def generate_itinerary(trip_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    trip = AITravelPlannerService.generate_trip_itinerary(db, trip)
    return [ItineraryDayOut.model_validate(d) for d in trip.days]

@router.post("/optimize", response_model=OptimizeRouteResponse)
def optimize_route(trip_id: int, req: OptimizeRouteRequest = OptimizeRouteRequest(), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Runs Google OR-Tools TSP with time window optimization."""
    try:
        return RouteOptimizerService.optimize_trip(db, trip_id, req.day_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/natural-language-edit", response_model=TripChangeOut)
def natural_language_edit(trip_id: int, req: NaturalLanguageEditRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Applies natural language edit and produces 'What Changed?' audit snapshot."""
    try:
        return AITravelPlannerService.apply_natural_language_edit(db, trip_id, req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/changes", response_model=List[TripChangeOut])
def get_trip_changes(trip_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    changes = db.query(TripChange).filter(TripChange.trip_id == trip_id).order_by(TripChange.created_at.desc()).all()
    return [
        TripChangeOut(
            id=c.id,
            trip_id=c.trip_id,
            change_type=c.change_type,
            description=c.description,
            reason=c.reason or "",
            before_state=c.before_state,
            after_state=c.after_state,
            travel_time_delta_minutes=c.travel_time_delta_minutes,
            travel_distance_delta_km=c.travel_distance_delta_km,
            budget_delta=c.budget_delta,
            created_at=str(c.created_at)
        )
        for c in changes
    ]

@router.post("/activities", response_model=ActivityOut)
def add_activity(trip_id: int, day_id: int, act_in: ActivityCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    day = db.query(ItineraryDay).filter(ItineraryDay.id == day_id, ItineraryDay.trip_id == trip_id).first()
    if not day:
        raise HTTPException(status_code=404, detail="Day not found.")

    act = Activity(
        itinerary_day_id=day.id,
        name=act_in.name,
        category=act_in.category,
        latitude=act_in.latitude,
        longitude=act_in.longitude,
        address=act_in.address,
        start_time=act_in.start_time,
        end_time=act_in.end_time,
        duration_minutes=act_in.duration_minutes,
        travel_time_minutes=act_in.travel_time_minutes,
        travel_distance_km=act_in.travel_distance_km,
        transport_mode=act_in.transport_mode,
        estimated_cost=act_in.estimated_cost,
        order_index=len(day.activities),
        rating=act_in.rating,
        opening_time=act_in.opening_time,
        closing_time=act_in.closing_time,
        why_chosen=act_in.why_chosen,
        photo_url=act_in.photo_url
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return ActivityOut.model_validate(act)

@router.put("/activities/{activity_id}", response_model=ActivityOut)
def update_activity(trip_id: int, activity_id: int, act_in: ActivityUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found.")

    for field, val in act_in.model_dump(exclude_unset=True).items():
        setattr(act, field, val)

    db.commit()
    db.refresh(act)
    return ActivityOut.model_validate(act)

@router.delete("/activities/{activity_id}")
def delete_activity(trip_id: int, activity_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found.")
    
    day = act.day
    db.delete(act)
    db.commit()

    if day:
        RouteOptimizerService.optimize_day(db, day)

    return {"success": True, "message": "Activity deleted and day re-optimized."}
