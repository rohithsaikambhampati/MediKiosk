from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_role = Column(String(50), nullable=False)  # PATIENT, DOCTOR, NURSE, ADMIN, SYSTEM
    action = Column(String(100), nullable=False)  # PATIENT_VIEWED, FACT_VERIFIED, FACT_EDITED, PATIENT_ESCALATED, etc.
    resource_type = Column(String(50), nullable=False)  # PATIENT, FACT, QUEUE, INTAKE, DOCUMENT
    resource_id = Column(String(100), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    actor_user = relationship("User")
