from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid


class ConsentStatus(str, enum.Enum):
    GRANTED = "GRANTED"
    WITHDRAWN = "WITHDRAWN"
    EXPIRED = "EXPIRED"
    PENDING = "PENDING"


class ConsentPurpose(str, enum.Enum):
    CLINICAL_INTAKE = "CLINICAL_INTAKE"
    DOCUMENT_PROCESSING = "DOCUMENT_PROCESSING"
    CLINICIAN_REVIEW = "CLINICIAN_REVIEW"
    INTEROPERABILITY_EXPORT = "INTEROPERABILITY_EXPORT"
    DEMO_DATA_PROCESSING = "DEMO_DATA_PROCESSING"


class Consent(Base):
    __tablename__ = "consents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    intake_id = Column(String(36), ForeignKey("intake_sessions.id", ondelete="SET NULL"), nullable=True)
    purpose = Column(String(50), default=ConsentPurpose.CLINICAL_INTAKE.value, nullable=False)
    scope = Column(Text, nullable=False)  # JSON array string, e.g. '["history", "uploaded_documents", "structured_facts"]'
    status = Column(String(30), default=ConsentStatus.GRANTED.value, nullable=False)
    granted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    withdrawn_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    language = Column(String(10), default="en", nullable=False)
    consent_method = Column(String(50), default="patient_ui", nullable=False)
    consent_text_version = Column(String(20), default="v1.0", nullable=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    patient = relationship("Patient")
    intake_session = relationship("IntakeSession")

    def get_scope_list(self):
        import json
        if not self.scope:
            return []
        try:
            return json.loads(self.scope)
        except Exception:
            return [self.scope]

    def get_metadata_dict(self):
        import json
        if not self.metadata_json:
            return {}
        try:
            return json.loads(self.metadata_json)
        except Exception:
            return {}
