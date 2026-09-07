import os
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session

from app.models.document import MedicalDocument, DocumentType, ProcessingStatus, DocumentEntity
from app.models.evidence import EvidenceSource
from app.repositories.document_repository import DocumentRepository
from app.repositories.patient_repository import PatientRepository
from app.utils.storage import DocumentStorage, get_document_storage
from app.services.documents.document_processor import DocumentProcessor
from app.services.audit_service import audit_service


class DocumentService:
    ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
    ALLOWED_MIME_TYPES = {
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/octet-stream",  # Fallback for binary uploads
    }
    MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB

    def __init__(self, db: Session, storage: Optional[DocumentStorage] = None):
        self.db = db
        self.doc_repo = DocumentRepository(db)
        self.patient_repo = PatientRepository(db)
        self.storage = storage or get_document_storage()
        self.processor = DocumentProcessor(db)

    def validate_file(self, filename: str, content_type: Optional[str], size_bytes: int):
        """Validates file extension, MIME type, and size."""
        ext = os.path.splitext(filename)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file extension '{ext}'. Supported formats: PDF, JPG, JPEG, PNG.",
            )

        if content_type and content_type.lower() not in self.ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported MIME type '{content_type}'. Supported formats: application/pdf, image/jpeg, image/png.",
            )

        if size_bytes <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file uploaded. Please upload a valid medical document.",
            )

        if size_bytes > self.MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of 15MB ({size_bytes / (1024*1024):.1f}MB).",
            )

    async def upload_document(
        self,
        file: UploadFile,
        patient_id: str,
        intake_id: Optional[str] = None,
        doc_type: Optional[DocumentType] = None,
        auto_process: bool = True,
    ) -> MedicalDocument:
        patient = self.patient_repo.get_by_id(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient {patient_id} not found",
            )

        content = await file.read()
        self.validate_file(file.filename, file.content_type, len(content))

        file_path, file_url = await self.storage.save_file(
            file_data=content,
            filename=file.filename,
            patient_id=patient_id,
        )

        doc_record = MedicalDocument(
            patient_id=patient_id,
            intake_session_id=intake_id,
            file_name=file.filename,
            document_type=doc_type.value if doc_type else DocumentType.OTHER.value,
            storage_path=file_path,
            mime_type=file.content_type or "application/pdf",
            file_size_bytes=len(content),
            processing_status=ProcessingStatus.UPLOADED.value,
            ocr_status="PENDING",
            extracted_facts_count=0,
        )
        created_doc = self.doc_repo.create(doc_record)

        audit_service.log_event(
            db=self.db,
            event_type="DOCUMENT_UPLOADED",
            patient_id=patient_id,
            details={
                "document_id": created_doc.id,
                "file_name": created_doc.file_name,
                "mime_type": created_doc.mime_type,
                "size_bytes": created_doc.file_size_bytes,
            },
        )

        if auto_process:
            created_doc = self.processor.process_document(created_doc.id)

        return created_doc

    def process_document(self, doc_id: str) -> MedicalDocument:
        return self.processor.process_document(doc_id)

    def retry_document(self, doc_id: str) -> MedicalDocument:
        doc = self.get_document(doc_id)
        doc.processing_status = ProcessingStatus.QUEUED.value
        doc.error_message = None
        self.db.commit()
        return self.processor.process_document(doc.id)

    def get_document(self, doc_id: str) -> MedicalDocument:
        doc = self.doc_repo.get_by_id(doc_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical document not found",
            )
        return doc

    def get_document_file_bytes(self, doc_id: str) -> bytes:
        doc = self.get_document(doc_id)
        file_bytes = self.storage.get(doc.storage_path) if doc.storage_path else None
        if not file_bytes:
            if doc.raw_text:
                return doc.raw_text.encode("utf-8")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document file content not found in storage",
            )
        return file_bytes


    def get_document_entities(self, doc_id: str) -> List[DocumentEntity]:
        doc = self.get_document(doc_id)
        return self.db.query(DocumentEntity).filter(DocumentEntity.document_id == doc.id).all()

    def get_document_evidence(self, doc_id: str) -> List[EvidenceSource]:
        doc = self.get_document(doc_id)
        return self.db.query(EvidenceSource).filter(EvidenceSource.document_id == doc.id).all()

    def get_document_status(self, doc_id: str) -> Dict[str, Any]:
        doc = self.get_document(doc_id)

        status_progress = {
            ProcessingStatus.UPLOADED.value: (15, "Uploading and registering document"),
            ProcessingStatus.VALIDATING.value: (25, "Validating file format and integrity"),
            ProcessingStatus.QUEUED.value: (35, "Queued for processing"),
            ProcessingStatus.PROCESSING.value: (55, "Reading document via OCR"),
            ProcessingStatus.OCR_COMPLETED.value: (70, "Classifying document type"),
            ProcessingStatus.EXTRACTION_COMPLETED.value: (85, "Extracting medications and lab values"),
            ProcessingStatus.NEEDS_REVIEW.value: (100, "Ready with verification notes"),
            ProcessingStatus.PROCESSED.value: (100, "Ready for review"),
            ProcessingStatus.FAILED.value: (100, "Processing encountered an issue"),
        }

        pct, stage = status_progress.get(doc.processing_status, (50, "Processing document"))

        return {
            "id": doc.id,
            "file_name": doc.file_name,
            "document_type": doc.document_type,
            "processing_status": doc.processing_status,
            "ocr_status": doc.ocr_status,
            "progress_percentage": pct,
            "current_stage": stage,
            "quality": doc.quality or "GOOD",
            "quality_message": doc.quality_message,
            "extracted_facts_count": doc.extracted_facts_count or 0,
            "error_message": doc.error_message,
        }

    def delete_document(self, doc_id: str) -> bool:
        doc = self.get_document(doc_id)
        self.storage.delete(doc.storage_path)
        self.doc_repo.delete(doc.id)
        return True

    def get_patient_documents(self, patient_id: str) -> List[MedicalDocument]:
        return self.doc_repo.get_by_patient_id(patient_id)

    def get_intake_documents(self, intake_id: str) -> List[MedicalDocument]:
        return self.doc_repo.get_by_intake_session_id(intake_id)

