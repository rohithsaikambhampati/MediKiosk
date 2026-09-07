from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid

class IntakeStatus(str, enum.Enum):
    CREATED = "CREATED"
    IDENTITY_VERIFIED = "IDENTITY_VERIFIED"
    CONSENTED = "CONSENTED"
    IN_PROGRESS = "IN_PROGRESS"
    DOCUMENTS_PROCESSING = "DOCUMENTS_PROCESSING"
    READY_FOR_REVIEW = "READY_FOR_REVIEW"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class IntakeSession(Base):
    __tablename__ = "intake_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(30), default=IntakeStatus.CREATED.value, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="intake_sessions")
    department = relationship("Department")
    consent_record = relationship("ConsentRecord", back_populates="intake_session", uselist=False, cascade="all, delete-orphan")
    conversation = relationship("Conversation", back_populates="intake_session", uselist=False, cascade="all, delete-orphan")
    documents = relationship("MedicalDocument", back_populates="intake_session", cascade="all, delete-orphan")
    facts = relationship("MedicalFact", back_populates="intake_session", cascade="all, delete-orphan")
    risks = relationship("RiskAssessment", back_populates="intake_session", cascade="all, delete-orphan")
    queue_items = relationship("QueueItem", back_populates="intake_session", cascade="all, delete-orphan")


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    intake_session_id = Column(String(36), ForeignKey("intake_sessions.id", ondelete="CASCADE"), unique=True, nullable=False)
    voice_consent = Column(Boolean, default=True, nullable=False)
    document_consent = Column(Boolean, default=True, nullable=False)
    ai_processing_consent = Column(Boolean, default=True, nullable=False)
    hospital_sharing_consent = Column(Boolean, default=True, nullable=False)
    abha_consent = Column(Boolean, default=False, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    intake_session = relationship("IntakeSession", back_populates="consent_record")
    patient = relationship("Patient")
