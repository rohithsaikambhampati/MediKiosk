from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TimelineEventBase(BaseModel):
    date: str
    event_type: str = "CONDITION"
    title: str
    description: Optional[str] = None
    confidence: float = 0.95

class TimelineEventCreate(TimelineEventBase):
    patient_id: str
    source_fact_id: Optional[str] = None
    evidence_id: Optional[str] = None

class TimelineEventResponse(TimelineEventBase):
    id: str
    patient_id: str
    source_fact_id: Optional[str] = None
    evidence_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
