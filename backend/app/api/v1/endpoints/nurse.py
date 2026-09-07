from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role
from app.schemas.queue import QueueItemResponse, QueueItemUpdate
from app.schemas.common import ApiResponse
from app.services.queue_service import QueueService

router = APIRouter(
    prefix="/nurse",
    tags=["Nurse Triage & Assistance"],
    dependencies=[Depends(require_role(["NURSE", "ADMIN", "DOCTOR"]))]
)


class TriageOverrideRequest(BaseModel):
    priority: str
    notes: Optional[str] = None


@router.get("/triage-queue", response_model=ApiResponse[List[QueueItemResponse]])
def get_triage_queue(
    department_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    service = QueueService(db)
    items = service.get_active_queue(department_id=department_id)
    return ApiResponse(data=[QueueItemResponse.model_validate(i) for i in items])


@router.post("/queue/{queue_id}/triage-priority", response_model=ApiResponse[QueueItemResponse])
def update_triage_priority(
    queue_id: str,
    triage_in: TriageOverrideRequest,
    db: Session = Depends(get_db)
):
    service = QueueService(db)
    item = service.update_queue_item(
        queue_id,
        QueueItemUpdate(priority=triage_in.priority)
    )
    return ApiResponse(data=QueueItemResponse.model_validate(item))
