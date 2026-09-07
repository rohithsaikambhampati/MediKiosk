from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    medical_fact_id = Column(String(36), ForeignKey("medical_facts.id", ondelete="CASCADE"), nullable=False)
    reviewed_by = Column(String(150), nullable=False)  # Doctor Name / Staff
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    medical_fact = relationship("MedicalFact", back_populates="verification_records")
