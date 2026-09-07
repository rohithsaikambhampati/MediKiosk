from pydantic import BaseModel, ConfigDict
from typing import Optional

class MedicationBase(BaseModel):
    name: str
    dose: Optional[str] = None
    unit: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    confidence: float = 0.95
    verification_status: str = "NEEDS_VERIFICATION"

class MedicationCreate(MedicationBase):
    patient_id: str
    source_fact_id: Optional[str] = None

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    verification_status: Optional[str] = None

class MedicationResponse(MedicationBase):
    id: str
    patient_id: str
    source_fact_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
