from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.auth import UserResponse
from app.schemas.department import DepartmentResponse

class DoctorBase(BaseModel):
    department_id: Optional[str] = None
    hospital_id: Optional[str] = None
    specialty: Optional[str] = None
    room_number: Optional[str] = "Room #04"
    status: str = "ACTIVE"

class DoctorCreate(DoctorBase):
    user_id: str

class DoctorUpdate(BaseModel):
    department_id: Optional[str] = None
    specialty: Optional[str] = None
    room_number: Optional[str] = None
    status: Optional[str] = None

class DoctorResponse(DoctorBase):
    id: str
    user_id: str
    created_at: datetime
    user: Optional[UserResponse] = None
    department: Optional[DepartmentResponse] = None

    model_config = ConfigDict(from_attributes=True)
