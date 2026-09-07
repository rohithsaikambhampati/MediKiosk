"""
Clinical Handoff Endpoints for MediKiosk.

Coordinates handoffs between Patient Kiosk intake, Nurse Triage, and Doctor Workspace.
"""

from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.handoff import HandoffCreate, HandoffAssign, HandoffReview, HandoffResponse
from app.schemas.common import ApiResponse
from app.services.handoff_service import HandoffService

router = APIRouter(prefix="", tags=["Clinical Handoff"])


@router.post("/intakes/{intake_id}/handoff", response_model=ApiResponse[HandoffResponse], status_code=status.HTTP_201_CREATED)
def create_intake_handoff(intake_id: str, handoff_in: HandoffCreate, db: Session = Depends(get_db)):
    """Creates a pre-consultation handoff record for an intake session."""
    service = HandoffService(db)
    handoff_in.intake_id = intake_id
    handoff = service.create_handoff(handoff_in)
    return ApiResponse(data=HandoffResponse.model_validate(handoff))


@router.get("/intakes/{intake_id}/handoff", response_model=ApiResponse[HandoffResponse])
def get_intake_handoff(intake_id: str, db: Session = Depends(get_db)):
    """Retrieves current clinical handoff status for an intake session."""
    service = HandoffService(db)
    handoff = service.get_handoff_by_intake(intake_id)
    return ApiResponse(data=HandoffResponse.model_validate(handoff))


@router.post("/handoffs/{handoff_id}/assign", response_model=ApiResponse[HandoffResponse])
def assign_handoff_doctor(handoff_id: str, assign_in: HandoffAssign, db: Session = Depends(get_db)):
    """Assigns an attending doctor or clinician to the handoff."""
    service = HandoffService(db)
    handoff = service.assign_doctor(handoff_id, assign_in)
    return ApiResponse(data=HandoffResponse.model_validate(handoff))


@router.post("/handoffs/{handoff_id}/review", response_model=ApiResponse[HandoffResponse])
def review_handoff(handoff_id: str, review_in: HandoffReview, db: Session = Depends(get_db)):
    """Updates handoff status and notes after nurse triage or doctor consultation."""
    service = HandoffService(db)
    handoff = service.review_handoff(handoff_id, review_in)
    return ApiResponse(data=HandoffResponse.model_validate(handoff))
