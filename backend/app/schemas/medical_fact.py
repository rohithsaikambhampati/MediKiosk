from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.evidence import EvidenceResponse
from app.schemas.verification import VerificationResponse

class MedicalFactBase(BaseModel):
    fact_type: str
    value: str
    normalized_value: Optional[str] = None
    date: Optional[str] = None
    confidence: float = 0.95
    source_type: str = "AI_EXTRACTED"
    verification_status: str = "NEEDS_VERIFICATION"

class MedicalFactCreate(MedicalFactBase):
    patient_id: str
    intake_session_id: Optional[str] = None

class MedicalFactUpdate(BaseModel):
    value: Optional[str] = None
    normalized_value: Optional[str] = None
    confidence: Optional[float] = None
    verification_status: Optional[str] = None

class MedicalFactResponse(MedicalFactBase):
    id: str
    patient_id: str
    intake_session_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    evidence_sources: List[EvidenceResponse] = []
    verification_records: List[VerificationResponse] = []

    model_config = ConfigDict(from_attributes=True)
