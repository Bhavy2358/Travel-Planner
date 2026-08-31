from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.api.auth import get_current_user
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("")
def get_recommendations(destination: str = "Ahmedabad", trip_id: Optional[int] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return RecommendationService.get_personalized_recommendations(
        db=db,
        destination=destination,
        user_id=current_user.id if current_user else None,
        trip_id=trip_id
    )
