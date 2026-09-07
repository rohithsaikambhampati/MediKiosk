from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.patient import PatientResponse
from app.schemas.department import DepartmentResponse
from app.schemas.doctor import DoctorResponse

class QueueItemBase(BaseModel):
    token_number: str
    department_id: Optional[str] = None
    status: str = "AWAITING_TRIAGE"
    priority: str = "ROUTINE"
    assigned_doctor_id: Optional[str] = None

class QueueItemCreate(QueueItemBase):
    patient_id: str
    intake_session_id: Optional[str] = None

class QueueItemUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_doctor_id: Optional[str] = None

class EscalateRequest(BaseModel):
    reason: str = "Urgent clinical escalation required"
    priority: str = "IMMEDIATE"

class SendToDoctorRequest(BaseModel):
    doctor_id: Optional[str] = None
    notes: Optional[str] = None

class QueueItemResponse(QueueItemBase):
    id: str
    patient_id: str
    intake_session_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    patient: Optional[PatientResponse] = None
    department: Optional[DepartmentResponse] = None
    assigned_doctor: Optional[DoctorResponse] = None

    model_config = ConfigDict(from_attributes=True)
