"""
FHIR R4 Mapper for MediKiosk.

Converts internal clinical models, structured medical facts, document entities,
and AI-assisted patient stories into standard-compliant FHIR R4 resources
with full provenance preservation.
"""

from typing import Dict, List, Any, Optional
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.intake import IntakeSession
from app.models.medical_fact import MedicalFact, FactType, VerificationStatus
from app.models.document import MedicalDocument, DocumentEntity
from app.models.timeline import TimelineEvent
from app.models.risk import RiskAssessment
from app.models.consent import Consent, ConsentStatus
from app.services.patient_story.story_generator import PatientStoryGenerator


class FHIRMapper:
    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def _provenance_extension(
        self,
        source_type: str,
        source_id: Optional[str] = None,
        page: Optional[int] = None,
        block_id: Optional[str] = None,
        verbatim_text: Optional[str] = None,
        verification_status: Optional[str] = None,
        confidence: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        """Constructs FHIR extension capturing granular internal provenance."""
        ext_fields = [
            {"url": "sourceType", "valueString": source_type},
        ]
        if source_id:
            ext_fields.append({"url": "sourceId", "valueString": source_id})
        if page is not None:
            ext_fields.append({"url": "pageNumber", "valueInteger": page})
        if block_id:
            ext_fields.append({"url": "blockId", "valueString": block_id})
        if verbatim_text:
            ext_fields.append({"url": "verbatimSnippet", "valueString": verbatim_text})
        if verification_status:
            ext_fields.append({"url": "verificationStatus", "valueString": verification_status})
        if confidence is not None:
            ext_fields.append({"url": "confidenceScore", "valueDecimal": round(confidence, 2)})

        return [{
            "url": "https://medikiosk.health/fhir/StructureDefinition/internal-provenance",
            "extension": ext_fields,
        }]

    def map_patient(self, patient: Patient) -> Dict[str, Any]:
        """Maps Patient entity to FHIR Patient resource without fabricating missing fields."""
        resource: Dict[str, Any] = {
            "resourceType": "Patient",
            "id": f"pat-{patient.id}",
            "identifier": [
                {
                    "system": "https://medikiosk.health/mrn",
                    "value": patient.hospital_id or patient.id,
                }
            ],
            "name": [
                {
                    "use": "official",
                    "text": patient.name,
                }
            ],
        }

        if patient.gender:
            g = patient.gender.lower()
            resource["gender"] = g if g in ["male", "female", "other"] else "unknown"
        else:
            resource["gender"] = "unknown"

        if patient.phone:
            resource["telecom"] = [
                {
                    "system": "phone",
                    "value": patient.phone,
                    "use": "mobile",
                }
            ]

        if patient.preferred_language:
            resource["communication"] = [
                {
                    "language": {
                        "coding": [
                            {
                                "system": "urn:ietf:bcp:47",
                                "code": patient.preferred_language,
                            }
                        ]
                    },
                    "preferred": True,
                }
            ]

        return resource

    def map_encounter(self, intake_session: Optional[IntakeSession], patient: Patient) -> Dict[str, Any]:
        """Maps IntakeSession to FHIR Encounter resource."""
        enc_id = intake_session.id if intake_session else str(uuid.uuid4())
        started_at = intake_session.started_at.isoformat() if intake_session and intake_session.started_at else datetime.now(timezone.utc).isoformat()

        return {
            "resourceType": "Encounter",
            "id": f"enc-{enc_id}",
            "status": "in-progress" if not (intake_session and intake_session.completed_at) else "finished",
            "class": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                "code": "AMB",
                "display": "ambulatory",
            },
            "subject": {
                "reference": f"Patient/pat-{patient.id}",
                "display": patient.name,
            },
            "period": {
                "start": started_at,
                **({"end": intake_session.completed_at.isoformat()} if intake_session and intake_session.completed_at else {}),
            },
        }

    def map_condition(self, patient: Patient, fact: MedicalFact) -> Dict[str, Any]:
        """Maps clinical symptoms and conditions to FHIR Condition resources."""
        is_verified = fact.verification_status == VerificationStatus.DOCTOR_VERIFIED.value

        evidence = fact.evidence_sources[0] if fact.evidence_sources else None
        prov = self._provenance_extension(
            source_type=fact.source_type,
            source_id=evidence.document_id if evidence and evidence.document_id else (evidence.conversation_message_id if evidence else None),
            page=evidence.page_number if evidence else None,
            block_id=evidence.block_id if evidence else None,
            verbatim_text=evidence.source_excerpt if evidence else fact.value,
            verification_status=fact.verification_status,
            confidence=fact.confidence,
        )

        return {
            "resourceType": "Condition",
            "id": f"cond-{fact.id}",
            "clinicalStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                        "code": "active",
                    }
                ]
            },
            "verificationStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                        "code": "confirmed" if is_verified else "provisional",
                    }
                ]
            },
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                            "code": "problem-list-item" if fact.fact_type == FactType.CONDITION.value else "encounter-diagnosis",
                            "display": fact.category or "Clinical Symptom / Finding",
                        }
                    ]
                }
            ],
            "code": {
                "text": fact.normalized_value or fact.value,
            },
            "subject": {
                "reference": f"Patient/pat-{patient.id}",
                "display": patient.name,
            },
            "note": [
                {
                    "text": f"Extracted via MediKiosk AI Intake. Verification status: {fact.verification_status}.",
                }
            ],
            "extension": prov,
        }

    def map_medication_statement(self, patient: Patient, fact: Optional[MedicalFact], med_entity: Optional[DocumentEntity] = None) -> Dict[str, Any]:
        """Maps medication to FHIR MedicationStatement without fabricating missing doses/frequencies."""
        med_id = fact.id if fact else (med_entity.id if med_entity else str(uuid.uuid4()))
        med_name = fact.normalized_value or fact.value if fact else (med_entity.name if med_entity else "Unknown Medication")

        # Determine dosage from available details
        dosage_text = None
        if med_entity and med_entity.value:
            dosage_text = f"{med_entity.value} {med_entity.unit or ''}".strip()

        source_type = fact.source_type if fact else "DOCUMENT_DERIVED"
        prov = self._provenance_extension(
            source_type=source_type,
            source_id=med_entity.document_id if med_entity else None,
            page=med_entity.source_page if med_entity else None,
            block_id=med_entity.source_block_id if med_entity else None,
            verbatim_text=med_entity.source_text if med_entity else (fact.value if fact else None),
            verification_status=fact.verification_status if fact else "NEEDS_VERIFICATION",
            confidence=fact.confidence if fact else (med_entity.confidence if med_entity else 0.9),
        )

        res: Dict[str, Any] = {
            "resourceType": "MedicationStatement",
            "id": f"med-{med_id}",
            "status": "active",
            "medicationCodeableConcept": {
                "text": med_name,
            },
            "subject": {
                "reference": f"Patient/pat-{patient.id}",
                "display": patient.name,
            },
            "extension": prov,
        }

        if dosage_text:
            res["dosage"] = [{"text": dosage_text}]

        return res

    def map_allergy_intolerance(self, patient: Patient, fact: Optional[MedicalFact], allergy_entity: Optional[DocumentEntity] = None) -> Dict[str, Any]:
        """Maps allergy to FHIR AllergyIntolerance preserving provenance and verification status."""
        alg_id = fact.id if fact else (allergy_entity.id if allergy_entity else str(uuid.uuid4()))
        substance = fact.normalized_value or fact.value if fact else (allergy_entity.name if allergy_entity else "Unknown Allergen")

        ver_status = fact.verification_status if fact else "NEEDS_VERIFICATION"
        source_type = fact.source_type if fact else "DOCUMENT_DERIVED"

        prov = self._provenance_extension(
            source_type=source_type,
            source_id=allergy_entity.document_id if allergy_entity else None,
            page=allergy_entity.source_page if allergy_entity else None,
            block_id=allergy_entity.source_block_id if allergy_entity else None,
            verbatim_text=allergy_entity.source_text if allergy_entity else (fact.value if fact else None),
            verification_status=ver_status,
            confidence=fact.confidence if fact else 0.95,
        )

        return {
            "resourceType": "AllergyIntolerance",
            "id": f"alg-{alg_id}",
            "clinicalStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                        "code": "active",
                    }
                ]
            },
            "verificationStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                        "code": "confirmed" if ver_status == VerificationStatus.DOCTOR_VERIFIED.value else "unconfirmed",
                    }
                ]
            },
            "code": {
                "text": substance,
            },
            "patient": {
                "reference": f"Patient/pat-{patient.id}",
                "display": patient.name,
            },
            "note": [
                {
                    "text": f"Source: {source_type}. Status: {ver_status}.",
                }
            ],
            "extension": prov,
        }

    def map_observation(self, patient: Patient, lab_entity: DocumentEntity) -> Dict[str, Any]:
        """
        Maps laboratory test entity to FHIR Observation.
        Strict rule: Reference range comes ONLY from uploaded document; never invented.
        """
        obs_id = f"obs-{lab_entity.id}"

        res: Dict[str, Any] = {
            "resourceType": "Observation",
            "id": obs_id,
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "laboratory",
                            "display": "Laboratory",
                        }
                    ]
                }
            ],
            "code": {
                "text": lab_entity.name,
            },
            "subject": {
                "reference": f"Patient/pat-{patient.id}",
                "display": patient.name,
            },
            "effectiveDateTime": datetime.now(timezone.utc).isoformat(),
        }

        # Parse numeric value if available
        try:
            val_num = float(lab_entity.value)
            res["valueQuantity"] = {
                "value": val_num,
                "unit": lab_entity.unit or "",
            }
        except (ValueError, TypeError):
            res["valueString"] = str(lab_entity.value)

        # Reference range: strictly from document or marked as unavailable
        if lab_entity.reference_range:
            res["referenceRange"] = [
                {
                    "text": lab_entity.reference_range,
                }
            ]

        # Interpretation flag if abnormal
        if lab_entity.abnormal_flag == "ABNORMAL_HIGH":
            res["interpretation"] = [{
                "coding": [{"system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", "code": "H", "display": "High"}],
                "text": "Lab value outside displayed reference range — clinician review recommended.",
            }]
        elif lab_entity.abnormal_flag == "ABNORMAL_LOW":
            res["interpretation"] = [{
                "coding": [{"system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", "code": "L", "display": "Low"}],
                "text": "Lab value outside displayed reference range — clinician review recommended.",
            }]

        prov = self._provenance_extension(
            source_type="DOCUMENT_DERIVED",
            source_id=lab_entity.document_id,
            page=lab_entity.source_page,
            block_id=lab_entity.source_block_id,
            verbatim_text=lab_entity.source_text,
            verification_status="AI_EXTRACTED",
            confidence=lab_entity.confidence,
        )
        res["extension"] = prov

        return res

    def map_document_reference(self, patient: Patient, doc: MedicalDocument) -> Dict[str, Any]:
        """Maps MedicalDocument to FHIR DocumentReference with secure access URI."""
        return {
            "resourceType": "DocumentReference",
            "id": f"docref-{doc.id}",
            "status": "current",
            "docStatus": "preliminary",
            "type": {
                "text": doc.document_type,
            },
            "subject": {
                "reference": f"Patient/pat-{patient.id}",
                "display": patient.name,
            },
            "date": doc.created_at.isoformat() if doc.created_at else datetime.now(timezone.utc).isoformat(),
            "description": doc.file_name,
            "content": [
                {
                    "attachment": {
                        "contentType": doc.mime_type or "application/pdf",
                        "url": f"/api/v1/documents/{doc.id}/file",
                        "title": doc.file_name,
                        "size": doc.file_size_bytes or 0,
                    }
                }
            ],
        }

    def map_consent(self, patient: Patient, consent: Consent) -> Dict[str, Any]:
        """Maps Consent entity to FHIR Consent resource."""
        import json
        scopes = json.loads(consent.scope) if consent.scope else []

        return {
            "resourceType": "Consent",
            "id": f"consent-{consent.id}",
            "status": "active" if consent.status == ConsentStatus.GRANTED.value else "inactive",
            "scope": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/consentscope",
                        "code": "patient-privacy",
                    }
                ],
                "text": ", ".join(scopes),
            },
            "category": [
                {
                    "text": consent.purpose,
                }
            ],
            "patient": {
                "reference": f"Patient/pat-{patient.id}",
                "display": patient.name,
            },
            "dateTime": consent.granted_at.isoformat() if consent.granted_at else datetime.now(timezone.utc).isoformat(),
            "policy": [
                {
                    "uri": f"https://medikiosk.health/consent-policy/{consent.consent_text_version}",
                }
            ],
        }

    def map_composition(self, patient: Patient, story: Dict[str, Any], intake_session: Optional[IntakeSession]) -> Dict[str, Any]:
        """
        Maps structured Patient Story to FHIR Composition.
        Clearly designated as 'AI-assisted patient intake summary', NEVER a final diagnosis.
        """
        enc_id = intake_session.id if intake_session else str(uuid.uuid4())

        sections = [
            {
                "title": "Clinical Decision Notice",
                "text": {
                    "status": "additional",
                    "div": "<div>AI collects, structures, and highlights. The clinician decides. This intake summary is not a doctor, does not prescribe, and does not provide final diagnoses.</div>",
                },
            },
            {
                "title": "Chief Complaint",
                "text": {"status": "generated", "div": f"<div>{story.get('chiefComplaint', 'Not reported')}</div>"},
            },
            {
                "title": "Onset and Duration",
                "text": {"status": "generated", "div": f"<div>{story.get('onsetAndDuration', 'Not reported')}</div>"},
            },
            {
                "title": "Synthesized Clinical Summary",
                "text": {"status": "generated", "div": f"<div>{story.get('summaryParagraph', '')}</div>"},
            },
        ]

        # Add potential clinical flags if any
        if story.get("redFlags"):
            rf_div = "<ul>" + "".join([f"<li>{rf.get('title', '')}</li>" for rf in story.get("redFlags", [])]) + "</ul>"
            sections.append({
                "title": "Potential Clinical Flags (Deterministic Safety Signals)",
                "text": {"status": "generated", "div": rf_div},
            })

        # Add conflicts if any
        if story.get("detectedConflicts"):
            cf_div = "<ul>" + "".join([f"<li>{cf.get('title', '')}: {cf.get('description', '')}</li>" for cf in story.get("detectedConflicts", [])]) + "</ul>"
            sections.append({
                "title": "Cross-Source Information Conflicts",
                "text": {"status": "generated", "div": cf_div},
            })

        return {
            "resourceType": "Composition",
            "id": f"comp-{enc_id}",
            "status": "preliminary",
            "type": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "34117-2",
                        "display": "History and physical note",
                    }
                ],
                "text": "AI-Assisted Patient Intake Summary (Pre-Consultation)",
            },
            "category": [
                {
                    "text": "Workflow Intake Summary",
                }
            ],
            "subject": {
                "reference": f"Patient/pat-{patient.id}",
                "display": patient.name,
            },
            "encounter": {
                "reference": f"Encounter/enc-{enc_id}",
            },
            "date": datetime.now(timezone.utc).isoformat(),
            "author": [
                {
                    "display": "MediKiosk AI Intake Engine (Rule & Structured Facts System)",
                }
            ],
            "title": "AI-Assisted Patient Intake Summary — Clinician Decision Required",
            "section": sections,
        }

    async def build_bundle(self, patient_id: str, intake_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Assembles a full collection FHIR Bundle for a patient / intake session.
        Gathers all resources, preserves provenance, and embeds standard demo metadata.
        """
        patient = self.db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise ValueError(f"Patient {patient_id} not found")

        intake_session = (
            self.db.query(IntakeSession).filter(IntakeSession.id == intake_id).first()
            if intake_id
            else self.db.query(IntakeSession).filter(IntakeSession.patient_id == patient_id).first()
        )

        # Generate Patient Story
        story_gen = PatientStoryGenerator(self.db)
        story = await story_gen.generate_story(patient_id=patient_id, intake_id=intake_id)

        entries: List[Dict[str, Any]] = []

        # 1. Patient
        pat_res = self.map_patient(patient)
        entries.append({"fullUrl": f"urn:uuid:{pat_res['id']}", "resource": pat_res})

        # 2. Encounter
        enc_res = self.map_encounter(intake_session, patient)
        entries.append({"fullUrl": f"urn:uuid:{enc_res['id']}", "resource": enc_res})

        # 3. Consents
        consents = self.db.query(Consent).filter(Consent.patient_id == patient_id).all()
        for c in consents:
            c_res = self.map_consent(patient, c)
            entries.append({"fullUrl": f"urn:uuid:{c_res['id']}", "resource": c_res})

        # 4. Conditions & Symptoms from facts
        facts = self.db.query(MedicalFact).filter(MedicalFact.patient_id == patient_id).all()
        for f in facts:
            if f.fact_type in [FactType.SYMPTOM.value, FactType.CONDITION.value]:
                cond_res = self.map_condition(patient, f)
                entries.append({"fullUrl": f"urn:uuid:{cond_res['id']}", "resource": cond_res})
            elif f.fact_type == FactType.MEDICATION.value:
                med_res = self.map_medication_statement(patient, fact=f)
                entries.append({"fullUrl": f"urn:uuid:{med_res['id']}", "resource": med_res})
            elif f.fact_type == FactType.ALLERGY.value:
                alg_res = self.map_allergy_intolerance(patient, fact=f)
                entries.append({"fullUrl": f"urn:uuid:{alg_res['id']}", "resource": alg_res})

        # 5. Documents & DocumentReferences
        docs = self.db.query(MedicalDocument).filter(MedicalDocument.patient_id == patient_id).all()
        doc_ids = [d.id for d in docs]
        for d in docs:
            doc_res = self.map_document_reference(patient, d)
            entries.append({"fullUrl": f"urn:uuid:{doc_res['id']}", "resource": doc_res})

        # 6. Document Entities (Observations for labs)
        if doc_ids:
            doc_entities = (
                self.db.query(DocumentEntity)
                .filter(DocumentEntity.document_id.in_(doc_ids))
                .all()
            )
            for de in doc_entities:
                if de.entity_type == "LAB_TEST":
                    obs_res = self.map_observation(patient, de)
                    entries.append({"fullUrl": f"urn:uuid:{obs_res['id']}", "resource": obs_res})

        # 7. Composition (Patient Story)
        comp_res = self.map_composition(patient, story, intake_session)
        entries.append({"fullUrl": f"urn:uuid:{comp_res['id']}", "resource": comp_res})

        bundle_id = str(uuid.uuid4())
        bundle: Dict[str, Any] = {
            "resourceType": "Bundle",
            "type": "collection",
            "id": bundle_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "meta": {
                "tag": [
                    {
                        "system": "https://medikiosk.health/export-mode",
                        "code": "demo-export",
                        "display": "FHIR-compatible demo export",
                    }
                ],
                "lastUpdated": datetime.now(timezone.utc).isoformat(),
            },
            "entry": entries,
        }

        return bundle
