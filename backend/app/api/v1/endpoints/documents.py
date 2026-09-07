from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, Form, status, Response, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.document import DocumentType, MedicalDocument
from app.models.evidence import EvidenceSource
from app.models.timeline import TimelineEvent
from app.schemas.document import (
    DocumentResponse,
    DocumentStatusResponse,
    DocumentEntityResponse,
    DocumentProcessResponse,
)
from app.schemas.common import ApiResponse
from app.services.document_service import DocumentService
from app.services.timeline_service import TimelineService
from app.services.documents.synthetic_demo_docs import SYNTHETIC_DEMO_DOCUMENTS

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=ApiResponse[DocumentResponse], status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    intake_id: Optional[str] = Form(None),
    document_type: Optional[DocumentType] = Form(None),
    db: Session = Depends(get_db),
):
    """Uploads and validates a medical document, securely storing and executing the intelligence pipeline."""
    service = DocumentService(db)
    doc = await service.upload_document(
        file=file,
        patient_id=patient_id,
        intake_id=intake_id,
        doc_type=document_type,
        auto_process=True,
    )
    return ApiResponse(data=DocumentResponse.model_validate(doc))


@router.get("/{document_id}", response_model=ApiResponse[DocumentResponse])
def get_document(document_id: str, db: Session = Depends(get_db)):
    """Retrieves document metadata and processing status."""
    service = DocumentService(db)
    doc = service.get_document(document_id)
    return ApiResponse(data=DocumentResponse.model_validate(doc))


@router.get("/{document_id}/file")
def get_document_file(document_id: str, db: Session = Depends(get_db)):
    """Secure backend-mediated access to binary document content (never public URL)."""
    service = DocumentService(db)
    doc = service.get_document(document_id)
    file_bytes = service.get_document_file_bytes(document_id)
    return Response(
        content=file_bytes,
        media_type=doc.mime_type,
        headers={"Content-Disposition": f'inline; filename="{doc.file_name}"'},
    )


@router.get("/{document_id}/status", response_model=ApiResponse[DocumentStatusResponse])
def get_document_status(document_id: str, db: Session = Depends(get_db)):
    """Retrieves real-time processing progress and stage for frontend animation."""
    service = DocumentService(db)
    status_info = service.get_document_status(document_id)
    return ApiResponse(data=DocumentStatusResponse(**status_info))


@router.post("/{document_id}/process", response_model=ApiResponse[DocumentProcessResponse])
def process_document(document_id: str, db: Session = Depends(get_db)):
    """Triggers or re-triggers OCR and entity extraction on an existing document."""
    service = DocumentService(db)
    doc = service.process_document(document_id)
    return ApiResponse(
        data=DocumentProcessResponse(
            document_id=doc.id,
            processing_status=doc.processing_status,
            document_type=doc.document_type,
            classification_confidence=doc.classification_confidence or 0.9,
            extracted_entities_count=doc.extracted_facts_count or 0,
            quality=doc.quality or "GOOD",
            message="Document processing completed successfully",
        )
    )


@router.post("/{document_id}/retry", response_model=ApiResponse[DocumentResponse])
def retry_document(document_id: str, db: Session = Depends(get_db)):
    """Retries a failed document processing job."""
    service = DocumentService(db)
    doc = service.retry_document(document_id)
    return ApiResponse(data=DocumentResponse.model_validate(doc))


@router.delete("/{document_id}", response_model=ApiResponse[Dict[str, Any]])
def delete_document(document_id: str, db: Session = Depends(get_db)):
    """Deletes a document and its extracted entities/evidence from storage and database."""
    service = DocumentService(db)
    success = service.delete_document(document_id)
    return ApiResponse(data={"deleted": success, "document_id": document_id})


@router.get("/{document_id}/entities", response_model=ApiResponse[List[DocumentEntityResponse]])
def get_document_entities(document_id: str, db: Session = Depends(get_db)):
    """Lists all structured medical entities (meds, labs, allergies) extracted from document."""
    service = DocumentService(db)
    entities = service.get_document_entities(document_id)
    return ApiResponse(data=[DocumentEntityResponse.model_validate(e) for e in entities])


