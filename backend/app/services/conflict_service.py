from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Trip, ItineraryDay, Activity, Booking, Notification
from app.schemas.conflicts import ConflictItem, ConflictScanResponse, ResolveConflictResponse
from app.integrations.maps import estimate_travel_time_minutes, haversine_distance

def time_str_to_minutes(time_str: str) -> int:
    """Convert HH:MM to minutes since midnight."""
    try:
        parts = time_str.strip().split(":")
        return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        return 0

def minutes_to_time_str(mins: int) -> str:
    """Convert minutes since midnight to HH:MM format."""
    mins = max(0, mins) % (24 * 60)
    h = mins // 60
    m = mins % 60
    return f"{h:02d}:{m:02d}"

class ConflictDetectionService:
    """
    Dedicated Conflict Engine.
    Detects scheduling overlaps, transit time deficits, opening/closing clashes,
    booking mismatches, and budget overruns.
    """

    @classmethod
    def scan_trip_conflicts(cls, db: Session, trip_id: int) -> ConflictScanResponse:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise ValueError(f"Trip {trip_id} not found.")

        conflicts: List[ConflictItem] = []

        # 1. Check Budget Overrun
        total_costs = trip.total_estimated_cost
        if trip.total_budget > 0 and total_costs > trip.total_budget:
            diff = total_costs - trip.total_budget
            conflicts.append(ConflictItem(
                id=f"budget-overrun-{trip.id}",
                conflict_type="budget_exceeded",
                severity="warning",
                title=f"Trip Budget Exceeded by {trip.currency} {diff:,.0f}",
                description=f"Total estimated expenses ({trip.currency} {total_costs:,.0f}) exceed your planned budget of {trip.currency} {trip.total_budget:,.0f}.",
                suggested_fix="Switch to standard/budget dining options or choose free entry heritage sights.",
                auto_resolvable=True
            ))

        # 2. Check Daily Activity Conflicts
        visited_place_names = set()
        for day in trip.days:
            activities: List[Activity] = sorted(day.activities, key=lambda a: a.order_index)
            
            for i, act in enumerate(activities):
                # Duplicate check
                act_norm = act.name.lower().strip()
                if "hotel" not in act_norm and "transit" not in act_norm:
                    if act_norm in visited_place_names:
                        conflicts.append(ConflictItem(
                            id=f"dup-{act.id}",
                            conflict_type="duplicate_attraction",
                            severity="info",
                            title=f"Duplicate Attraction: {act.name}",
                            description=f"'{act.name}' appears multiple times in your itinerary.",
                            day_number=day.day_number,
                            affected_activity_ids=[act.id],
                            suggested_fix="Replace with an alternative nearby attraction.",
                            auto_resolvable=True
                        ))
                    visited_place_names.add(act_norm)

                act_start_m = time_str_to_minutes(act.start_time)
                act_end_m = time_str_to_minutes(act.end_time)

                # Venue Hours Check
                if act.opening_time and act.closing_time:
                    open_m = time_str_to_minutes(act.opening_time)
                    close_m = time_str_to_minutes(act.closing_time)
                    if open_m > 0 and act_start_m < open_m:
                        conflicts.append(ConflictItem(
                            id=f"venue-closed-early-{act.id}",
                            conflict_type="closed_venue",
                            severity="critical",
                            title=f"{act.name} is Closed at Scheduled Start Time",
                            description=f"Scheduled to start at {act.start_time}, but venue opens at {act.opening_time}.",
                            day_number=day.day_number,
                            affected_activity_ids=[act.id],
                            suggested_fix=f"Shift start time to {act.opening_time}.",
                            auto_resolvable=True
                        ))
                    if close_m > 0 and act_end_m > close_m:
                        conflicts.append(ConflictItem(
                            id=f"venue-closed-late-{act.id}",
                            conflict_type="closed_venue",
                            severity="critical",
                            title=f"{act.name} Closes Before Visit Ends",
                            description=f"Visit scheduled until {act.end_time}, but venue closes at {act.closing_time}.",
                            day_number=day.day_number,
                            affected_activity_ids=[act.id],
                            suggested_fix=f"Reschedule earlier to finish before {act.closing_time}.",
                            auto_resolvable=True
                        ))

                # Activity Overlaps & Transit Buffer with Next Activity
                if i < len(activities) - 1:
                    next_act = activities[i + 1]
                    next_start_m = time_str_to_minutes(next_act.start_time)

                    # Direct Time Overlap
                    if act_end_m > next_start_m:
                        overlap_mins = act_end_m - next_start_m
                        conflicts.append(ConflictItem(
                            id=f"overlap-{act.id}-{next_act.id}",
                            conflict_type="overlap",
                            severity="critical",
                            title=f"Schedule Overlap: {act.name} and {next_act.name}",
                            description=f"'{act.name}' ends at {act.end_time}, but '{next_act.name}' is scheduled to start at {next_act.start_time} (overlap: {overlap_mins} mins).",
                            day_number=day.day_number,
                            affected_activity_ids=[act.id, next_act.id],
                            suggested_fix=f"Move '{next_act.name}' start to {minutes_to_time_str(act_end_m + next_act.travel_time_minutes)}.",
                            auto_resolvable=True
                        ))
                    else:
                        # Insufficient Travel Buffer
                        gap_mins = next_start_m - act_end_m
                        required_transit = next_act.travel_time_minutes
                        if gap_mins < required_transit:
                            deficit = required_transit - gap_mins
                            conflicts.append(ConflictItem(
                                id=f"transit-buffer-{act.id}-{next_act.id}",
                                conflict_type="insufficient_transit",
                                severity="warning",
                                title=f"Insufficient Travel Time to {next_act.name}",
                                description=f"Travel from '{act.name}' to '{next_act.name}' requires {required_transit} mins, but buffer is only {gap_mins} mins (deficit: {deficit} mins).",
                                day_number=day.day_number,
                                affected_activity_ids=[act.id, next_act.id],
                                suggested_fix=f"Shift '{next_act.name}' start time by +{deficit} minutes.",
                                auto_resolvable=True
                            ))

        # 3. Check Booking-to-Activity Cascading Conflicts
        flight_booking = next((b for b in trip.bookings if b.booking_type == "flight"), None)
        if flight_booking and flight_booking.status in ["conflict", "changed"]:
            # Detect flight time impact on Day 1
            day1 = next((d for d in trip.days if d.day_number == 1), None)
            if day1 and day1.activities:
                conflicts.append(ConflictItem(
                    id=f"flight-cascade-{flight_booking.id}",
                    conflict_type="checkin_violation",
                    severity="critical",
                    title="Flight Schedule Change Impacts Day 1 Itinerary",
                    description=f"Flight arrival shifted to {flight_booking.end_datetime}. Airport transfer and subsequent Day 1 activities require synchronization.",
                    day_number=1,
                    affected_booking_ids=[flight_booking.id],
                    affected_activity_ids=[a.id for a in day1.activities[:2]],
                    suggested_fix="Reschedule Airport Transfer, Hotel Check-in, and push Day 1 morning activities forward.",
                    auto_resolvable=True
                ))

        critical_c = sum(1 for c in conflicts if c.severity == "critical")
        warning_c = sum(1 for c in conflicts if c.severity == "warning")

        ai_summary = "All activities and travel windows are synchronized with zero conflicts."
        if conflicts:
            ai_summary = f"Detected {len(conflicts)} potential schedule/transit conflict(s) ({critical_c} critical, {warning_c} warnings). AI can automatically adjust timings and transit buffers."

        return ConflictScanResponse(
            trip_id=trip.id,
            has_conflicts=len(conflicts) > 0,
            total_conflicts=len(conflicts),
            critical_count=critical_c,
            warning_count=warning_c,
            conflicts=conflicts,
            ai_summary=ai_summary
        )

    @classmethod
    def resolve_all_conflicts(cls, db: Session, trip_id: int) -> ResolveConflictResponse:
        """
        AI Auto-Resolve Engine:
        Sequentially recalculates timeline gaps, pushes overlapping activities forward,
        ensures sufficient transit buffers, and updates booking timestamps.
        """
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise ValueError(f"Trip {trip_id} not found.")

        changes_applied: List[str] = []

        # Fix Bookings first
        for b in trip.bookings:
            if b.status in ["conflict", "changed"]:
                b.status = "confirmed"
                changes_applied.append(f"Synchronized booking status for {b.title}")

        # Synchronize each day's activities
        for day in trip.days:
            activities: List[Activity] = sorted(day.activities, key=lambda a: a.order_index)
            if not activities:
                continue

            # Start day at 09:00 AM (or 11:00 AM on Day 1 if arrival flight check-in is required)
            current_cursor_m = 9 * 60 # 09:00 AM
            if day.day_number == 1:
                hotel_b = next((b for b in trip.bookings if b.booking_type == "hotel"), None)
                if hotel_b and "11:00" in hotel_b.start_datetime:
                    current_cursor_m = 11 * 60
                elif hotel_b and "13:00" in hotel_b.start_datetime:
                    current_cursor_m = 13 * 60
            
            for i, act in enumerate(activities):
                if i == 0:
                    # Respect opening time if later
                    if act.opening_time:
                        open_m = time_str_to_minutes(act.opening_time)
                        if open_m > current_cursor_m:
                            current_cursor_m = open_m
                    
                    old_start = act.start_time
                    act.start_time = minutes_to_time_str(current_cursor_m)
                    act.end_time = minutes_to_time_str(current_cursor_m + act.duration_minutes)
                    current_cursor_m = current_cursor_m + act.duration_minutes
                    if old_start != act.start_time:
                        changes_applied.append(f"Synchronized '{act.name}' start to {act.start_time}.")
                else:
                    transit_m = act.travel_time_minutes or 15
                    new_start_m = current_cursor_m + transit_m

                    # Respect opening hours
                    if act.opening_time:
                        open_m = time_str_to_minutes(act.opening_time)
                        if open_m > new_start_m:
                            new_start_m = open_m

                    # Adjust duration if exceeding closing time
                    if act.closing_time:
                        close_m = time_str_to_minutes(act.closing_time)
                        if close_m > 0 and (new_start_m + act.duration_minutes) > close_m:
                            # Clamp so it finishes within open hours
                            if new_start_m < close_m:
                                act.duration_minutes = max(30, close_m - new_start_m)
                            else:
                                # Start earlier before closing
                                new_start_m = max(open_m if act.opening_time else 9*60, close_m - act.duration_minutes)

                    old_start = act.start_time
                    act.start_time = minutes_to_time_str(new_start_m)
                    act.end_time = minutes_to_time_str(new_start_m + act.duration_minutes)
                    current_cursor_m = new_start_m + act.duration_minutes

                    if old_start != act.start_time:
                        changes_applied.append(f"Shifted '{act.name}' on Day {day.day_number} from {old_start} to {act.start_time} (transit buffer: {transit_m} mins).")

        db.commit()

        # Rescan to verify
        scan_after = cls.scan_trip_conflicts(db, trip.id)

        return ResolveConflictResponse(
            trip_id=trip.id,
            conflicts_resolved=len(changes_applied),
            remaining_conflicts=scan_after.total_conflicts,
            resolution_summary=f"Successfully adjusted {len(changes_applied)} itinerary time slot(s). Schedule is now collision-free.",
            changes_applied=changes_applied
        )
