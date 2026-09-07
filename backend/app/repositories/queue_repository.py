from typing import Optional, List
from sqlalchemy import select, desc, asc
from sqlalchemy.orm import Session
from app.models.queue import QueueItem, QueueStatus
from app.repositories.base import BaseRepository


class QueueRepository(BaseRepository[QueueItem]):
    def __init__(self, db: Session):
        super().__init__(QueueItem, db)

    def get_by_token_number(self, token_number: str) -> Optional[QueueItem]:
        stmt = select(QueueItem).where(QueueItem.token_number == token_number)
        return self.db.execute(stmt).scalars().first()

    def get_active_queue(
        self,
        department_id: Optional[str] = None,
        doctor_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[QueueItem]:
        stmt = select(QueueItem)
        if status:
            stmt = stmt.where(QueueItem.status == status)
        if department_id:
            stmt = stmt.where(QueueItem.department_id == department_id)
        if doctor_id:
            stmt = stmt.where(QueueItem.assigned_doctor_id == doctor_id)

        stmt = stmt.order_by(asc(QueueItem.created_at))
        return list(self.db.execute(stmt).scalars().all())

    def get_by_patient_id(self, patient_id: str) -> List[QueueItem]:
        stmt = select(QueueItem).where(
            QueueItem.patient_id == patient_id
        ).order_by(desc(QueueItem.created_at))
        return list(self.db.execute(stmt).scalars().all())
