from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import ConflictScanResponse, ResolveConflictRequest, ResolveConflictResponse
from app.api.auth import get_current_user
from app.services.conflict_service import ConflictDetectionService

router = APIRouter(prefix="/trips/{trip_id}/conflicts", tags=["Conflicts"])

@router.get("", response_model=ConflictScanResponse)
def scan_conflicts(trip_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return ConflictDetectionService.scan_trip_conflicts(db, trip_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/resolve", response_model=ResolveConflictResponse)
def resolve_conflicts(trip_id: int, req: ResolveConflictRequest = ResolveConflictRequest(), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return ConflictDetectionService.resolve_all_conflicts(db, trip_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
