"""
Patient Story Generator for MediKiosk.

Aggregates structured medical facts, evidence links, clinical timeline, medications,
allergies, detected safety signals, and conflicts into a comprehensive, clinician-ready story.
Conforms directly with the frontend Doctor Workspace Patient Story schema.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.medical_fact import MedicalFact, VerificationStatus
from app.models.document import MedicalDocument, DocumentEntity
from app.models.timeline import TimelineEvent
from app.models.risk import RiskAssessment
from app.services.llm.llm_service import llm_service


class PatientStoryGenerator:
    def __init__(self, db: Session):
        self.db = db

    async def generate_story(self, patient_id: str, intake_id: Optional[str] = None) -> Dict[str, Any]:
        """Assembles a full structured Patient Story for clinician review."""
        patient = self.db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise ValueError(f"Patient {patient_id} not found")

        # Fetch facts
        query = self.db.query(MedicalFact).filter(MedicalFact.patient_id == patient_id)
        if intake_id:
            query = query.filter(MedicalFact.intake_session_id == intake_id)
        facts = query.all()

        # Fetch documents
        docs = self.db.query(MedicalDocument).filter(MedicalDocument.patient_id == patient_id).all()

        # Fetch timeline
        timeline = self.db.query(TimelineEvent).filter(TimelineEvent.patient_id == patient_id).order_by(TimelineEvent.date).all()

        # Fetch risk assessments
        risks = self.db.query(RiskAssessment).filter(RiskAssessment.patient_id == patient_id).all()

        # Extract Chief Complaint & Core Fields
        chief_complaint = "General medical checkup"
        onset_duration = "Not reported"
        severity_score = "Unrated"

        # Fetch document entities for abnormal labs and detailed entities
        doc_ids = [d.id for d in docs]
        doc_entities = (
            self.db.query(DocumentEntity)
            .filter(DocumentEntity.document_id.in_(doc_ids))
            .all()
            if doc_ids
            else []
        )

        # Collect Abnormal Labs
        abnormal_labs_list = []
        for de in doc_entities:
            if de.entity_type == "LAB_TEST":
                abnormal_labs_list.append({
                    "id": de.id,
                    "testName": de.name,
                    "value": de.value,
                    "unit": de.unit or "",
                    "referenceRange": de.reference_range or "Not displayed",
                    "abnormalFlag": de.abnormal_flag,
                    "clinicianAdvisory": de.clinician_advisory or (
                        "Lab value outside displayed reference range — clinician review recommended."
                        if de.abnormal_flag in ["ABNORMAL_LOW", "ABNORMAL_HIGH"]
                        else "Value within reference range" if de.abnormal_flag == "NORMAL"
                        else "Reference range not available in document"
                    ),
                    "confidence": "high" if de.confidence >= 0.9 else "medium",
                    "sourceText": de.source_text,
                    "sourcePage": de.source_page,
                    "documentId": de.document_id,
                })

        # Process facts and merge medications
        symptoms_list = []
        medications_dict = {}
        allergies_list = []
        conflicts_list = []

        total_facts_count = len(facts)
        verified_facts_count = 0
        unverified_facts_count = 0

        for f in facts:
            if f.verification_status == VerificationStatus.DOCTOR_VERIFIED.value:
                verified_facts_count += 1
            else:
                unverified_facts_count += 1

            evidence_items = []
            for ev in f.evidence_sources:
                evidence_items.append({
                    "id": ev.id,
                    "sourceType": ev.source_type.lower() if ev.source_type else "conversation",
                    "sourceLabel": ev.source_label,
                    "sourceExcerpt": ev.source_excerpt,
                    "pageNumber": ev.page_number or 1,
                    "confidence": ev.confidence,
                })

            fact_dict = {
                "id": f.id,
                "category": f.category or f.fact_type,
                "field": f.field,
                "fact": f.value,
                "value": f.value,
                "normalizedValue": f.normalized_value or f.value,
                "confidence": "high" if f.confidence >= 0.9 else "medium",
                "verificationStatus": f.verification_status.lower().replace("_", "-"),
                "sourceType": f.source_type,
                "evidenceSources": evidence_items,
            }

            if f.field == "chief_complaint" or f.category == "CHIEF_COMPLAINT":
                chief_complaint = f.normalized_value or f.value
            elif f.field == "onset" or f.field == "duration":
                onset_duration = f.normalized_value or f.value
            elif f.field == "severity":
                severity_score = f.value

            if f.fact_type == "SYMPTOM" or f.category in ["SYMPTOM", "CHIEF_COMPLAINT", "ASSOCIATED_SYMPTOMS"]:
                symptoms_list.append(fact_dict)
            elif f.fact_type == "MEDICATION" or f.category == "MEDICATION":
                med_key = (f.normalized_value or f.value).lower().strip()
                if med_key not in medications_dict:
                    medications_dict[med_key] = {
                        "id": f.id,
                        "name": f.normalized_value or f.value,
                        "dosage": "As prescribed",
                        "frequency": "Daily",
                        "status": "active",
                        "verificationStatus": f.verification_status.lower().replace("_", "-"),
                        "confidence": "high" if f.confidence >= 0.9 else "medium",
                        "sourceText": f.patient_response or f.value,
                        "evidenceSources": list(evidence_items),
                    }
                else:
                    # Merge evidence sources
                    existing_sources = medications_dict[med_key]["evidenceSources"]
                    for ev in evidence_items:
                        if not any(e["id"] == ev["id"] for e in existing_sources):
                            existing_sources.append(ev)

            elif f.fact_type == "ALLERGY" or f.category == "ALLERGY":
                allergies_list.append({
                    "id": f.id,
                    "allergen": f.normalized_value or f.value,
                    "reaction": "Reported drug sensitivity",
                    "severity": "high" if "penicillin" in str(f.value).lower() else "medium",
                    "verificationStatus": f.verification_status.lower().replace("_", "-"),
                    "confidence": "high" if f.confidence >= 0.9 else "medium",
                    "evidenceSources": evidence_items,
                })

            if f.conflict_status == "CONFLICTED" or f.verification_status == VerificationStatus.CONFLICTED.value:
                conflicts_list.append({
                    "id": f"conf_{f.id[:8]}",
                    "title": f"Contradiction in {f.field or f.fact_type}",
                    "description": f"Conflicted statement regarding {f.normalized_value or f.value}",
                    "itemA": f.value,
                    "itemB": "Contradictory clinical record",
                    "severity": "medium",
                    "requiresDoctorDecision": True,
                })

        # Enrich merged medications with DocumentEntity details if available
        for de in doc_entities:
            if de.entity_type == "MEDICATION":
                med_key = de.name.lower().strip()
                if med_key in medications_dict:
                    if de.dose:
                        medications_dict[med_key]["dosage"] = de.dose
                    if de.frequency:
                        medications_dict[med_key]["frequency"] = de.frequency
                else:
                    medications_dict[med_key] = {
                        "id": f"med_doc_{de.id[:8]}",
                        "name": de.name,
                        "dosage": de.dose or "As recorded",
                        "frequency": de.frequency or "Once daily",
                        "status": "active",
                        "verificationStatus": "needs-verification",
                        "confidence": "high" if de.confidence >= 0.9 else "medium",
                        "sourceText": de.source_text,
                        "evidenceSources": [
                            {
                                "id": f"ev_de_{de.id[:8]}",
                                "sourceType": "document",
                                "sourceLabel": f"Document (Page {de.source_page})",
                                "sourceExcerpt": de.source_text,
                                "pageNumber": de.source_page,
                                "confidence": de.confidence,
                            }
                        ],
                    }

        medications_list = list(medications_dict.values())

        # Generate narrative clinical summary
        facts_for_summary = [
            {"category": f.category, "field": f.field, "value": f.value, "normalized_value": f.normalized_value}
            for f in facts
        ]
        summary_paragraph = await llm_service.summarize_patient_statement(facts_for_summary, language=patient.preferred_language or "en")

        return {
            "patientId": patient.id,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "summaryParagraph": summary_paragraph,
            "chiefComplaint": chief_complaint,
            "onsetAndDuration": onset_duration,
            "severityScore": severity_score,
            "reportedSymptoms": symptoms_list,
            "currentMedications": medications_list,
            "allergies": allergies_list,
            "abnormalLabs": abnormal_labs_list,
            "medicalTimeline": [
                {
                    "id": t.id,
                    "date": t.date,
                    "title": t.title,
                    "description": t.description,
                    "category": t.event_type.lower() if t.event_type else "condition",
                    "source": "Clinical Records",
                }
                for t in timeline
            ],
            "documents": [
                {
                    "id": d.id,
                    "fileName": d.file_name,
                    "fileType": d.document_type,
                    "uploadDate": d.created_at.strftime("%Y-%m-%d"),
                    "status": d.processing_status.lower() if d.processing_status else "processed",
                    "ocrStatus": d.ocr_status,
                    "quality": d.quality or "GOOD",
                    "qualityMessage": d.quality_message,
                    "extractedFactsCount": d.extracted_facts_count,
                    "pageCount": d.page_count,
                }
                for d in docs
            ],
            "detectedConflicts": conflicts_list,
            "potentialRedFlags": [
                {
                    "priority": r.priority,
                    "reason": r.reason,
                    "source": r.source,
                }
                for r in risks
            ],
            "overallAiConfidence": "high",
            "verificationProgress": {
                "totalFacts": total_facts_count,
                "verifiedFacts": verified_facts_count,
                "unverifiedFacts": unverified_facts_count,
            },
        }

