from pydantic import BaseModel, ConfigDict
from typing import Optional

class AllergyBase(BaseModel):
    substance: str
    reaction: Optional[str] = None
    severity: str = "moderate"
    confidence: float = 0.98
    verification_status: str = "DOCTOR_VERIFIED"

class AllergyCreate(AllergyBase):
    patient_id: str
    source_fact_id: Optional[str] = None

class AllergyUpdate(BaseModel):
    reaction: Optional[str] = None
    severity: Optional[str] = None
    verification_status: Optional[str] = None

class AllergyResponse(AllergyBase):
    id: str
    patient_id: str
    source_fact_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
