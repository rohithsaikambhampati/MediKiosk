from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid

class FactType(str, enum.Enum):
    SYMPTOM = "SYMPTOM"
    CONDITION = "CONDITION"
    MEDICATION = "MEDICATION"
    ALLERGY = "ALLERGY"
    PROCEDURE = "PROCEDURE"
    LAB = "LAB"
    OTHER = "OTHER"

class FactSourceType(str, enum.Enum):
    PATIENT_REPORTED = "PATIENT_REPORTED"
    DOCUMENT_DERIVED = "DOCUMENT_DERIVED"
    AI_EXTRACTED = "AI_EXTRACTED"
    DOCTOR_ENTERED = "DOCTOR_ENTERED"

class VerificationStatus(str, enum.Enum):
    AI_EXTRACTED = "AI_EXTRACTED"
    UNVERIFIED = "UNVERIFIED"
    NEEDS_VERIFICATION = "NEEDS_VERIFICATION"
    PATIENT_CONFIRMED = "PATIENT_CONFIRMED"
    DOCTOR_VERIFIED = "DOCTOR_VERIFIED"
    CONFLICTED = "CONFLICTED"
    REJECTED = "REJECTED"

class MedicalFact(Base):
    __tablename__ = "medical_facts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    intake_session_id = Column(String(36), ForeignKey("intake_sessions.id", ondelete="SET NULL"), nullable=True)
    fact_type = Column(String(30), nullable=False)  # e.g. SYMPTOM, CONDITION, MEDICATION, ALLERGY, etc.
    category = Column(String(50), nullable=True)     # Domain from clinical ontology
    field = Column(String(100), nullable=True)       # Specific field, e.g. chief_complaint, onset, duration
    value = Column(Text, nullable=False)
    normalized_value = Column(String(255), nullable=True)
    date = Column(String(50), nullable=True)
    confidence = Column(Float, default=0.95, nullable=False)  # Numeric 0.0 to 1.0
    source_type = Column(String(30), default=FactSourceType.AI_EXTRACTED.value, nullable=False)
    verification_status = Column(String(30), default=VerificationStatus.NEEDS_VERIFICATION.value, nullable=False)
    conflict_status = Column(String(30), default="NONE", nullable=False)  # NONE, CONFLICTED, RESOLVED
    patient_response = Column(Text, nullable=True)  # Verbatim response from patient (e.g. "I don't remember")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    patient = relationship("Patient", back_populates="facts")
    intake_session = relationship("IntakeSession", back_populates="facts")
    evidence_sources = relationship("EvidenceSource", back_populates="medical_fact", cascade="all, delete-orphan")
    verification_records = relationship("VerificationRecord", back_populates="medical_fact", cascade="all, delete-orphan", order_by="desc(VerificationRecord.created_at)")
