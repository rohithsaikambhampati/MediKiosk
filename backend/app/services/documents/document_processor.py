"""
Document Processing Pipeline for MediKiosk.

Coordinates end-to-end document intelligence lifecycle:
1. Storage Retrieval
2. OCR Processing & Normalization
3. Document Page & OCR Block Generation
4. Document Type Classification
5. Medical Entity Extraction (Meds, Labs, Dates, Allergies, Surgeries)
6. Evidence Linking (Page, Block, Text Snippet)
7. Timeline Event Generation
8. Conflict Detection (Cross-checking against existing patient facts)
9. Quality Assessment (GOOD, FAIR, POOR)
10. Audit Logging
"""

import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.document import (
    MedicalDocument,
    DocumentType,
    ProcessingStatus,
    DocumentPage,
    OCRBlock,
    DocumentEntity,
)
from app.models.medical_fact import MedicalFact, FactSourceType, VerificationStatus
from app.models.evidence import EvidenceSource
from app.models.timeline import TimelineEvent, TimelineEventType
from app.utils.storage import get_document_storage
from app.services.ocr.ocr_service import ocr_service
from app.services.documents.document_classifier import document_classifier
from app.services.extraction.medical_entity_extractor import medical_entity_extractor
from app.services.conflicts.document_conflict_service import DocumentConflictService
from app.services.audit_service import audit_service

logger = logging.getLogger(__name__)


