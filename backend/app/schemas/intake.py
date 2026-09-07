from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ConsentCreate(BaseModel):
    voice_consent: bool = True
    document_consent: bool = True
    ai_processing_consent: bool = True
    hospital_sharing_consent: bool = True
    abha_consent: bool = False

class ConsentResponse(ConsentCreate):
    id: str
    patient_id: str
    intake_session_id: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class IntakeCreate(BaseModel):
    patient_id: str
    department_id: Optional[str] = None
    language: str = "en"

class IntakeStatusUpdate(BaseModel):
    status: str

class IntakeResponse(BaseModel):
    id: str
    patient_id: str
    department_id: Optional[str] = None
    status: str
    language: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    consent_record: Optional[ConsentResponse] = None

    model_config = ConfigDict(from_attributes=True)
