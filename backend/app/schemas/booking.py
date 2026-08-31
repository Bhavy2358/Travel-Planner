from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class BookingBase(BaseModel):
    booking_type: str # flight, hotel, transport, restaurant, activity
    title: str
    provider: str = "Demo Provider"
    confirmation_code: str = "DEMO-10928"
    status: str = "confirmed" # confirmed, pending, cancelled, conflict, changed
    start_datetime: str
    end_datetime: Optional[str] = None
    cost: float = 0.0
    currency: str = "INR"
    details: Optional[str] = "{}"
    parent_booking_id: Optional[int] = None
    notes: Optional[str] = ""

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    start_datetime: Optional[str] = None
    end_datetime: Optional[str] = None
    cost: Optional[float] = None
    notes: Optional[str] = None

class BookingOut(BookingBase):
    id: int
    trip_id: int

    class Config:
        from_attributes = True

# --- Simulation Schemas for Cascading Conflicts ---

class FlightDelaySimulateRequest(BaseModel):
    delay_hours: float = 2.0 # Number of hours flight is delayed (e.g. 2.0)
    reason: str = "Air Traffic Control Delay (Simulated)"

class AffectedItem(BaseModel):
    type: str # booking or activity
    id: int
    name: str
    original_time: str
    new_suggested_time: str
    conflict_description: str

class BookingConflictCascadeOut(BaseModel):
    event_description: str
    conflicts_detected: int
    affected_items: List[AffectedItem]
    ai_resolution_plan: str
    can_auto_apply: bool = True
