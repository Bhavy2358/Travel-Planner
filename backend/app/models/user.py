import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user") # "user" or "admin"
    preferred_travel_style = Column(String(100), default="Balanced")
    budget_preference = Column(String(100), default="Standard")
    favorite_activities = Column(Text, default="Culture, Food, History") # Comma-separated or JSON
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
