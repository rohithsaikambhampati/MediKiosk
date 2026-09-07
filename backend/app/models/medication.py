from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Medication(Base):
    __tablename__ = "medications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    dose = Column(String(50), nullable=True)
    unit = Column(String(20), nullable=True)
    frequency = Column(String(50), nullable=True)  # BD, OD, TDS, PRN
    duration = Column(String(50), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    source_fact_id = Column(String(36), ForeignKey("medical_facts.id", ondelete="SET NULL"), nullable=True)
    confidence = Column(Float, default=0.95, nullable=False)
    verification_status = Column(String(30), default="NEEDS_VERIFICATION", nullable=False)

    patient = relationship("Patient", back_populates="medications")
    source_fact = relationship("MedicalFact")
