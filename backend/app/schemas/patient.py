from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.medical_fact import MedicalFactResponse
from app.schemas.medication import MedicationResponse
from app.schemas.allergy import AllergyResponse
from app.schemas.timeline import TimelineEventResponse
from app.schemas.risk import RiskAssessmentResponse
from app.schemas.document import DocumentResponse

class PatientBase(BaseModel):
    hospital_id: str  # MRN / Hospital Patient ID e.g. "MRN-2026-0891"
    name: str
    age: int
    gender: str
    phone: Optional[str] = None
    preferred_language: str = "en"
    accessibility_mode: bool = False
    abha_reference: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    accessibility_mode: Optional[bool] = None
    abha_reference: Optional[str] = None

class PatientResponse(PatientBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PatientDetailResponse(PatientResponse):
    facts: List[MedicalFactResponse] = []
    medications: List[MedicationResponse] = []
    allergies: List[AllergyResponse] = []
    timeline: List[TimelineEventResponse] = []
    risks: List[RiskAssessmentResponse] = []
    documents: List[DocumentResponse] = []
