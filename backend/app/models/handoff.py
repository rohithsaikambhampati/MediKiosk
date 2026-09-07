from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid


class HandoffStatus(str, enum.Enum):
    READY = "READY"
    TRIAGE_REQUIRED = "TRIAGE_REQUIRED"
    ASSIGNED = "ASSIGNED"
    IN_REVIEW = "IN_REVIEW"
    CONSULTATION_STARTED = "CONSULTATION_STARTED"
    COMPLETED = "COMPLETED"


class WorkflowPriority(str, enum.Enum):
    ROUTINE = "ROUTINE"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    HIGH_PRIORITY_REVIEW = "HIGH_PRIORITY_REVIEW"


HandoffPriority = WorkflowPriority


class ClinicalHandoff(Base):
    __tablename__ = "clinical_handoffs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    intake_id = Column(String(36), ForeignKey("intake_sessions.id", ondelete="CASCADE"), nullable=False)
    priority = Column(String(30), default=WorkflowPriority.ROUTINE.value, nullable=False)
    status = Column(String(30), default=HandoffStatus.READY.value, nullable=False)
    assigned_to = Column(String(150), nullable=True)  # Doctor Name / Staff ID
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    patient = relationship("Patient")
    intake_session = relationship("IntakeSession")
