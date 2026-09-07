from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class HandoffCreate(BaseModel):
    intake_id: Optional[str] = None
    patient_id: str
    priority: Optional[str] = "ROUTINE"  # ROUTINE, REVIEW_REQUIRED, HIGH_PRIORITY_REVIEW
    status: Optional[str] = "READY"      # READY, TRIAGE_REQUIRED, ASSIGNED, IN_REVIEW, CONSULTATION_STARTED, COMPLETED
    assigned_to: Optional[str] = None
    review_notes: Optional[str] = None


class HandoffAssign(BaseModel):
    assigned_to: str
    notes: Optional[str] = None


class HandoffReview(BaseModel):
    status: str
    priority: Optional[str] = None
    review_notes: Optional[str] = None
    reviewer_id: Optional[str] = None


class HandoffResponse(BaseModel):
    id: str
    patient_id: str
    intake_id: str
    priority: str
    status: str
    assigned_to: Optional[str] = None
    review_notes: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
