from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.timeline import TimelineEvent
from app.repositories.timeline_repository import TimelineRepository
from app.repositories.patient_repository import PatientRepository
from app.schemas.timeline import TimelineEventCreate


class TimelineService:
    def __init__(self, db: Session):
        self.db = db
        self.timeline_repo = TimelineRepository(db)
        self.patient_repo = PatientRepository(db)

    def create_event(self, event_in: TimelineEventCreate) -> TimelineEvent:
        event = TimelineEvent(
            patient_id=event_in.patient_id,
            date=event_in.date,
            event_type=event_in.event_type,
            title=event_in.title,
            description=event_in.description,
            source_fact_id=event_in.source_fact_id,
            evidence_id=event_in.evidence_id,
            confidence=event_in.confidence,
        )
        return self.timeline_repo.create(event)

    def get_patient_timeline(self, patient_id: str, event_type: Optional[str] = None) -> List[TimelineEvent]:
        if event_type:
            return self.timeline_repo.get_by_event_type(patient_id, event_type)
        return self.timeline_repo.get_by_patient_id(patient_id)

    def get_event(self, event_id: str) -> TimelineEvent:
        event = self.timeline_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Timeline event not found",
            )
        return event
