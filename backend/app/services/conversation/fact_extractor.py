"""
Structured Fact Extractor, Deduplication, and Conflict Detection for MediKiosk.

Adheres strictly to the structured fact format:
- Category, Field, Value, Normalized Value, Confidence, Source Reference, Verification Status.
- Handles unknown responses explicitly without converting to False.
- Prevents duplicate facts through semantic entity normalization.
- Detects contradictions and flags them as CONFLICTED for doctor review.
"""

from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.medical_fact import MedicalFact, VerificationStatus, FactSourceType
from app.services.llm.llm_service import llm_service
from app.services.conversation.clinical_ontology import normalize_concept, OntologyDomain
import uuid


class FactExtractor:
    def __init__(self, db: Session):
        self.db = db

    async def extract_and_persist_facts(
        self,
        patient_id: str,
        intake_id: str,
        conversation_message_id: str,
        patient_text: str,
        topic: str,
        existing_facts: List[MedicalFact],
        language: str = "en",
    ) -> Tuple[List[MedicalFact], List[Dict[str, Any]]]:
        """
        Extracts candidate facts from patient input, runs deduplication and conflict detection,
        and saves new or updated facts to the database.
        Returns: (persisted_facts, detected_conflicts)
        """
        candidate_facts = await llm_service.extract_candidate_facts(
            text=patient_text,
            topic=topic,
            context={"topic": topic, "existing_count": len(existing_facts)},
            language=language,
        )

        persisted: List[MedicalFact] = []
        conflicts: List[Dict[str, Any]] = []

        for candidate in candidate_facts:
            cat = candidate.get("category", OntologyDomain.SYMPTOM.value)
            fld = candidate.get("field", topic)
            val = candidate.get("value")
            norm_val = candidate.get("normalized_value") or normalize_concept(str(val or ""))
            conf = candidate.get("confidence", 0.95)
            status = candidate.get("verification_status", VerificationStatus.UNVERIFIED.value)
            patient_resp = candidate.get("patient_response", patient_text)

            # 1. Duplicate Detection & Entity Matching (same concept in same category)
            existing_match = next(
                (
                    f for f in existing_facts
                    if (f.category == cat or f.fact_type == cat) and (f.normalized_value == norm_val or (f.field == fld and f.normalized_value == norm_val))
                ),
                None
            )
            if existing_match:
                # Update existing fact confidence if higher, refresh timestamp
                if conf > existing_match.confidence:
                    existing_match.confidence = conf
                existing_match.patient_response = patient_resp
                self.db.add(existing_match)
                persisted.append(existing_match)
                continue

            # 2. Conflict Detection (Contradictions)
            conflict_detected = self._detect_conflict(cat, fld, norm_val, existing_facts)
            conflict_status = "NONE"
            if conflict_detected:
                conflicting_fact, reason = conflict_detected
                # Mark both as CONFLICTED
                status = VerificationStatus.CONFLICTED.value
                conflict_status = "CONFLICTED"
                conflicting_fact.verification_status = VerificationStatus.CONFLICTED.value
                conflicting_fact.conflict_status = "CONFLICTED"
                self.db.add(conflicting_fact)

                conflicts.append({
                    "conflict_id": f"conf_{uuid.uuid4().hex[:8]}",
                    "title": f"Contradiction in {fld.replace('_', ' ').title()}",
                    "description": reason,
                    "itemA": f"{conflicting_fact.field}: {conflicting_fact.normalized_value}",
                    "itemB": f"{fld}: {norm_val}",
                    "severity": "medium",
                    "requires_doctor_decision": True,
                })

            # 3. Create and persist new MedicalFact
            fact_type_map = {
                OntologyDomain.SYMPTOM.value: "SYMPTOM",
                OntologyDomain.CHIEF_COMPLAINT.value: "SYMPTOM",
                OntologyDomain.SYMPTOM_ONSET.value: "SYMPTOM",
                OntologyDomain.SYMPTOM_DURATION.value: "SYMPTOM",
                OntologyDomain.SYMPTOM_LOCATION.value: "SYMPTOM",
                OntologyDomain.SYMPTOM_SEVERITY.value: "SYMPTOM",
                OntologyDomain.ASSOCIATED_SYMPTOMS.value: "SYMPTOM",
                OntologyDomain.MEDICAL_HISTORY.value: "CONDITION",
                OntologyDomain.MEDICATION.value: "MEDICATION",
                OntologyDomain.ALLERGY.value: "ALLERGY",
                OntologyDomain.UNKNOWN_INFORMATION.value: "OTHER",
            }
            mapped_type = fact_type_map.get(cat, "OTHER")

            new_fact = MedicalFact(
                patient_id=patient_id,
                intake_session_id=intake_id,
                fact_type=mapped_type,
                category=cat,
                field=fld,
                value=str(val) if val is not None else "Unknown",
                normalized_value=norm_val,
                confidence=conf,
                source_type=FactSourceType.PATIENT_REPORTED.value if status == "PATIENT_CONFIRMED" else FactSourceType.AI_EXTRACTED.value,
                verification_status=status,
                conflict_status=conflict_status,
                patient_response=patient_resp,
            )
            self.db.add(new_fact)
            self.db.commit()
            self.db.refresh(new_fact)
            existing_facts.append(new_fact)
            persisted.append(new_fact)

        return persisted, conflicts

    def _detect_conflict(
        self,
        category: str,
        field: str,
        normalized_value: str,
        existing_facts: List[MedicalFact],
    ) -> Optional[Tuple[MedicalFact, str]]:
        """
        Identifies contradictions between candidate fact and already collected facts.
        Example: Reporting specific drug allergy vs previously reporting "No known allergies".
        """
        for fact in existing_facts:
            # Conflict in Allergies
            is_cand_allergy = category == OntologyDomain.ALLERGY.value or field in ["allergies", "allergen"] or "allergy" in normalized_value.lower()
            is_fact_allergy = fact.category == OntologyDomain.ALLERGY.value or fact.fact_type == "ALLERGY" or (fact.field and fact.field in ["allergies", "allergen"]) or "allergy" in str(fact.normalized_value).lower()
            if is_cand_allergy and is_fact_allergy:
                is_curr_none = "no known" in normalized_value.lower() or "none" in normalized_value.lower()
                is_prev_none = "no known" in str(fact.normalized_value).lower() or "none" in str(fact.normalized_value).lower()
                if (is_curr_none and not is_prev_none) or (is_prev_none and not is_curr_none):
                    return fact, f"Patient reported '{fact.normalized_value}' and later reported '{normalized_value}'."

            # Conflict in Medical History (e.g. Denying history after reporting condition)
            is_cand_hist = category == OntologyDomain.MEDICAL_HISTORY.value or field in ["condition", "medical_history"]
            is_fact_hist = fact.category == OntologyDomain.MEDICAL_HISTORY.value or fact.fact_type == "CONDITION" or (fact.field and fact.field in ["condition", "medical_history"])
            if is_cand_hist and is_fact_hist:
                is_curr_no_hist = "no significant" in normalized_value.lower()
                is_prev_no_hist = "no significant" in str(fact.normalized_value).lower()
                if (is_curr_no_hist and not is_prev_no_hist) or (is_prev_no_hist and not is_curr_no_hist):
                    return fact, f"Patient reported '{fact.normalized_value}' and later reported '{normalized_value}'."

        return None
