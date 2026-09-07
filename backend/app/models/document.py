from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid

class DocumentType(str, enum.Enum):
    PRESCRIPTION = "PRESCRIPTION"
    LAB_REPORT = "LAB_REPORT"
    DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY"
    MEDICAL_REPORT = "MEDICAL_REPORT"
    IMAGING_REPORT = "IMAGING_REPORT"
    MEDICATION_LIST = "MEDICATION_LIST"
    OTHER = "OTHER"
    UNKNOWN_DOCUMENT = "UNKNOWN_DOCUMENT"

class ProcessingStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    VALIDATING = "VALIDATING"
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    OCR_COMPLETED = "OCR_COMPLETED"
    EXTRACTION_COMPLETED = "EXTRACTION_COMPLETED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    FAILED = "FAILED"
    PROCESSED = "PROCESSED"

class DocumentQuality(str, enum.Enum):
    GOOD = "GOOD"
    FAIR = "FAIR"
    POOR = "POOR"

class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    intake_session_id = Column(String(36), ForeignKey("intake_sessions.id", ondelete="SET NULL"), nullable=True)
    file_name = Column(String(255), nullable=False)
    document_type = Column(String(50), default=DocumentType.PRESCRIPTION.value, nullable=False)
    storage_path = Column(String(255), nullable=False)  # Internal storage key (never exposed as server path)
    mime_type = Column(String(100), default="application/pdf", nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    document_date = Column(String(50), nullable=True)
    processing_status = Column(String(30), default=ProcessingStatus.UPLOADED.value, nullable=False)
    ocr_status = Column(String(30), default="PENDING", nullable=False)
    extracted_facts_count = Column(Integer, default=0, nullable=False)
    page_count = Column(Integer, default=1, nullable=False)
    quality = Column(String(20), default=DocumentQuality.GOOD.value, nullable=False)
    quality_message = Column(Text, nullable=True)
    classification_confidence = Column(Float, default=0.90, nullable=False)
    supporting_signals = Column(Text, nullable=True)  # JSON list string of signals
    raw_text = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    patient = relationship("Patient", back_populates="documents")
    intake_session = relationship("IntakeSession", back_populates="documents")
    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    blocks = relationship("OCRBlock", back_populates="document", cascade="all, delete-orphan")
    entities = relationship("DocumentEntity", back_populates="document", cascade="all, delete-orphan")
    evidence_sources = relationship("EvidenceSource", back_populates="document", cascade="all, delete-orphan")


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, default=1, nullable=False)
    raw_text = Column(Text, nullable=True)
    confidence = Column(Float, default=0.90, nullable=False)
    quality = Column(String(20), default=DocumentQuality.GOOD.value, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    document = relationship("MedicalDocument", back_populates="pages")
    blocks = relationship("OCRBlock", back_populates="page", cascade="all, delete-orphan")


class OCRBlock(Base):
    __tablename__ = "ocr_blocks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="CASCADE"), nullable=False)
    page_id = Column(String(36), ForeignKey("document_pages.id", ondelete="CASCADE"), nullable=True)
    page_number = Column(Integer, default=1, nullable=False)
    block_id = Column(String(50), nullable=False)  # e.g. "b1", "b2"
    text = Column(Text, nullable=False)
    confidence = Column(Float, default=0.90, nullable=False)
    bounding_box = Column(Text, nullable=True)  # JSON string: {"x": 100, "y": 200, "width": 300, "height": 40}
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    document = relationship("MedicalDocument", back_populates="blocks")
    page = relationship("DocumentPage", back_populates="blocks")


class DocumentEntity(Base):
    __tablename__ = "document_entities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String(50), nullable=False)  # MEDICATION, LAB_TEST, ALLERGY, PROCEDURE, SURGERY, HISTORICAL_CONDITION, DATE, etc.
    name = Column(String(200), nullable=False)
    value = Column(Text, nullable=False)
    unit = Column(String(50), nullable=True)
    reference_range = Column(String(100), nullable=True)
    abnormal_flag = Column(String(50), nullable=True)  # ABNORMAL_HIGH, ABNORMAL_LOW, NORMAL, REFERENCE_RANGE_NOT_AVAILABLE
    clinician_advisory = Column(Text, nullable=True)  # Non-diagnostic clinician review note
    dose = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)
    duration = Column(String(100), nullable=True)
    instructions = Column(Text, nullable=True)
    confidence = Column(Float, default=0.90, nullable=False)
    source_page = Column(Integer, default=1, nullable=True)
    source_block_id = Column(String(50), nullable=True)
    source_text = Column(Text, nullable=True)
    verification_status = Column(String(30), default="NEEDS_VERIFICATION", nullable=False)
    medical_fact_id = Column(String(36), ForeignKey("medical_facts.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    document = relationship("MedicalDocument", back_populates="entities")
    medical_fact = relationship("MedicalFact")

