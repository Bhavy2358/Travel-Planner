from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    date = Column(String(50), nullable=False)
    area_name = Column(String(255), default="City Highlights")
    theme = Column(String(255), default="Heritage & Local Delights")
    
    morning_summary = Column(Text, nullable=True)
    afternoon_summary = Column(Text, nullable=True)
    evening_summary = Column(Text, nullable=True)
    
    estimated_distance_km = Column(Float, default=0.0)
    estimated_travel_time_minutes = Column(Integer, default=0)
    estimated_cost = Column(Float, default=0.0)
    is_optimized = Column(Boolean, default=True)

    # Baseline before optimization
    before_opt_distance_km = Column(Float, default=0.0)
    before_opt_time_minutes = Column(Integer, default=0)

    trip = relationship("Trip", back_populates="days")
    activities = relationship("Activity", back_populates="day", cascade="all, delete-orphan", order_by="Activity.order_index")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_day_id = Column(Integer, ForeignKey("itinerary_days.id"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(50), default="Culture") # Historical, Culture, Food, Nature, Adventure, Shopping, Relaxation, Transport, Hotel
    
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    address = Column(String(255), default="")
    
    start_time = Column(String(20), default="09:00")
    end_time = Column(String(20), default="10:30")
    duration_minutes = Column(Integer, default=90)
    travel_time_minutes = Column(Integer, default=15)
    travel_distance_km = Column(Float, default=2.5)
    transport_mode = Column(String(50), default="Taxi") # Walking, Taxi, Auto, Metro
    
    estimated_cost = Column(Float, default=0.0)
    order_index = Column(Integer, default=0)
    rating = Column(Float, default=4.5)
    
    opening_time = Column(String(20), default="08:00")
    closing_time = Column(String(20), default="19:00")
    
    why_chosen = Column(Text, default="Selected to align with your travel style and geographical efficiency.")
    photo_url = Column(String(500), default="")
    is_locked = Column(Boolean, default=False)
    booking_id = Column(Integer, nullable=True) # Optional link to a booking

    day = relationship("ItineraryDay", back_populates="activities")
