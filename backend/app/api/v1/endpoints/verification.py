from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role
from app.schemas.verification import VerifyFactRequest, RejectFactRequest, VerificationResponse
from app.schemas.common import ApiResponse
from app.services.verification_service import VerificationService

router = APIRouter(prefix="/verification", tags=["Verification"])


@router.post("/facts/{fact_id}/verify", response_model=ApiResponse[VerificationResponse])
def verify_fact(
    fact_id: str,
    verify_req: VerifyFactRequest,
    db: Session = Depends(get_db),
    _role: dict = Depends(require_role(["DOCTOR", "ADMIN"])),
):
    service = VerificationService(db)
    record = service.verify_fact(fact_id, verify_req)
    return ApiResponse(data=VerificationResponse.model_validate(record))


@router.post("/facts/{fact_id}/reject", response_model=ApiResponse[VerificationResponse])
def reject_fact(
    fact_id: str,
    reject_req: RejectFactRequest,
    db: Session = Depends(get_db),
    _role: dict = Depends(require_role(["DOCTOR", "ADMIN"])),
):
    service = VerificationService(db)
    record = service.reject_fact(fact_id, reject_req)
    return ApiResponse(data=VerificationResponse.model_validate(record))


@router.get("/facts/{fact_id}", response_model=ApiResponse[List[VerificationResponse]])
def get_verifications(fact_id: str, db: Session = Depends(get_db)):
    service = VerificationService(db)
    records = service.get_verifications_for_fact(fact_id)
    return ApiResponse(data=[VerificationResponse.model_validate(r) for r in records])
