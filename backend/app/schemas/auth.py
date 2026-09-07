from pydantic import BaseModel, EmailStr, ConfigDict, model_validator
from typing import Optional, Any
from datetime import datetime

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: Optional[str] = None
    username_or_email: Optional[str] = None
    password: str

    @model_validator(mode="before")
    @classmethod
    def check_email_field(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("email") and data.get("username_or_email"):
                data["email"] = data["username_or_email"]
        return data

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str
    role: str
    expires_in: int = 28800
    user: Optional[UserResponse] = None

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "PATIENT"

UserCreate = RegisterRequest
