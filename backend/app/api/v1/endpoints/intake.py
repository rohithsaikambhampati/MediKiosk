from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.intake import (
    IntakeCreate,
    IntakeResponse,
    ConsentCreate,
    ConsentResponse,
    IntakeStatusUpdate,
)
from app.schemas.common import ApiResponse
from app.services.intake_service import IntakeService

router = APIRouter(prefix="/intake", tags=["Intake"])


class ConsentRequest(BaseModel):
    intake_id: str
    patient_id: str
    consent: ConsentCreate


@router.post("/start", response_model=ApiResponse[IntakeResponse], status_code=status.HTTP_201_CREATED)
def start_intake(intake_in: IntakeCreate, db: Session = Depends(get_db)):
    service = IntakeService(db)
    session = service.start_intake_session(intake_in)
    return ApiResponse(data=IntakeResponse.model_validate(session))


@router.get("/{intake_id}", response_model=ApiResponse[IntakeResponse])
def get_intake(intake_id: str, db: Session = Depends(get_db)):
    service = IntakeService(db)
    session = service.get_intake_session(intake_id)
    return ApiResponse(data=IntakeResponse.model_validate(session))


@router.patch("/{intake_id}/status", response_model=ApiResponse[IntakeResponse])
def update_intake_status(intake_id: str, status_in: IntakeStatusUpdate, db: Session = Depends(get_db)):
    service = IntakeService(db)
    session = service.update_intake_status(intake_id, status_in.status)
    return ApiResponse(data=IntakeResponse.model_validate(session))


@router.post("/consent", response_model=ApiResponse[ConsentResponse], status_code=status.HTTP_201_CREATED)
def record_consent(consent_req: ConsentRequest, db: Session = Depends(get_db)):
    service = IntakeService(db)
    consent = service.record_consent(
        intake_id=consent_req.intake_id,
        patient_id=consent_req.patient_id,
        consent_in=consent_req.consent,
    )
    return ApiResponse(data=ConsentResponse.model_validate(consent))


@router.post("/{intake_id}/finalize", response_model=ApiResponse)
async def finalize_intake(
    intake_id: str,
    department_id: Optional[str] = Query(None),
    preferred_doctor_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    service = IntakeService(db)
    result = await service.finalize_intake(
        intake_id=intake_id,
        department_id=department_id,
        preferred_doctor_id=preferred_doctor_id,
    )
    return ApiResponse(data={
        "intake_id": result["intake_session"].id,
        "status": result["intake_session"].status,
        "token_number": result["token_number"],
        "queue_item_id": result["queue_item"].id,
    })
