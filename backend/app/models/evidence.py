from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class EvidenceSource(Base):
    __tablename__ = "evidence_sources"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    medical_fact_id = Column(String(36), ForeignKey("medical_facts.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(50), nullable=False)  # DOCUMENT, CONVERSATION, PATIENT_INPUT
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="SET NULL"), nullable=True)
    conversation_message_id = Column(String(36), ForeignKey("conversation_messages.id", ondelete="SET NULL"), nullable=True)
    source_label = Column(String(200), nullable=False)  # e.g. "CityHospital_DischargeSummary.pdf (Page 2)"
    source_excerpt = Column(Text, nullable=True)  # Highlighted snippet
    confidence = Column(Float, default=0.95, nullable=False)
    page_number = Column(Integer, nullable=True)
    block_id = Column(String(50), nullable=True)
    bounding_box = Column(Text, nullable=True)  # JSON bbox coordinates if provided by OCR
    verification_status = Column(String(30), default="NEEDS_VERIFICATION", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    medical_fact = relationship("MedicalFact", back_populates="evidence_sources")
    document = relationship("MedicalDocument", back_populates="evidence_sources")
    conversation_message = relationship("ConversationMessage")

