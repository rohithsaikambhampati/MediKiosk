from typing import Optional, List, Dict, Any
import json
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.risk import RiskAssessment
from app.repositories.risk_repository import RiskRepository
from app.schemas.risk import RiskAssessmentCreate


class RiskService:
    def __init__(self, db: Session):
        self.db = db
        self.risk_repo = RiskRepository(db)

    def create_assessment(self, risk_in: RiskAssessmentCreate) -> RiskAssessment:
        assessment = RiskAssessment(
            patient_id=risk_in.patient_id,
            intake_session_id=risk_in.intake_session_id,
            priority=risk_in.priority,
            reason=risk_in.reason,
            signals_json=json.dumps(risk_in.signals) if risk_in.signals else None,
            source=risk_in.source,
        )
        return self.risk_repo.create(assessment)

    def get_assessment(self, assessment_id: str) -> RiskAssessment:
        assessment = self.risk_repo.get_by_id(assessment_id)
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Risk assessment not found",
            )
        return assessment

    def get_patient_assessments(self, patient_id: str) -> List[RiskAssessment]:
        return self.risk_repo.get_by_patient_id(patient_id)
