import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    booking_type = Column(String(50), nullable=False) # flight, hotel, transport, restaurant, activity
    title = Column(String(255), nullable=False)
    provider = Column(String(255), default="Demo Provider")
    confirmation_code = Column(String(100), default="DEMO-10928")
    status = Column(String(50), default="confirmed") # confirmed, pending, cancelled, conflict, changed
    
    start_datetime = Column(String(50), nullable=False) # e.g. "2026-09-10 10:30"
    end_datetime = Column(String(50), nullable=True)   # e.g. "2026-09-10 12:00"
    
    cost = Column(Float, default=0.0)
    currency = Column(String(10), default="INR")
    
    details = Column(Text, default="{}") # JSON string for custom meta (airline, seat, hotel room, etc.)
    parent_booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    trip = relationship("Trip", back_populates="bookings")
    sub_bookings = relationship("Booking", backref="parent_booking", remote_side=[id])
