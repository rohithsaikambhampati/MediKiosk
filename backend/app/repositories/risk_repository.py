from typing import Optional, List
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.models.risk import RiskAssessment
from app.repositories.base import BaseRepository


class RiskRepository(BaseRepository[RiskAssessment]):
    def __init__(self, db: Session):
        super().__init__(RiskAssessment, db)

    def get_by_patient_id(self, patient_id: str) -> List[RiskAssessment]:
        stmt = select(RiskAssessment).where(
            RiskAssessment.patient_id == patient_id
        ).order_by(desc(RiskAssessment.created_at))
        return list(self.db.execute(stmt).scalars().all())

    def get_by_intake_session_id(self, intake_session_id: str) -> List[RiskAssessment]:
        stmt = select(RiskAssessment).where(
            RiskAssessment.intake_session_id == intake_session_id
        ).order_by(desc(RiskAssessment.created_at))
        return list(self.db.execute(stmt).scalars().all())
