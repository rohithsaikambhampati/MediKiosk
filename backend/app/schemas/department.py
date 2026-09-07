from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class DepartmentBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
