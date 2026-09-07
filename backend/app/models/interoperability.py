from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class InteroperabilityExport(Base):
    __tablename__ = "interoperability_exports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    intake_id = Column(String(36), ForeignKey("intake_sessions.id", ondelete="SET NULL"), nullable=True)
    export_type = Column(String(50), default="FHIR_BUNDLE_R4", nullable=False)
    bundle_json = Column(Text, nullable=False)
    is_valid = Column(Boolean, default=True, nullable=False)
    validation_errors = Column(Text, nullable=True)  # JSON array string of errors if any
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    patient = relationship("Patient")
    intake_session = relationship("IntakeSession")


class DemoInteroperabilityTransaction(Base):
    __tablename__ = "demo_interoperability_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference_id = Column(String(50), nullable=False, unique=True)  # e.g. "DEMO-INT-10293"
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    intake_id = Column(String(36), ForeignKey("intake_sessions.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(30), default="accepted", nullable=False)
    mode = Column(String(30), default="demo", nullable=False)
    message = Column(String(255), default="Simulated interoperability submission.", nullable=False)
    payload_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    patient = relationship("Patient")
    intake_session = relationship("IntakeSession")
