from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Trip, Booking, User
from app.schemas import (
    BookingCreate, BookingUpdate, BookingOut,
    FlightDelaySimulateRequest, BookingConflictCascadeOut
)
from app.api.auth import get_current_user
from app.services.booking_service import BookingDependencyService
from app.integrations.flights import get_flight_service
from app.integrations.hotels import get_hotel_service

router = APIRouter(tags=["Bookings & Services"])

@router.get("/trips/{trip_id}/bookings", response_model=List[BookingOut])
def get_trip_bookings(trip_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    return [BookingOut.model_validate(b) for b in trip.bookings]

@router.post("/trips/{trip_id}/bookings", response_model=BookingOut)
def create_booking(trip_id: int, booking_in: BookingCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    b = Booking(
        trip_id=trip.id,
        booking_type=booking_in.booking_type,
        title=booking_in.title,
        provider=booking_in.provider,
        confirmation_code=booking_in.confirmation_code,
        status=booking_in.status,
        start_datetime=booking_in.start_datetime,
        end_datetime=booking_in.end_datetime,
        cost=booking_in.cost,
        currency=booking_in.currency,
        details=booking_in.details,
        parent_booking_id=booking_in.parent_booking_id,
        notes=booking_in.notes
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return BookingOut.model_validate(b)

@router.put("/trips/{trip_id}/bookings/{booking_id}", response_model=BookingOut)
def update_booking(trip_id: int, booking_id: int, booking_in: BookingUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found.")

    for field, val in booking_in.model_dump(exclude_unset=True).items():
        setattr(b, field, val)

    db.commit()
    db.refresh(b)
    return BookingOut.model_validate(b)

@router.delete("/trips/{trip_id}/bookings/{booking_id}")
def delete_booking(trip_id: int, booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found.")
    db.delete(b)
    db.commit()
    return {"success": True, "message": "Booking deleted."}

@router.post("/trips/{trip_id}/bookings/simulate-delay", response_model=BookingConflictCascadeOut)
def simulate_flight_delay(trip_id: int, req: FlightDelaySimulateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Simulates a flight delay and calculates cascading conflicts across transfers, hotels, and activities."""
    try:
        return BookingDependencyService.simulate_flight_delay(db, trip_id, req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/trips/{trip_id}/bookings/apply-delay-resolution")
def apply_flight_delay_resolution(trip_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Applies AI-calculated cascading synchronization."""
    try:
        return BookingDependencyService.apply_flight_delay_resolution(db, trip_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- Module Search Endpoints ---

@router.get("/integrations/flights/search")
def search_flights(origin: str = "Delhi", destination: str = "Ahmedabad", date: str = "2026-09-15", passengers: int = 1):
    flight_service = get_flight_service()
    results = flight_service.search_flights(origin, destination, date, passengers)
    return {"origin": origin, "destination": destination, "date": date, "flights": results}

@router.get("/integrations/hotels/search")
def search_hotels(destination: str = "Ahmedabad", checkin: str = "2026-09-15", checkout: str = "2026-09-17", guests: int = 2, max_price: Optional[float] = None):
    hotel_service = get_hotel_service()
    results = hotel_service.search_hotels(destination, checkin, checkout, guests, max_price)
    return {"destination": destination, "hotels": results}
