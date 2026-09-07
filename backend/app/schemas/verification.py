from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class VerifyFactRequest(BaseModel):
    reviewed_by: Optional[str] = "Dr. Sharma"
    new_value: Optional[str] = None
    reason: Optional[str] = "Clinical confirmation during triage review"

class RejectFactRequest(BaseModel):
    reviewed_by: Optional[str] = "Dr. Sharma"
    reason: str = "Clinical finding uncorroborated or conflicting with primary examination"

class VerificationResponse(BaseModel):
    id: str
    medical_fact_id: str
    reviewed_by: str
    previous_status: str
    new_status: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
