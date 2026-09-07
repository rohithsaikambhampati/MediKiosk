from typing import Optional, List
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.models.timeline import TimelineEvent
from app.repositories.base import BaseRepository


class TimelineRepository(BaseRepository[TimelineEvent]):
    def __init__(self, db: Session):
        super().__init__(TimelineEvent, db)

    def get_by_patient_id(self, patient_id: str) -> List[TimelineEvent]:
        stmt = select(TimelineEvent).where(
            TimelineEvent.patient_id == patient_id
        ).order_by(desc(TimelineEvent.date))
        return list(self.db.execute(stmt).scalars().all())

    def get_by_event_type(self, patient_id: str, event_type: str) -> List[TimelineEvent]:
        stmt = select(TimelineEvent).where(
            TimelineEvent.patient_id == patient_id,
            TimelineEvent.event_type == event_type
        ).order_by(desc(TimelineEvent.date))
        return list(self.db.execute(stmt).scalars().all())
