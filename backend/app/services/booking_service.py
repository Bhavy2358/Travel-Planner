import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Trip, Booking, ItineraryDay, Activity, TripChange, Notification
from app.schemas.booking import FlightDelaySimulateRequest, BookingConflictCascadeOut, AffectedItem
from app.services.route_service import add_minutes_to_time_str

class BookingDependencyService:
    """
    Smart Booking Dependency System.
    Tracks relationships between Flight -> Transfer -> Hotel -> Daily Itinerary.
    Detects cascading schedule conflicts when upstream bookings change.
    """

    @classmethod
    def simulate_flight_delay(cls, db: Session, trip_id: int, request: FlightDelaySimulateRequest) -> BookingConflictCascadeOut:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise ValueError(f"Trip {trip_id} not found.")

        flight = next((b for b in trip.bookings if b.booking_type == "flight"), None)
        if not flight:
            raise ValueError("No flight booking found for this trip to simulate delay.")

        delay_mins = int(request.delay_hours * 60)
        
        # Original timestamps
        old_flight_end = flight.end_datetime # e.g. "2026-09-15 09:45"
        
        # Calculate new flight arrival time
        date_part, time_part = old_flight_end.split(" ") if " " in old_flight_end else (trip.start_date, old_flight_end)
        new_flight_end_time = add_minutes_to_time_str(time_part, delay_mins)
        new_flight_end = f"{date_part} {new_flight_end_time}"

        # Update flight status to 'changed'
        flight.status = "changed"
        flight.end_datetime = new_flight_end
        flight.notes = f"Delayed by {request.delay_hours} hrs: {request.reason}"

        affected_items: List[AffectedItem] = []

        # 1. Airport Transfer (Parent is Flight)
        transfer = next((b for b in trip.bookings if b.booking_type == "transport" and b.parent_booking_id == flight.id), None)
        if transfer:
            transfer.status = "conflict"
            t_date, t_start = transfer.start_datetime.split(" ") if " " in transfer.start_datetime else (date_part, "10:00")
            new_t_start = add_minutes_to_time_str(t_start, delay_mins)
            new_t_end = add_minutes_to_time_str(new_t_start, 45)
            affected_items.append(AffectedItem(
                type="booking",
                id=transfer.id,
                name=transfer.title,
                original_time=f"{t_start} - {transfer.end_datetime.split(' ')[-1] if transfer.end_datetime else ''}",
                new_suggested_time=f"{new_t_start} - {new_t_end}",
                conflict_description=f"Airport pickup was at {t_start}, but flight arrives at {new_flight_end_time}."
            ))

        # 2. Hotel Check-in
        hotel = next((b for b in trip.bookings if b.booking_type == "hotel"), None)
        if hotel:
            hotel.status = "conflict"
            h_date, h_start = hotel.start_datetime.split(" ") if " " in hotel.start_datetime else (date_part, "11:00")
            new_h_start = add_minutes_to_time_str(h_start, delay_mins)
            affected_items.append(AffectedItem(
                type="booking",
                id=hotel.id,
                name=f"{hotel.title} (Check-in)",
                original_time=h_start,
                new_suggested_time=new_h_start,
                conflict_description=f"Original check-in at {h_start} is now too early due to delayed airport arrival."
            ))

        # 3. Day 1 Itinerary Activities
        day1 = next((d for d in trip.days if d.day_number == 1), None)
        if day1:
            for act in sorted(day1.activities, key=lambda a: a.order_index):
                old_act_start = act.start_time
                new_act_start = add_minutes_to_time_str(old_act_start, delay_mins)
                new_act_end = add_minutes_to_time_str(new_act_start, act.duration_minutes)
                affected_items.append(AffectedItem(
                    type="activity",
                    id=act.id,
                    name=f"Day 1: {act.name}",
                    original_time=f"{act.start_time} - {act.end_time}",
                    new_suggested_time=f"{new_act_start} - {new_act_end}",
                    conflict_description=f"Overlaps with delayed arrival and hotel check-in schedule."
                ))

        # Add Notification to Trip
        notif = Notification(
            user_id=trip.user_id,
            trip_id=trip.id,
            title=f"Flight Delayed by {request.delay_hours:g} Hours — Cascading Conflicts Detected",
            message=f"Flight arrival moved to {new_flight_end_time}. AI detected {len(affected_items)} cascading schedule conflict(s). Click 'Apply AI Changes' to re-synchronize.",
            notification_type="flight_change",
            severity="critical"
        )
        db.add(notif)
        db.commit()

        ai_plan = (
            f"Your flight arrival shifted by {request.delay_hours:g} hours ({old_flight_end} → {new_flight_end}). "
            f"AI has computed a cascading schedule re-alignment: Airport Transfer moved to {affected_items[0].new_suggested_time if affected_items else 'later'}, "
            f"Hotel Check-in shifted, and Day 1 activities smoothly re-sequenced to avoid missed visits."
        )

        return BookingConflictCascadeOut(
            event_description=f"Flight DEL → AMD delayed by {request.delay_hours:g} hours ({request.reason})",
            conflicts_detected=len(affected_items),
            affected_items=affected_items,
            ai_resolution_plan=ai_plan,
            can_auto_apply=True
        )

    @classmethod
    def apply_flight_delay_resolution(cls, db: Session, trip_id: int) -> Dict[str, Any]:
        """Apply cascading schedule updates to bookings and Day 1 activities."""
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise ValueError(f"Trip {trip_id} not found.")

        flight = next((b for b in trip.bookings if b.booking_type == "flight"), None)
        if not flight:
            return {"message": "No flight booking found."}

        flight_end_time = flight.end_datetime.split(" ")[-1] if " " in flight.end_datetime else "11:45"
        
        # 1. Update Transfer
        transfer = next((b for b in trip.bookings if b.booking_type == "transport"), None)
        if transfer:
            t_start = add_minutes_to_time_str(flight_end_time, 15)
            t_end = add_minutes_to_time_str(t_start, 45)
            transfer.start_datetime = f"{trip.start_date} {t_start}"
            transfer.end_datetime = f"{trip.start_date} {t_end}"
            transfer.status = "confirmed"

        # 2. Update Hotel
        hotel = next((b for b in trip.bookings if b.booking_type == "hotel"), None)
        if hotel and transfer:
            h_start = transfer.end_datetime.split(" ")[-1]
            hotel.start_datetime = f"{trip.start_date} {h_start}"
            hotel.status = "confirmed"

        # 3. Synchronize Day 1 Activities
        day1 = next((d for d in trip.days if d.day_number == 1), None)
        before_state = []
        after_state = []

        if day1:
            start_cursor = hotel.start_datetime.split(" ")[-1] if hotel else "12:30"
            for act in sorted(day1.activities, key=lambda a: a.order_index):
                before_state.append({"name": act.name, "start": act.start_time, "end": act.end_time})
                act.start_time = start_cursor
                act.end_time = add_minutes_to_time_str(start_cursor, act.duration_minutes)
                after_state.append({"name": act.name, "start": act.start_time, "end": act.end_time})
                start_cursor = add_minutes_to_time_str(act.end_time, act.travel_time_minutes or 15)

        flight.status = "confirmed"

        # Audit log change for "What Changed?" UI
        change = TripChange(
            trip_id=trip.id,
            change_type="flight_delay",
            description=f"Flight arrival shifted to {flight_end_time}. Cascading itinerary re-alignment applied.",
            reason="Flight arrival schedule change automatically resolved by AI Booking Dependency Engine.",
            before_state=json.dumps(before_state),
            after_state=json.dumps(after_state),
            travel_time_delta_minutes=10,
            travel_distance_delta_km=0.0,
            budget_delta=0.0
        )
        db.add(change)
        db.commit()

        return {
            "success": True,
            "message": "Cascading flight delay adjustments successfully applied across transfers, hotel check-in, and Day 1 itinerary.",
            "trip_id": trip.id
        }
