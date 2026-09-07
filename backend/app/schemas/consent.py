from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ConsentCreate(BaseModel):
    patient_id: str
    intake_id: Optional[str] = None
    purpose: str = "CLINICAL_INTAKE"  # CLINICAL_INTAKE, DOCUMENT_PROCESSING, CLINICIAN_REVIEW, INTEROPERABILITY_EXPORT, DEMO_DATA_PROCESSING
    scope: List[str] = Field(default_factory=lambda: ["history", "uploaded_documents", "structured_facts", "clinician_review"])
    language: str = "en"
    consent_method: str = "patient_ui"
    consent_text_version: str = "v1.0"
    metadata: Optional[Dict[str, Any]] = None


class ConsentWithdraw(BaseModel):
    reason: Optional[str] = "Patient requested withdrawal"


class ConsentResponse(BaseModel):
    id: str
    patient_id: str
    intake_id: Optional[str] = None
    purpose: str
    scope: List[str]
    status: str
    granted_at: datetime
    withdrawn_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    language: str
    consent_method: str
    consent_text_version: str
    metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class ConsentCheckRequest(BaseModel):
    patient_id: str
    purpose: str
    scope: Optional[str] = None
