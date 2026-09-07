from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class EvidenceResponse(BaseModel):
    id: str
    medical_fact_id: str
    source_type: str
    document_id: Optional[str] = None
    conversation_message_id: Optional[str] = None
    source_label: str
    source_excerpt: Optional[str] = None
    confidence: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EvidenceCreate(BaseModel):
    medical_fact_id: str
    source_type: str
    document_id: Optional[str] = None
    conversation_message_id: Optional[str] = None
    source_label: str
    source_excerpt: Optional[str] = None
    confidence: float = 0.95
