from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.queue import QueueItem, QueueStatus
from app.repositories.queue_repository import QueueRepository
from app.schemas.queue import QueueItemCreate, QueueItemUpdate


class QueueService:
    def __init__(self, db: Session):
        self.db = db
        self.queue_repo = QueueRepository(db)

    def create_queue_item(self, queue_in: QueueItemCreate) -> QueueItem:
        item = QueueItem(
            patient_id=queue_in.patient_id,
            intake_session_id=queue_in.intake_session_id,
            token_number=queue_in.token_number,
            department_id=queue_in.department_id,
            status=queue_in.status,
            priority=queue_in.priority,
            assigned_doctor_id=queue_in.assigned_doctor_id,
        )
        return self.queue_repo.create(item)

    def get_queue_item(self, item_id: str) -> QueueItem:
        item = self.queue_repo.get_by_id(item_id)
        if not item:
            item = self.queue_repo.get_by_token_number(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Queue ticket not found",
            )
        return item

    def get_active_queue(
        self,
        department_id: Optional[str] = None,
        doctor_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[QueueItem]:
        return self.queue_repo.get_active_queue(
            department_id=department_id,
            doctor_id=doctor_id,
            status=status,
        )

    def update_queue_item(self, item_id: str, queue_in: QueueItemUpdate) -> QueueItem:
        item = self.get_queue_item(item_id)
        update_data = queue_in.model_dump(exclude_unset=True)
        return self.queue_repo.update(item, update_data)
