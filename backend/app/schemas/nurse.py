from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.auth import UserResponse
from app.schemas.department import DepartmentResponse

class NurseBase(BaseModel):
    department_id: Optional[str] = None
    desk_name: str = "Triage Desk 02"
    status: str = "ACTIVE"

class NurseCreate(NurseBase):
    user_id: str

class NurseResponse(NurseBase):
    id: str
    user_id: str
    created_at: datetime
    user: Optional[UserResponse] = None
    department: Optional[DepartmentResponse] = None

    model_config = ConfigDict(from_attributes=True)
