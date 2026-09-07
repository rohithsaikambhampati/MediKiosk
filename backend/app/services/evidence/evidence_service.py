"""
Evidence Linking Service for MediKiosk.

Core differentiator: Every structured clinical fact must maintain provenance links
back to the exact conversation turn, patient verbatim statement, or document excerpt.
"""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.evidence import EvidenceSource
from app.models.medical_fact import MedicalFact


class EvidenceService:
    def __init__(self, db: Session):
        self.db = db

    def link_conversation_evidence(
        self,
        medical_fact: MedicalFact,
        conversation_message_id: str,
        source_excerpt: str,
        confidence: float = 0.95,
        turn_number: Optional[int] = None,
    ) -> EvidenceSource:
        """Links a structured fact to the specific conversation dialogue message."""
        label = f"Kiosk Voice/Text Intake (Message #{turn_number})" if turn_number else "Kiosk Dialogue Intake"
        evidence = EvidenceSource(
            medical_fact_id=medical_fact.id,
            source_type="CONVERSATION",
            conversation_message_id=conversation_message_id,
            source_label=label,
            source_excerpt=source_excerpt[:500] if source_excerpt else None,
            confidence=confidence,
        )
        self.db.add(evidence)
        self.db.commit()
        self.db.refresh(evidence)
        return evidence

    def link_document_evidence(
        self,
        medical_fact: MedicalFact,
        document_id: str,
        source_label: str,
        source_excerpt: str,
        confidence: float = 0.95,
        page_number: Optional[int] = 1,
        block_id: Optional[str] = None,
        bounding_box: Optional[str] = None,
    ) -> EvidenceSource:
        """Links a structured fact to an uploaded medical document source with page and block provenance."""
        evidence = EvidenceSource(
            medical_fact_id=medical_fact.id,
            source_type="DOCUMENT",
            document_id=document_id,
            page_number=page_number,
            block_id=block_id,
            bounding_box=bounding_box,
            source_label=source_label,
            source_excerpt=source_excerpt[:500] if source_excerpt else None,
            confidence=confidence,
            verification_status="NEEDS_VERIFICATION",
        )
        self.db.add(evidence)
        self.db.commit()
        self.db.refresh(evidence)
        return evidence

