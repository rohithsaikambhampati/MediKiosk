"""
Document Conflict Detection Service for MediKiosk.

Compares facts extracted from uploaded documents against existing patient facts
(e.g., from voice/kiosk intake conversations or previous records).

Examples:
- Patient conversation: "No known drug allergies" vs Document: "Allergy: Penicillin"
- Patient conversation: "Metformin 500mg" vs Document: "Metformin 850mg"

Status: CONFLICTED
Never auto-decides; queues for clinician review.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.medical_fact import MedicalFact, VerificationStatus
from app.models.document import DocumentEntity
from app.services.audit_service import audit_service


class DocumentConflictService:
    def __init__(self, db: Session):
        self.db = db

    def check_conflicts(self, patient_id: str, document_entities: List[DocumentEntity]) -> List[Dict[str, Any]]:
        """
        Cross-checks newly extracted document entities against existing MedicalFact records.
        Marks conflicting facts as CONFLICTED.
        """
        conflicts_found: List[Dict[str, Any]] = []

        existing_facts = self.db.query(MedicalFact).filter(
            MedicalFact.patient_id == patient_id
        ).all()

        for ent in document_entities:
            # 1. Check Allergy Conflicts
            if ent.entity_type == "ALLERGY":
                allergen = ent.name.lower()
                for fact in existing_facts:
                    fact_val = str(fact.value).lower()
                    fact_norm = str(fact.normalized_value).lower() if fact.normalized_value else ""

                    # If patient previously said "no allergies" or "no known drug allergies"
                    if fact.category == "ALLERGY" or "allerg" in fact_val:
                        if any(neg in fact_val for neg in ["no allergy", "no known", "none", "no drug", "nil"]):
                            # Direct contradiction
                            fact.conflict_status = "CONFLICTED"
                            fact.verification_status = VerificationStatus.CONFLICTED.value
                            self.db.add(fact)

                            conflict_item = {
                                "type": "ALLERGY_CONTRADICTION",
                                "title": f"Contradiction: {ent.name} Allergy",
                                "source_a": "Patient Kiosk Conversation (No known allergies)",
                                "source_b": f"Document Record ({ent.source_text})",
                                "fact_id": fact.id,
                                "entity_id": ent.id,
                                "status": "CONFLICTED",
                                "requires_doctor_decision": True,
                            }
                            conflicts_found.append(conflict_item)

                            audit_service.log_event(
                                db=self.db,
                                event_type="FACT_CONFLICT_DETECTED",
                                patient_id=patient_id,
                                details={
                                    "conflict_type": "ALLERGY_CONTRADICTION",
                                    "document_entity_id": ent.id,
                                    "fact_id": fact.id,
                                    "allergen": ent.name,
                                },
                            )

            # 2. Check Medication Dose / Frequency Discrepancies
            elif ent.entity_type == "MEDICATION":
                med_name = ent.name.lower()
                for fact in existing_facts:
                    if fact.fact_type == "MEDICATION" or fact.category == "MEDICATION":
                        fact_norm = str(fact.normalized_value).lower() if fact.normalized_value else str(fact.value).lower()
                        if med_name in fact_norm:
                            # Same medication! Check if dose differs
                            if ent.dose and ent.dose.lower() not in fact.value.lower():
                                fact.conflict_status = "CONFLICTED"
                                self.db.add(fact)

                                conflict_item = {
                                    "type": "MEDICATION_DOSAGE_DISCREPANCY",
                                    "title": f"Dose Discrepancy: {ent.name}",
                                    "source_a": f"Patient Conversation ({fact.value})",
                                    "source_b": f"Document Prescription ({ent.value})",
                                    "fact_id": fact.id,
                                    "entity_id": ent.id,
                                    "status": "CONFLICTED",
                                    "requires_doctor_decision": True,
                                }
                                conflicts_found.append(conflict_item)

                                audit_service.log_event(
                                    db=self.db,
                                    event_type="FACT_CONFLICT_DETECTED",
                                    patient_id=patient_id,
                                    details={
                                        "conflict_type": "MEDICATION_DOSAGE_DISCREPANCY",
                                        "medication": ent.name,
                                        "fact_id": fact.id,
                                    },
                                )

        if conflicts_found:
            self.db.commit()

        return conflicts_found

