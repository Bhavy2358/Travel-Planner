from pydantic import BaseModel, Field
from typing import List, Optional

# --- Activity Schemas ---

class ActivityBase(BaseModel):
    name: str
    category: str = "Culture"
    latitude: float = 0.0
    longitude: float = 0.0
    address: Optional[str] = ""
    start_time: str = "09:00"
    end_time: str = "10:30"
    duration_minutes: int = 90
    travel_time_minutes: int = 15
    travel_distance_km: float = 2.5
    transport_mode: str = "Taxi"
    estimated_cost: float = 0.0
    order_index: int = 0
    rating: float = 4.5
    opening_time: str = "08:00"
    closing_time: str = "19:00"
    why_chosen: str = "Matches your interests and optimizes travel distance."
    photo_url: Optional[str] = ""
    is_locked: bool = False
    booking_id: Optional[int] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    estimated_cost: Optional[float] = None
    order_index: Optional[int] = None
    is_locked: Optional[bool] = None
    why_chosen: Optional[str] = None

class ActivityOut(ActivityBase):
    id: int
    itinerary_day_id: int

    class Config:
        from_attributes = True

# --- Day Schemas ---

class ItineraryDayBase(BaseModel):
    day_number: int
    date: str
    area_name: str = "City Highlights"
    theme: str = "Heritage & Local Delights"
    morning_summary: Optional[str] = None
    afternoon_summary: Optional[str] = None
    evening_summary: Optional[str] = None
    estimated_distance_km: float = 0.0
    estimated_travel_time_minutes: int = 0
    estimated_cost: float = 0.0
    is_optimized: bool = True
    before_opt_distance_km: float = 0.0
    before_opt_time_minutes: int = 0

class ItineraryDayOut(ItineraryDayBase):
    id: int
    trip_id: int
    activities: List[ActivityOut] = []

    class Config:
        from_attributes = True

# --- Strict AI Structured Output Schemas (For validation & repair) ---

class AIActivity(BaseModel):
    name: str = Field(..., description="Name of the tourist attraction or restaurant")
    category: str = Field(..., description="Category: Historical, Culture, Food, Nature, Adventure, Shopping, Relaxation, Transport, Hotel")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    address: str = Field("", description="Street address or locality")
    start_time: str = Field(..., description="Start time in HH:MM format e.g. 09:00")
    end_time: str = Field(..., description="End time in HH:MM format e.g. 11:00")
    duration_minutes: int = Field(..., description="Visit duration in minutes")
    travel_time_minutes: int = Field(15, description="Travel time from previous activity in minutes")
    travel_distance_km: float = Field(2.5, description="Distance from previous point in km")
    transport_mode: str = Field("Taxi", description="Recommended transit: Walking, Taxi, Auto, Metro")
    estimated_cost: float = Field(0.0, description="Estimated cost in trip currency per traveler")
    rating: float = Field(4.5, description="User rating (1-5)")
    opening_time: str = Field("08:00", description="Venue opening time HH:MM")
    closing_time: str = Field("19:00", description="Venue closing time HH:MM")
    why_chosen: str = Field(..., description="Specific, explainable reason why this was selected based on user preferences")
    photo_url: str = Field("", description="Representative image URL")

class AIDayPlan(BaseModel):
    day_number: int
    date: str
    area_name: str
    theme: str
    morning_summary: str
    afternoon_summary: str
    evening_summary: str
    activities: List[AIActivity]

class AIItineraryPlan(BaseModel):
    destination: str
    total_days: int
    currency: str
    overall_vibe: str
    days: List[AIDayPlan]

# --- Route Optimization Schemas ---

class OptimizeRouteRequest(BaseModel):
    day_id: Optional[int] = None # If None, optimizes all days in trip

class RouteOptimizationResult(BaseModel):
    day_number: int
    original_distance_km: float
    optimized_distance_km: float
    distance_saved_km: float
    original_time_minutes: int
    optimized_time_minutes: int
    time_saved_minutes: int
    optimized_sequence: List[str]
    optimization_method: str = "Google OR-Tools TSP with Time Windows"

class OptimizeRouteResponse(BaseModel):
    trip_id: int
    total_distance_saved_km: float
    total_time_saved_minutes: int
    day_results: List[RouteOptimizationResult]

# --- Natural Language Edit Schemas ---

class NaturalLanguageEditRequest(BaseModel):
    instruction: str = Field(..., description="e.g. 'Remove museum and add shopping experience' or 'Make day 2 more relaxed'")

class TripChangeOut(BaseModel):
    id: int
    trip_id: int
    change_type: str
    description: str
    reason: str
    before_state: str
    after_state: str
    travel_time_delta_minutes: int
    travel_distance_delta_km: float
    budget_delta: float
    created_at: str

    class Config:
        from_attributes = True
