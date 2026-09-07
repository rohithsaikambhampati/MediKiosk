from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.queue import (
    QueueItemCreate,
    QueueItemUpdate,
    QueueItemResponse,
    EscalateRequest,
    SendToDoctorRequest,
)
from app.schemas.common import ApiResponse
from app.services.queue_service import QueueService

router = APIRouter(prefix="/queue", tags=["Queue"])


@router.post("", response_model=ApiResponse[QueueItemResponse], status_code=status.HTTP_201_CREATED)
def enqueue_patient(queue_in: QueueItemCreate, db: Session = Depends(get_db)):
    service = QueueService(db)
    item = service.create_queue_item(queue_in)
    return ApiResponse(data=QueueItemResponse.model_validate(item))


@router.get("", response_model=ApiResponse[List[QueueItemResponse]])
def get_queue(
    department_id: Optional[str] = Query(None),
    doctor_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    service = QueueService(db)
    items = service.get_active_queue(
        department_id=department_id,
        doctor_id=doctor_id,
        status=status,
    )
    return ApiResponse(data=[QueueItemResponse.model_validate(i) for i in items])


@router.get("/{item_id}", response_model=ApiResponse[QueueItemResponse])
def get_queue_item(item_id: str, db: Session = Depends(get_db)):
    service = QueueService(db)
    item = service.get_queue_item(item_id)
    return ApiResponse(data=QueueItemResponse.model_validate(item))


@router.patch("/{item_id}", response_model=ApiResponse[QueueItemResponse])
def update_queue_item(item_id: str, queue_in: QueueItemUpdate, db: Session = Depends(get_db)):
    service = QueueService(db)
    item = service.update_queue_item(item_id, queue_in)
    return ApiResponse(data=QueueItemResponse.model_validate(item))


@router.post("/{item_id}/escalate", response_model=ApiResponse[QueueItemResponse])
def escalate_queue_item(item_id: str, esc_in: EscalateRequest, db: Session = Depends(get_db)):
    service = QueueService(db)
    item = service.update_queue_item(item_id, QueueItemUpdate(status="ESCALATED", priority=esc_in.priority))
    return ApiResponse(data=QueueItemResponse.model_validate(item))


@router.post("/{item_id}/send-to-doctor", response_model=ApiResponse[QueueItemResponse])
def send_to_doctor(item_id: str, doc_in: SendToDoctorRequest, db: Session = Depends(get_db)):
    service = QueueService(db)
    item = service.update_queue_item(item_id, QueueItemUpdate(status="READY_FOR_DOCTOR", assigned_doctor_id=doc_in.doctor_id))
    return ApiResponse(data=QueueItemResponse.model_validate(item))
