from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid

class QueueStatus(str, enum.Enum):
    AWAITING_TRIAGE = "AWAITING_TRIAGE"
    UNDER_TRIAGE = "UNDER_TRIAGE"
    ESCALATED = "ESCALATED"
    READY_FOR_DOCTOR = "READY_FOR_DOCTOR"
    DOCTOR_REVIEW = "DOCTOR_REVIEW"
    CONSULTATION = "CONSULTATION"
    COMPLETED = "COMPLETED"

class QueueItem(Base):
    __tablename__ = "queue_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    intake_session_id = Column(String(36), ForeignKey("intake_sessions.id", ondelete="SET NULL"), nullable=True)
    token_number = Column(String(20), nullable=False)  # e.g. "#102"
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(30), default=QueueStatus.AWAITING_TRIAGE.value, nullable=False)
    priority = Column(String(30), default="ROUTINE", nullable=False)  # ROUTINE, NEEDS_ATTENTION, HIGH_PRIORITY, IMMEDIATE
    assigned_doctor_id = Column(String(36), ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    patient = relationship("Patient", back_populates="queue_items")
    intake_session = relationship("IntakeSession", back_populates="queue_items")
    department = relationship("Department")
    assigned_doctor = relationship("Doctor")
