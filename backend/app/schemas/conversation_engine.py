"""
Pydantic Schemas for MediKiosk AI Clinical Conversation Engine.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class StartConversationRequest(BaseModel):
    intake_id: str
    language: str = "en"
    accessibility_mode: str = "STANDARD"


class StartConversationResponse(BaseModel):
    conversation_id: str
    intake_id: str
    patient_id: str
    status: str
    current_topic: str
    current_question: str
    is_completed: bool = False
    facts_count: int = 0
    red_flags: List[Dict[str, Any]] = []
    conflicts: List[Dict[str, Any]] = []


class ProcessTurnRequest(BaseModel):
    content: str
    language: Optional[str] = "en"
    source: str = "TEXT"  # TEXT or VOICE


class ProcessTurnResponse(BaseModel):
    conversation_id: str
    patient_message: Dict[str, Any]
    assistant_message: Dict[str, Any]
    next_topic: str
    next_question: str
    is_completed: bool
    new_facts: List[Dict[str, Any]]
    total_facts_count: int
    red_flags: List[Dict[str, Any]]
    conflicts: List[Dict[str, Any]]


class ConfirmFactsRequest(BaseModel):
    confirmed_fact_ids: Optional[List[str]] = None


class ConfirmFactsResponse(BaseModel):
    conversation_id: str
    intake_id: str
    confirmed_count: int
    status: str


class FactVerificationRequest(BaseModel):
    status: str  # DOCTOR_VERIFIED, REJECTED, NEEDS_VERIFICATION
    verified_value: Optional[str] = None
    reason: Optional[str] = None
