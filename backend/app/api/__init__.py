from app.api.auth import router as auth_router
from app.api.trips import router as trips_router
from app.api.itinerary import router as itinerary_router
from app.api.bookings import router as bookings_router
from app.api.conflicts import router as conflicts_router
from app.api.recommendations import router as recommendations_router
from app.api.chat import router as chat_router
from app.api.rag import router as rag_router
from app.api.admin import router as admin_router
from app.api.notifications import router as notifications_router

__all__ = [
    "auth_router",
    "trips_router",
    "itinerary_router",
    "bookings_router",
    "conflicts_router",
    "recommendations_router",
    "chat_router",
    "rag_router",
    "admin_router",
    "notifications_router"
]
