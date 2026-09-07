"""
Consent Management Endpoints for MediKiosk.

Supports purpose-based consent registration, patient consent queries,
and non-destructive consent withdrawal.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.consent import ConsentCreate, ConsentWithdraw, ConsentResponse
from app.schemas.common import ApiResponse
from app.services.consent_service import ConsentService

router = APIRouter(prefix="", tags=["Consents"])


@router.post("/consents", response_model=ApiResponse[ConsentResponse], status_code=status.HTTP_201_CREATED)
def create_consent(consent_in: ConsentCreate, db: Session = Depends(get_db)):
    """Registers explicit purpose-based patient consent."""
    service = ConsentService(db)
    consent = service.create_consent(consent_in)
    return ApiResponse(data=service.to_response_dto(consent))


@router.get("/patients/{patient_id}/consents", response_model=ApiResponse[List[ConsentResponse]])
def get_patient_consents(patient_id: str, db: Session = Depends(get_db)):
    """Retrieves all active and historical consents for a patient."""
    service = ConsentService(db)
    consents = service.get_patient_consents(patient_id)
    return ApiResponse(data=[service.to_response_dto(c) for c in consents])


@router.post("/consents/{consent_id}/withdraw", response_model=ApiResponse[ConsentResponse])
def withdraw_consent(consent_id: str, withdraw_in: Optional[ConsentWithdraw] = None, db: Session = Depends(get_db)):
    """
    Non-destructively marks consent as WITHDRAWN.
    Stops future data sharing while preserving audit integrity.
    """
    service = ConsentService(db)
    reason = withdraw_in.reason if withdraw_in else None
    consent = service.withdraw_consent(consent_id, reason=reason)
    return ApiResponse(data=service.to_response_dto(consent))
