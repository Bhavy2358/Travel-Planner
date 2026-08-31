from app.schemas.user import UserCreate, UserLogin, UserOut, Token, TokenData, UserProfileUpdate
from app.schemas.trip import TripCreate, TripUpdate, TripOut, TripDetailOut, TripStatsOut, BudgetCategoryBreakdown
from app.schemas.itinerary import (
    ActivityBase, ActivityCreate, ActivityUpdate, ActivityOut,
    ItineraryDayBase, ItineraryDayOut, AIItineraryPlan, AIActivity, AIDayPlan,
    OptimizeRouteRequest, OptimizeRouteResponse, RouteOptimizationResult,
    NaturalLanguageEditRequest, TripChangeOut
)
from app.schemas.booking import (
    BookingBase, BookingCreate, BookingUpdate, BookingOut,
    FlightDelaySimulateRequest, BookingConflictCascadeOut, AffectedItem
)
from app.schemas.chat import (
    ChatMessage, ChatRequest, ChatResponse, ChatAction,
    RAGQueryRequest, RAGQueryResponse, RAGSourceDoc
)
from app.schemas.conflicts import (
    ConflictItem, ConflictScanResponse, ResolveConflictRequest, ResolveConflictResponse
)

__all__ = [
    "UserCreate", "UserLogin", "UserOut", "Token", "TokenData", "UserProfileUpdate",
    "TripCreate", "TripUpdate", "TripOut", "TripDetailOut", "TripStatsOut", "BudgetCategoryBreakdown",
    "ActivityBase", "ActivityCreate", "ActivityUpdate", "ActivityOut",
    "ItineraryDayBase", "ItineraryDayOut", "AIItineraryPlan", "AIActivity", "AIDayPlan",
    "OptimizeRouteRequest", "OptimizeRouteResponse", "RouteOptimizationResult",
    "NaturalLanguageEditRequest", "TripChangeOut",
    "BookingBase", "BookingCreate", "BookingUpdate", "BookingOut",
    "FlightDelaySimulateRequest", "BookingConflictCascadeOut", "AffectedItem",
    "ChatMessage", "ChatRequest", "ChatResponse", "ChatAction",
    "RAGQueryRequest", "RAGQueryResponse", "RAGSourceDoc",
    "ConflictItem", "ConflictScanResponse", "ResolveConflictRequest", "ResolveConflictResponse"
]
