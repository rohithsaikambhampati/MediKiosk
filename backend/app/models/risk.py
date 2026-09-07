from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid

class RiskPriority(str, enum.Enum):
    ROUTINE = "ROUTINE"
    NEEDS_ATTENTION = "NEEDS_ATTENTION"
    HIGH_PRIORITY = "HIGH_PRIORITY"
    IMMEDIATE = "IMMEDIATE"

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    intake_session_id = Column(String(36), ForeignKey("intake_sessions.id", ondelete="SET NULL"), nullable=True)
    priority = Column(String(30), default=RiskPriority.ROUTINE.value, nullable=False)
    reason = Column(Text, nullable=False)
    signals_json = Column(Text, nullable=True)  # JSON array of clinical red flags/signals
    source = Column(String(100), default="Intake Triaging Rules", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    patient = relationship("Patient", back_populates="risks")
    intake_session = relationship("IntakeSession", back_populates="risks")
