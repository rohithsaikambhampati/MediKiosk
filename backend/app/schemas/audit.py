from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from app.schemas.auth import UserResponse

class AuditEventCreate(BaseModel):
    actor_user_id: Optional[str] = None
    actor_role: str = "SYSTEM"
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    metadata_json: Optional[str] = None

class AuditEventResponse(BaseModel):
    id: str
    actor_user_id: Optional[str] = None
    actor_role: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    metadata_json: Optional[str] = None
    created_at: datetime
    actor_user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
