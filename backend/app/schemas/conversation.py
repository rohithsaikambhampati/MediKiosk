from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class MessageCreate(BaseModel):
    role: str = "PATIENT"  # PATIENT, ASSISTANT, SYSTEM
    content: str
    source: str = "VOICE"  # VOICE, TEXT, AI, SYSTEM
    metadata_json: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    source: str
    metadata_json: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

ConversationMessageResponse = MessageResponse

class ConversationCreate(BaseModel):
    intake_session_id: str
    language: str = "en"

class ConversationResponse(BaseModel):
    id: str
    intake_session_id: str
    language: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    messages: List[MessageResponse] = []

    model_config = ConfigDict(from_attributes=True)
