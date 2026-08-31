import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info") # flight_change, conflict, budget_warning, tip
    severity = Column(String(20), default="info") # info, warning, critical
    is_read = Column(Boolean, default=False)
    action_link = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
