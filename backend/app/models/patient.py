from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hospital_id = Column(String(50), unique=True, index=True, nullable=False)  # MRN / Hospital Patient ID
    name = Column(String(150), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)  # male, female, other
    phone = Column(String(20), index=True, nullable=True)
    preferred_language = Column(String(10), default="en", nullable=False)
    accessibility_mode = Column(Boolean, default=False, nullable=False)
    abha_reference = Column(String(50), nullable=True)  # Nullable prototype field
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    intake_sessions = relationship("IntakeSession", back_populates="patient", cascade="all, delete-orphan")
    documents = relationship("MedicalDocument", back_populates="patient", cascade="all, delete-orphan")
    facts = relationship("MedicalFact", back_populates="patient", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="patient", cascade="all, delete-orphan")
    allergies = relationship("Allergy", back_populates="patient", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="patient", cascade="all, delete-orphan")
    risks = relationship("RiskAssessment", back_populates="patient", cascade="all, delete-orphan")
    queue_items = relationship("QueueItem", back_populates="patient", cascade="all, delete-orphan")