@router.get("/{document_id}/evidence", response_model=ApiResponse[List[Dict[str, Any]]])
def get_document_evidence(document_id: str, db: Session = Depends(get_db)):
    """Lists all evidence items linked to this document with page and snippet coordinates."""
    service = DocumentService(db)
    evidence_items = service.get_document_evidence(document_id)
    return ApiResponse(
        data=[
            {
                "id": ev.id,
                "medical_fact_id": ev.medical_fact_id,
                "document_id": ev.document_id,
                "page_number": ev.page_number or 1,
                "block_id": ev.block_id,
                "source_label": ev.source_label,
                "source_excerpt": ev.source_excerpt,
                "confidence": ev.confidence,
                "verification_status": ev.verification_status,
            }
            for ev in evidence_items
        ]
    )


@router.get("/patient/{patient_id}", response_model=ApiResponse[List[DocumentResponse]])
def get_patient_documents(patient_id: str, db: Session = Depends(get_db)):
    """Lists all medical documents for a specific patient."""
    service = DocumentService(db)
    docs = service.get_patient_documents(patient_id)
    return ApiResponse(data=[DocumentResponse.model_validate(d) for d in docs])


@router.get("/patient/{patient_id}/timeline", response_model=ApiResponse[List[Dict[str, Any]]])
def get_patient_timeline(patient_id: str, db: Session = Depends(get_db)):
    """Retrieves chronological medical timeline compiled from documents and conversations."""
    t_service = TimelineService(db)
    events = t_service.get_patient_timeline(patient_id)
    return ApiResponse(
        data=[
            {
                "id": t.id,
                "patient_id": t.patient_id,
                "date": t.date,
                "event_type": t.event_type,
                "title": t.title,
                "description": t.description,
                "document_id": t.document_id,
                "confidence": t.confidence,
                "created_at": t.created_at.isoformat(),
            }
            for t in events
        ]
    )


@router.get("/patient/{patient_id}/evidence", response_model=ApiResponse[List[Dict[str, Any]]])
def get_patient_evidence(patient_id: str, db: Session = Depends(get_db)):
    """Retrieves all evidence sources (documents and transcripts) for a patient."""
    evidences = (
        db.query(EvidenceSource)
        .join(MedicalDocument, EvidenceSource.document_id == MedicalDocument.id, isouter=True)
        .filter(MedicalDocument.patient_id == patient_id)
        .all()
    )
    return ApiResponse(
        data=[
            {
                "id": ev.id,
                "medical_fact_id": ev.medical_fact_id,
                "source_type": ev.source_type,
                "document_id": ev.document_id,
                "page_number": ev.page_number or 1,
                "block_id": ev.block_id,
                "source_label": ev.source_label,
                "source_excerpt": ev.source_excerpt,
                "confidence": ev.confidence,
                "verification_status": ev.verification_status,
            }
            for ev in evidences
        ]
    )


@router.post("/demo/seed", response_model=ApiResponse[List[DocumentResponse]])
async def seed_demo_documents(
    patient_id: str = Form("patient-ramesh-01"),
    intake_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Seeds synthetic demo documents (Prescription & Lab Report) for Ramesh Kumar
    for immediate hackathon demonstration and verification.
    """
    service = DocumentService(db)
    created_docs = []

    # Upload Prescription & Lab Report from synthetic fixtures
    for fixture in SYNTHETIC_DEMO_DOCUMENTS[:2]:
        file_bytes = fixture["content_text"].encode("utf-8")
        file_path, _ = await service.storage.save_file(
            file_data=file_bytes,
            filename=fixture["file_name"],
            patient_id=patient_id,
        )

        doc = MedicalDocument(
            patient_id=patient_id,
            intake_session_id=intake_id,
            file_name=fixture["file_name"],
            document_type=fixture["document_type"],
            storage_path=file_path,
            mime_type=fixture["mime_type"],
            file_size_bytes=len(file_bytes),
            document_date=fixture["document_date"],
            processing_status="UPLOADED",
            ocr_status="PENDING",
        )
        saved = service.doc_repo.create(doc)
        # Process through pipeline
        processed = service.processor.process_document(saved.id)
        created_docs.append(processed)

    return ApiResponse(data=[DocumentResponse.model_validate(d) for d in created_docs])