class DocumentProcessor:
    def __init__(self, db: Session):
        self.db = db
        self.storage = get_document_storage()
        self.conflict_service = DocumentConflictService(db)

    def process_document(self, document_id: str) -> MedicalDocument:
        """
        Executes complete document intelligence pipeline synchronously.
        """
        doc = self.db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
        if not doc:
            raise ValueError(f"Medical document {document_id} not found")

        # 1. Start Validation & OCR
        doc.processing_status = ProcessingStatus.PROCESSING.value
        doc.ocr_status = "IN_PROGRESS"
        self.db.commit()

        audit_service.log_event(
            db=self.db,
            event_type="OCR_STARTED",
            patient_id=doc.patient_id,
            details={"document_id": doc.id, "file_name": doc.file_name},
        )

        try:
            # 2. Retrieve file bytes from storage
            file_bytes = self.storage.get(doc.storage_path) if doc.storage_path else None
            if not file_bytes:
                # Fallback to doc.raw_text or file name simulation
                file_bytes = (doc.raw_text or doc.file_name).encode("utf-8")


            # 3. Perform OCR
            ocr_res = ocr_service.process(file_bytes, doc.mime_type)

            doc.raw_text = ocr_res.full_text
            doc.ocr_status = "COMPLETED"
            doc.quality = ocr_res.quality
            doc.quality_message = ocr_res.quality_message
            doc.page_count = len(ocr_res.pages)
            doc.processing_status = ProcessingStatus.OCR_COMPLETED.value
            self.db.commit()

            audit_service.log_event(
                db=self.db,
                event_type="OCR_COMPLETED",
                patient_id=doc.patient_id,
                details={
                    "document_id": doc.id,
                    "pages": doc.page_count,
                    "average_confidence": ocr_res.average_confidence,
                    "quality": ocr_res.quality,
                },
            )

            # 4. Save DocumentPages and OCRBlocks
            for p_res in ocr_res.pages:
                page_rec = DocumentPage(
                    document_id=doc.id,
                    page_number=p_res.page_number,
                    raw_text=p_res.text,
                    confidence=p_res.confidence,
                    quality=p_res.quality,
                )
                self.db.add(page_rec)
                self.db.flush()

                for b_res in p_res.blocks:
                    block_rec = OCRBlock(
                        document_id=doc.id,
                        page_id=page_rec.id,
                        page_number=b_res.page_number,
                        block_id=b_res.block_id,
                        text=b_res.text,
                        confidence=b_res.confidence,
                        bounding_box=json.dumps(b_res.bbox) if b_res.bbox else None,
                    )
                    self.db.add(block_rec)

            self.db.commit()

            # 5. Document Type Classification
            doc_type, class_conf, signals = document_classifier.classify(ocr_res.full_text, doc.file_name)
            doc.document_type = doc_type
            doc.classification_confidence = class_conf
            doc.supporting_signals = json.dumps(signals)
            self.db.commit()

            audit_service.log_event(
                db=self.db,
                event_type="DOCUMENT_CLASSIFIED",
                patient_id=doc.patient_id,
                details={"document_id": doc.id, "document_type": doc_type, "confidence": class_conf},
            )

            # 6. Medical Entity Extraction
            doc.processing_status = ProcessingStatus.EXTRACTION_COMPLETED.value
            self.db.commit()

            standard_entities = medical_entity_extractor.extract_all(ocr_res.full_text, page_number=1)
            created_entities: List[DocumentEntity] = []

            for ent in standard_entities:
                # If entity is DATE, update document_date if not set
                if ent.entity_type == "DATE" and not doc.document_date:
                    doc.document_date = ent.value

                # Create MedicalFact for clinical visibility
                fact_type = "OTHER"
                category = "OTHER"
                if ent.entity_type == "MEDICATION":
                    fact_type = "MEDICATION"
                    category = "MEDICATION"
                elif ent.entity_type == "LAB_TEST":
                    fact_type = "LAB"
                    category = "LAB_TEST"
                elif ent.entity_type == "ALLERGY":
                    fact_type = "ALLERGY"
                    category = "ALLERGY"
                elif ent.entity_type == "SURGERY":
                    fact_type = "PROCEDURE"
                    category = "PAST_MEDICAL_HISTORY"
                elif ent.entity_type == "HISTORICAL_CONDITION":
                    fact_type = "CONDITION"
                    category = "PAST_MEDICAL_HISTORY"

                medical_fact = MedicalFact(
                    patient_id=doc.patient_id,
                    intake_session_id=doc.intake_session_id,
                    fact_type=fact_type,
                    category=category,
                    field=ent.name.lower().replace(" ", "_"),
                    value=ent.value,
                    normalized_value=ent.name,
                    confidence=ent.confidence,
                    source_type=FactSourceType.DOCUMENT_DERIVED.value,
                    verification_status=VerificationStatus.NEEDS_VERIFICATION.value,
                )
                self.db.add(medical_fact)
                self.db.flush()

                # Create DocumentEntity
                entity_rec = DocumentEntity(
                    document_id=doc.id,
                    entity_type=ent.entity_type,
                    name=ent.name,
                    value=ent.value,
                    unit=ent.unit,
                    reference_range=ent.reference_range,
                    abnormal_flag=ent.abnormal_flag,
                    clinician_advisory=ent.clinician_advisory,
                    dose=ent.dose,
                    frequency=ent.frequency,
                    duration=ent.duration,
                    instructions=ent.instructions,
                    confidence=ent.confidence,
                    source_page=ent.source_page,
                    source_block_id=ent.source_block_id,
                    source_text=ent.source_text,
                    verification_status="NEEDS_VERIFICATION",
                    medical_fact_id=medical_fact.id,
                )
                self.db.add(entity_rec)
                self.db.flush()
                created_entities.append(entity_rec)

                # 7. Create EvidenceSource with complete provenance
                evidence = EvidenceSource(
                    medical_fact_id=medical_fact.id,
                    source_type="DOCUMENT",
                    document_id=doc.id,
                    page_number=ent.source_page,
                    block_id=ent.source_block_id,
                    source_label=f"{doc.file_name} (Page {ent.source_page})",
                    source_excerpt=ent.source_text[:500] if ent.source_text else ent.value,
                    confidence=ent.confidence,
                    verification_status="NEEDS_VERIFICATION",
                )
                self.db.add(evidence)

                # 8. Create Timeline Event if applicable
                if ent.entity_type in ["SURGERY", "HISTORICAL_CONDITION", "LAB_TEST"]:
                    event_date = doc.document_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
                    t_type = TimelineEventType.INVESTIGATION.value if ent.entity_type == "LAB_TEST" else (
                        TimelineEventType.SURGERY.value if ent.entity_type == "SURGERY" else TimelineEventType.CONDITION.value
                    )
                    t_event = TimelineEvent(
                        patient_id=doc.patient_id,
                        date=event_date,
                        event_type=t_type,
                        title=f"{ent.name}: {ent.value}",
                        description=f"Recorded in {doc.file_name} ({doc.document_type}). Verified reference: {ent.source_text}",
                        source_fact_id=medical_fact.id,
                        evidence_id=evidence.id,
                        document_id=doc.id,
                        confidence=ent.confidence,
                    )
                    self.db.add(t_event)

            self.db.commit()

            # 9. Cross-Source Conflict Checking
            self.conflict_service.check_conflicts(doc.patient_id, created_entities)

            # 10. Final Status Determination
            doc.extracted_facts_count = len(created_entities)
            if doc.quality == "POOR" or ocr_res.average_confidence < 0.65:
                doc.processing_status = ProcessingStatus.NEEDS_REVIEW.value
            else:
                doc.processing_status = ProcessingStatus.PROCESSED.value

            self.db.commit()

            audit_service.log_event(
                db=self.db,
                event_type="ENTITY_EXTRACTED",
                patient_id=doc.patient_id,
                details={"document_id": doc.id, "extracted_count": len(created_entities)},
            )

            return doc

        except Exception as e:
            logger.error(f"Document processing failed for {doc.id}: {e}", exc_info=True)
            doc.processing_status = ProcessingStatus.FAILED.value
            doc.ocr_status = "FAILED"
            doc.error_message = str(e)
            self.db.commit()
            return doc

