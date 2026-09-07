from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Allergy(Base):
    __tablename__ = "allergies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    substance = Column(String(150), nullable=False)
    reaction = Column(String(255), nullable=True)
    severity = Column(String(50), default="moderate", nullable=False)  # mild, moderate, severe
    source_fact_id = Column(String(36), ForeignKey("medical_facts.id", ondelete="SET NULL"), nullable=True)
    confidence = Column(Float, default=0.98, nullable=False)
    verification_status = Column(String(30), default="DOCTOR_VERIFIED", nullable=False)

    patient = relationship("Patient", back_populates="allergies")
    source_fact = relationship("MedicalFact")
