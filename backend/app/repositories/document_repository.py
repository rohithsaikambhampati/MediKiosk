from typing import Optional, List
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.models.document import MedicalDocument
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[MedicalDocument]):
    def __init__(self, db: Session):
        super().__init__(MedicalDocument, db)

    def get_by_patient_id(self, patient_id: str) -> List[MedicalDocument]:
        stmt = select(MedicalDocument).where(
            MedicalDocument.patient_id == patient_id
        ).order_by(desc(MedicalDocument.created_at))
        return list(self.db.execute(stmt).scalars().all())

    def get_by_intake_session_id(self, intake_session_id: str) -> List[MedicalDocument]:
        stmt = select(MedicalDocument).where(
            MedicalDocument.intake_session_id == intake_session_id
        ).order_by(desc(MedicalDocument.created_at))
        return list(self.db.execute(stmt).scalars().all())
