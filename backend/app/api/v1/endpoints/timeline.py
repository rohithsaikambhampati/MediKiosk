from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.timeline import TimelineEventCreate, TimelineEventResponse
from app.schemas.common import ApiResponse
from app.services.timeline_service import TimelineService

router = APIRouter(prefix="/timeline", tags=["Timeline"])


@router.post("", response_model=ApiResponse[TimelineEventResponse], status_code=status.HTTP_201_CREATED)
def create_event(event_in: TimelineEventCreate, db: Session = Depends(get_db)):
    service = TimelineService(db)
    event = service.create_event(event_in)
    return ApiResponse(data=TimelineEventResponse.model_validate(event))


@router.get("/patient/{patient_id}", response_model=ApiResponse[List[TimelineEventResponse]])
def get_patient_timeline(
    patient_id: str,
    event_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    service = TimelineService(db)
    events = service.get_patient_timeline(patient_id, event_type=event_type)
    return ApiResponse(data=[TimelineEventResponse.model_validate(e) for e in events])


@router.get("/{event_id}", response_model=ApiResponse[TimelineEventResponse])
def get_event(event_id: str, db: Session = Depends(get_db)):
    service = TimelineService(db)
    event = service.get_event(event_id)
    return ApiResponse(data=TimelineEventResponse.model_validate(event))
