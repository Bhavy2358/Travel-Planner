import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class TripChange(Base):
    __tablename__ = "trip_changes"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    change_type = Column(String(50), nullable=False) # flight_delay, nl_edit, route_optimization, budget_cut, booking_reschedule
    description = Column(Text, nullable=False)
    reason = Column(Text, default="")
    
    before_state = Column(Text, default="{}") # JSON snapshot of affected days/activities/bookings
    after_state = Column(Text, default="{}")  # JSON snapshot of updated state
    
    travel_time_delta_minutes = Column(Integer, default=0)
    travel_distance_delta_km = Column(Float, default=0.0)
    budget_delta = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    trip = relationship("Trip", back_populates="changes")
