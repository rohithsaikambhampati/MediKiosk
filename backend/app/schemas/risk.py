from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class RiskAssessmentBase(BaseModel):
    priority: str = "ROUTINE"  # ROUTINE, NEEDS_ATTENTION, HIGH_PRIORITY, IMMEDIATE
    reason: str
    signals: List[str] = []
    source: str = "Intake Triaging Rules"

class RiskAssessmentCreate(RiskAssessmentBase):
    patient_id: str
    intake_session_id: Optional[str] = None

class RiskAssessmentResponse(BaseModel):
    id: str
    patient_id: str
    intake_session_id: Optional[str] = None
    priority: str
    reason: str
    signals: List[str] = []
    source: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
