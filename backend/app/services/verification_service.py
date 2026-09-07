from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.verification import VerificationRecord
from app.models.medical_fact import MedicalFact, VerificationStatus
from app.repositories.verification_repository import VerificationRepository
from app.repositories.fact_repository import MedicalFactRepository
from app.schemas.verification import VerifyFactRequest, RejectFactRequest


class VerificationService:
    def __init__(self, db: Session):
        self.db = db
        self.verif_repo = VerificationRepository(db)
        self.fact_repo = MedicalFactRepository(db)

    def verify_fact(self, fact_id: str, verify_req: VerifyFactRequest) -> VerificationRecord:
        fact = self.fact_repo.get_by_id(fact_id)
        if not fact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical fact not found",
            )

        previous_status = fact.verification_status
        previous_value = fact.value
        new_value = verify_req.new_value or fact.value

        record = VerificationRecord(
            medical_fact_id=fact_id,
            reviewed_by=verify_req.reviewed_by or "Doctor",
            previous_status=previous_status,
            new_status=VerificationStatus.DOCTOR_VERIFIED.value,
            previous_value=previous_value,
            new_value=new_value,
            reason=verify_req.reason,
        )
        saved_record = self.verif_repo.create(record)

        # Update fact
        self.fact_repo.update(fact, {
            "verification_status": VerificationStatus.DOCTOR_VERIFIED.value,
            "confidence": 1.0,
            "value": new_value,
        })

        return saved_record

    def reject_fact(self, fact_id: str, reject_req: RejectFactRequest) -> VerificationRecord:
        fact = self.fact_repo.get_by_id(fact_id)
        if not fact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical fact not found",
            )

        previous_status = fact.verification_status
        record = VerificationRecord(
            medical_fact_id=fact_id,
            reviewed_by=reject_req.reviewed_by or "Doctor",
            previous_status=previous_status,
            new_status=VerificationStatus.REJECTED.value,
            previous_value=fact.value,
            new_value=None,
            reason=reject_req.reason,
        )
        saved_record = self.verif_repo.create(record)

        # Update fact
        self.fact_repo.update(fact, {
            "verification_status": VerificationStatus.REJECTED.value,
            "confidence": 0.0,
        })

        return saved_record

    def get_verifications_for_fact(self, fact_id: str) -> List[VerificationRecord]:
        return self.verif_repo.get_by_medical_fact_id(fact_id)
