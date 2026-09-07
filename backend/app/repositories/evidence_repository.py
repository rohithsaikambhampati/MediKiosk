from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.evidence import EvidenceSource
from app.repositories.base import BaseRepository


class EvidenceRepository(BaseRepository[EvidenceSource]):
    def __init__(self, db: Session):
        super().__init__(EvidenceSource, db)

    def get_by_fact_id(self, fact_id: str) -> List[EvidenceSource]:
        stmt = select(EvidenceSource).where(EvidenceSource.medical_fact_id == fact_id)
        return list(self.db.execute(stmt).scalars().all())

    def get_by_document_id(self, document_id: str) -> List[EvidenceSource]:
        stmt = select(EvidenceSource).where(EvidenceSource.document_id == document_id)
        return list(self.db.execute(stmt).scalars().all())

    def get_by_conversation_message_id(self, message_id: str) -> List[EvidenceSource]:
        stmt = select(EvidenceSource).where(EvidenceSource.conversation_message_id == message_id)
        return list(self.db.execute(stmt).scalars().all())
