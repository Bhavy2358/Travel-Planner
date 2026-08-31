from pydantic import BaseModel
from typing import List, Optional

class ConflictItem(BaseModel):
    id: str # unique identifier for the conflict
    conflict_type: str # "overlap", "insufficient_transit", "closed_venue", "checkin_violation", "budget_exceeded"
    severity: str # "critical", "warning", "info"
    title: str
    description: str
    day_number: Optional[int] = None
    affected_activity_ids: List[int] = []
    affected_booking_ids: List[int] = []
    suggested_fix: str
    auto_resolvable: bool = True

class ConflictScanResponse(BaseModel):
    trip_id: int
    has_conflicts: bool
    total_conflicts: int
    critical_count: int
    warning_count: int
    conflicts: List[ConflictItem]
    ai_summary: str

class ResolveConflictRequest(BaseModel):
    conflict_id: Optional[str] = None # If None, auto-resolves all
    resolution_strategy: str = "ai_smart_adjust" # "ai_smart_adjust", "skip_conflicting", "extend_time"

class ResolveConflictResponse(BaseModel):
    trip_id: int
    conflicts_resolved: int
    remaining_conflicts: int
    resolution_summary: str
    changes_applied: List[str]
