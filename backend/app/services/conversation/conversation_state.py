"""
Conversation State Management for MediKiosk.

Handles serializable, persistent conversation state that survives page refreshes and network interruptions.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
import json


class ConversationState(BaseModel):
    conversation_id: str
    patient_id: str
    intake_id: str
    current_stage: str = "GREETING"  # GREETING, CHIEF_COMPLAINT, SYMPTOM_EXPLORATION, MEDICAL_HISTORY, MEDICATIONS, ALLERGIES, REVIEW, COMPLETED
    current_topic: str = "greeting"
    current_question: str = ""
    current_pathway: str = "GENERAL_PATHWAY"
    questions_asked: List[str] = Field(default_factory=list)
    missing_fields: List[str] = Field(default_factory=list)
    facts_collected: List[Dict[str, Any]] = Field(default_factory=list)
    red_flags: List[Dict[str, Any]] = Field(default_factory=list)
    conflicts: List[Dict[str, Any]] = Field(default_factory=list)
    language: str = "en"
    accessibility_mode: str = "STANDARD"
    started_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: Optional[str] = None
    is_completed: bool = False

    def to_json(self) -> str:
        return self.model_dump_json()

    @classmethod
    def from_json(cls, data_str: str) -> "ConversationState":
        return cls.model_validate_json(data_str)

    def mark_question_asked(self, topic: str, question_text: str):
        self.current_topic = topic
        self.current_question = question_text
        if topic not in self.questions_asked:
            self.questions_asked.append(topic)
        self.updated_at = datetime.now(timezone.utc).isoformat()

    def add_fact(self, fact_dict: Dict[str, Any]):
        self.facts_collected.append(fact_dict)
        self.updated_at = datetime.now(timezone.utc).isoformat()

    def add_red_flag(self, flag: Dict[str, Any]):
        # Avoid duplicate red flags
        if not any(rf.get("rule_id") == flag.get("rule_id") for rf in self.red_flags):
            self.red_flags.append(flag)
        self.updated_at = datetime.now(timezone.utc).isoformat()

    def add_conflict(self, conflict: Dict[str, Any]):
        if not any(c.get("conflict_id") == conflict.get("conflict_id") for c in self.conflicts):
            self.conflicts.append(conflict)
        self.updated_at = datetime.now(timezone.utc).isoformat()
