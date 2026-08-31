from sqlalchemy import Column, Integer, String, Float, Text
from app.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    destination = Column(String(255), nullable=False, index=True)
    category = Column(String(50), default="Culture")
    
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    address = Column(String(255), default="")
    
    rating = Column(Float, default=4.5)
    opening_time = Column(String(20), default="09:00")
    closing_time = Column(String(20), default="18:00")
    typical_duration_minutes = Column(Integer, default=90)
    ticket_cost = Column(Float, default=0.0)
    
    best_time_to_visit = Column(String(100), default="Morning / Evening")
    description = Column(Text, default="")
    tags = Column(Text, default="") # Comma-separated
    photo_url = Column(String(500), default="")
