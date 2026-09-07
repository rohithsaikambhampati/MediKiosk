from typing import Optional, List
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.models.intake import IntakeSession, ConsentRecord, IntakeStatus
from app.repositories.base import BaseRepository


class IntakeRepository(BaseRepository[IntakeSession]):
    def __init__(self, db: Session):
        super().__init__(IntakeSession, db)

    def get_by_session_id(self, session_id: str) -> Optional[IntakeSession]:
        stmt = select(IntakeSession).where(IntakeSession.session_id == session_id)
        return self.db.execute(stmt).scalars().first()

    def get_by_patient_id(self, patient_id: str, limit: int = 50) -> List[IntakeSession]:
        stmt = select(IntakeSession).where(
            IntakeSession.patient_id == patient_id
        ).order_by(desc(IntakeSession.created_at)).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

    def get_active_session_for_patient(self, patient_id: str) -> Optional[IntakeSession]:
        stmt = select(IntakeSession).where(
            IntakeSession.patient_id == patient_id,
            IntakeSession.status.in_([IntakeStatus.IN_PROGRESS, IntakeStatus.PENDING_TRIAGE])
        ).order_by(desc(IntakeSession.created_at))
        return self.db.execute(stmt).scalars().first()


class ConsentRepository(BaseRepository[ConsentRecord]):
    def __init__(self, db: Session):
        super().__init__(ConsentRecord, db)

    def get_by_intake_id(self, intake_id: str) -> List[ConsentRecord]:
        stmt = select(ConsentRecord).where(ConsentRecord.intake_id == intake_id)
        return list(self.db.execute(stmt).scalars().all())

    def get_by_patient_id(self, patient_id: str) -> List[ConsentRecord]:
        stmt = select(ConsentRecord).where(ConsentRecord.patient_id == patient_id)
        return list(self.db.execute(stmt).scalars().all())
