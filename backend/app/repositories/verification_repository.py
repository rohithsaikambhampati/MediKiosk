from typing import Optional, List
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.models.verification import VerificationRecord
from app.repositories.base import BaseRepository


class VerificationRepository(BaseRepository[VerificationRecord]):
    def __init__(self, db: Session):
        super().__init__(VerificationRecord, db)

    def get_by_medical_fact_id(self, medical_fact_id: str) -> List[VerificationRecord]:
        stmt = select(VerificationRecord).where(
            VerificationRecord.medical_fact_id == medical_fact_id
        ).order_by(desc(VerificationRecord.created_at))
        return list(self.db.execute(stmt).scalars().all())
