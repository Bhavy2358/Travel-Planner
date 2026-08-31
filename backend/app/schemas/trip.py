from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.itinerary import ItineraryDayOut

class TripBase(BaseModel):
    title: str
    destination: str
    starting_location: Optional[str] = "City Center"
    start_date: str
    end_date: str
    duration_days: int = 3
    travelers_count: int = 2
    adults: int = 2
    children: int = 0
    budget_category: str = "Standard"
    total_budget: float = 25000.0
    currency: str = "INR"
    travel_preferences: str = "Culture, Food, History"
    travel_pace: str = "Balanced"
    transport_mode: str = "Taxi / Auto"
    accommodation_type: str = "Hotel"

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    total_budget: Optional[float] = None
    currency: Optional[str] = None
    travel_pace: Optional[str] = None
    transport_mode: Optional[str] = None
    accommodation_type: Optional[str] = None
    status: Optional[str] = None

class TripOut(TripBase):
    id: int
    user_id: int
    status: str
    total_estimated_cost: float
    total_distance_km: float
    total_travel_time_minutes: int
    before_opt_distance_km: float
    before_opt_time_minutes: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TripDetailOut(TripOut):
    days: List[ItineraryDayOut] = []

class BudgetCategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str

class TripStatsOut(BaseModel):
    trip_id: int
    destination: str
    total_budget: float
    total_estimated_cost: float
    remaining_budget: float
    total_activities: int
    total_distance_km: float
    total_travel_time_minutes: int
    total_bookings: int
    conflicts_count: int
    budget_breakdown: List[BudgetCategoryBreakdown]
    ai_budget_insight: str
