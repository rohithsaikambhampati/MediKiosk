from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentPageResponse(BaseModel):
    id: str
    page_number: int
    raw_text: Optional[str] = None
    confidence: float
    quality: str

    model_config = ConfigDict(from_attributes=True)

class OCRBlockResponse(BaseModel):
    id: str
    page_number: int
    block_id: str
    text: str
    confidence: float
    bounding_box: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DocumentEntityResponse(BaseModel):
    id: str
    entity_type: str
    name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    abnormal_flag: Optional[str] = None
    clinician_advisory: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    confidence: float
    source_page: Optional[int] = 1
    source_block_id: Optional[str] = None
    source_text: Optional[str] = None
    verification_status: str
    medical_fact_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: str
    patient_id: str
    intake_session_id: Optional[str] = None
    file_name: str
    document_type: str
    mime_type: str
    file_size_bytes: Optional[int] = 0
    document_date: Optional[str] = None
    processing_status: str
    ocr_status: str
    extracted_facts_count: int
    page_count: Optional[int] = 1
    quality: Optional[str] = "GOOD"
    quality_message: Optional[str] = None
    classification_confidence: Optional[float] = 0.90
    supporting_signals: Optional[str] = None
    created_at: datetime
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DocumentDetailResponse(DocumentResponse):
    raw_text: Optional[str] = None
    pages: List[DocumentPageResponse] = []
    entities: List[DocumentEntityResponse] = []

class DocumentUploadResponse(BaseModel):
    id: str
    file_name: str
    document_type: str
    processing_status: str
    extracted_facts_count: int
    quality: Optional[str] = "GOOD"
    message: str = "Document uploaded successfully"

class DocumentStatusResponse(BaseModel):
    id: str
    file_name: str
    document_type: str
    processing_status: str
    ocr_status: str
    progress_percentage: int
    current_stage: str
    quality: str
    quality_message: Optional[str] = None
    extracted_facts_count: int
    error_message: Optional[str] = None

class DocumentProcessResponse(BaseModel):
    document_id: str
    processing_status: str
    document_type: str
    classification_confidence: float
    extracted_entities_count: int
    quality: str
    message: str

