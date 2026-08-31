import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    starting_location = Column(String(255), default="City Center")
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    duration_days = Column(Integer, default=3)
    travelers_count = Column(Integer, default=2)
    adults = Column(Integer, default=2)
    children = Column(Integer, default=0)
    
    # Budget details
    budget_category = Column(String(50), default="Standard") # Economy, Standard, Premium, Custom
    total_budget = Column(Float, default=25000.0)
    currency = Column(String(10), default="INR")
    
    # Preferences
    travel_preferences = Column(Text, default="Culture, Food, History")
    travel_pace = Column(String(50), default="Balanced") # Relaxed, Balanced, Fast-paced
    transport_mode = Column(String(50), default="Taxi / Auto") # Walking, Public transport, Taxi, Rental car, Mixed
    accommodation_type = Column(String(50), default="Hotel") # Budget, Hotel, Hostel, Luxury
    
    status = Column(String(50), default="planning") # planning, active, completed
    total_estimated_cost = Column(Float, default=0.0)
    total_distance_km = Column(Float, default=0.0)
    total_travel_time_minutes = Column(Integer, default=0)
    
    # Before optimization baseline (for showcase)
    before_opt_distance_km = Column(Float, default=0.0)
    before_opt_time_minutes = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    days = relationship("ItineraryDay", back_populates="trip", cascade="all, delete-orphan", order_by="ItineraryDay.day_number")
    bookings = relationship("Booking", back_populates="trip", cascade="all, delete-orphan")
    changes = relationship("TripChange", back_populates="trip", cascade="all, delete-orphan", order_by="TripChange.created_at.desc()")
