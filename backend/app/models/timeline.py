from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid

class TimelineEventType(str, enum.Enum):
    CONDITION = "CONDITION"
    MEDICATION = "MEDICATION"
    SURGERY = "SURGERY"
    HOSPITALIZATION = "HOSPITALIZATION"
    INVESTIGATION = "INVESTIGATION"
    LAB = "LAB"
    PROCEDURE = "PROCEDURE"
    SYMPTOM = "SYMPTOM"
    DIAGNOSIS_REPORTED = "DIAGNOSIS_REPORTED"
    DOCUMENT = "DOCUMENT"
    VISIT = "VISIT"
    PATIENT_REPORTED = "PATIENT_REPORTED"
    OTHER = "OTHER"

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    date = Column(String(50), nullable=False)  # ISO Date or Year format e.g. "2024-03-12" or "2022"
    event_type = Column(String(50), default=TimelineEventType.CONDITION.value, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    source_fact_id = Column(String(36), ForeignKey("medical_facts.id", ondelete="SET NULL"), nullable=True)
    evidence_id = Column(String(36), ForeignKey("evidence_sources.id", ondelete="SET NULL"), nullable=True)
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="SET NULL"), nullable=True)
    confidence = Column(Float, default=0.95, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    patient = relationship("Patient", back_populates="timeline_events")
    source_fact = relationship("MedicalFact")
    evidence = relationship("EvidenceSource")
    document = relationship("MedicalDocument")

