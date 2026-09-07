"""
Comprehensive Test Suite for ABDM/FHIR-Ready Interoperability,
Consent Management and Clinical Handoff Layer (SIH 2026 MediKiosk).
"""

import json
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.models.patient import Patient
from app.models.consent import Consent, ConsentStatus, ConsentPurpose
from app.models.handoff import ClinicalHandoff, HandoffPriority, HandoffStatus, WorkflowPriority
from app.models.medical_fact import MedicalFact, FactType, VerificationStatus
from app.models.evidence import EvidenceSource
from app.models.document import MedicalDocument, DocumentType, ProcessingStatus, DocumentEntity
from app.models.risk import RiskAssessment, RiskPriority
from app.services.consent_service import ConsentService
from app.services.handoff_service import HandoffService
from app.services.interoperability.fhir_mapper import FHIRMapper
from app.services.interoperability.fhir_validator import FHIRValidator
from app.services.interoperability.fhir_export_service import FHIRExportService
from app.schemas.consent import ConsentCreate, ConsentWithdraw
from app.schemas.handoff import HandoffCreate, HandoffAssign, HandoffReview


@pytest.fixture
def test_patient(db_session):
    patient = Patient(
        id="patient-ramesh-01",
        hospital_id="HOSP-DEMO-01",
        name="Ramesh Kumar",
        age=65,
        gender="male",
        phone="9876543210",
        preferred_language="en",
    )
    db_session.add(patient)
    db_session.commit()
    db_session.refresh(patient)
    return patient


# ==============================================================================
# 1. CONSENT MANAGEMENT TESTS
# ==============================================================================

def test_consent_creation(db_session, test_patient):
    """Test creating a valid patient consent record."""
    service = ConsentService(db_session)
    data = ConsentCreate(
        patient_id=test_patient.id,
        purpose="CLINICAL_INTAKE",
        scope=["history", "uploaded_documents", "structured_facts", "clinician_review"],
        language="en",
        consent_method="patient_ui",
        consent_text_version="v1.0",
        metadata={"voice_recorded": True, "hospital_sharing": True}
    )
    consent = service.create_consent(data)

    assert consent.id is not None
    assert consent.patient_id == test_patient.id
    assert consent.status == ConsentStatus.GRANTED.value
    assert consent.purpose == ConsentPurpose.CLINICAL_INTAKE.value
    assert "uploaded_documents" in consent.get_scope_list()
    assert consent.granted_at is not None
    assert consent.withdrawn_at is None


def test_consent_retrieval(db_session, test_patient):
    """Test retrieving active consents for a patient."""
    service = ConsentService(db_session)
    data = ConsentCreate(
        patient_id=test_patient.id,
        purpose="CLINICAL_INTAKE",
        scope=["history", "structured_facts"],
    )
    service.create_consent(data)

    consents = service.get_patient_consents(test_patient.id)
    assert len(consents) == 1
    assert consents[0].patient_id == test_patient.id


def test_consent_scope_check(db_session, test_patient):
    """Test checking if patient has granted a specific scope."""
    service = ConsentService(db_session)
    data = ConsentCreate(
        patient_id=test_patient.id,
        purpose="CLINICAL_INTAKE",
        scope=["history", "uploaded_documents"],
    )
    service.create_consent(data)

    assert service.check_consent(test_patient.id, "CLINICAL_INTAKE", "history") is True
    assert service.check_consent(test_patient.id, "CLINICAL_INTAKE", "uploaded_documents") is True
    assert service.check_consent(test_patient.id, "CLINICAL_INTAKE", "research_sharing") is False


def test_non_destructive_consent_withdrawal(db_session, test_patient):
    """Test withdrawing consent: must be non-destructive, preserve audit record, set status WITHDRAWN."""
    service = ConsentService(db_session)
    data = ConsentCreate(
        patient_id=test_patient.id,
        purpose="CLINICAL_INTAKE",
        scope=["history", "uploaded_documents"],
    )
    consent = service.create_consent(data)

    withdraw_data = ConsentWithdraw(reason="Patient chose to revoke document sharing permission")
    withdrawn = service.withdraw_consent(consent.id, withdraw_data)

    assert withdrawn.status == ConsentStatus.WITHDRAWN.value
    assert withdrawn.withdrawn_at is not None
    assert withdrawn.metadata_json is not None
    assert "withdrawal_reason" in withdrawn.get_metadata_dict()

    # Scope check must now return False
    assert service.check_consent(test_patient.id, "CLINICAL_INTAKE", "history") is False


def test_consent_api_endpoints(client, test_patient):
    """Test FastAPI consent endpoints: POST create, GET list, POST withdraw."""
    res = client.post("/api/v1/consents", json={
        "patient_id": test_patient.id,
        "purpose": "CLINICAL_INTAKE",
        "scope": ["history", "structured_facts"],
        "language": "en"
    })
    assert res.status_code in [200, 201]
    created = res.json()["data"]
    consent_id = created["id"]
    assert created["status"] == "GRANTED"

    res_list = client.get(f"/api/v1/patients/{test_patient.id}/consents")
    assert res_list.status_code == 200
    assert len(res_list.json()["data"]) >= 1

    res_withdraw = client.post(f"/api/v1/consents/{consent_id}/withdraw", json={
        "reason": "Revoked via kiosk"
    })
    assert res_withdraw.status_code == 200
    assert res_withdraw.json()["data"]["status"] == "WITHDRAWN"


# ==============================================================================
# 2. CLINICAL HANDOFF & WORKFLOW PRIORITY TESTS
# ==============================================================================

def test_deterministic_handoff_priority_high(db_session, test_patient):
    """Test that safety signals like chest pain yield deterministic HIGH_PRIORITY_REVIEW."""
    intake_id = "intake-ramesh-high"
    risk = RiskAssessment(
        patient_id=test_patient.id,
        priority=RiskPriority.IMMEDIATE.value,
        reason="Chest pressure and left arm pain with shortness of breath",
    )
    db_session.add(risk)
    db_session.commit()

    service = HandoffService(db_session)
    handoff = service.create_handoff(HandoffCreate(
        patient_id=test_patient.id,
        intake_id=intake_id,
    ))

    assert handoff.priority == WorkflowPriority.HIGH_PRIORITY_REVIEW.value
    assert handoff.status == HandoffStatus.READY.value


def test_deterministic_handoff_priority_moderate(db_session, test_patient):
    """Test that moderate symptoms yield REVIEW_REQUIRED."""
    intake_id = "intake-sita-mod"
    risk = RiskAssessment(
        patient_id=test_patient.id,
        priority=RiskPriority.NEEDS_ATTENTION.value,
        reason="Fever for 3 days and persistent fatigue",
    )
    db_session.add(risk)
    db_session.commit()

    service = HandoffService(db_session)
    handoff = service.create_handoff(HandoffCreate(
        patient_id=test_patient.id,
        intake_id=intake_id,
    ))

    assert handoff.priority == WorkflowPriority.REVIEW_REQUIRED.value


def test_deterministic_handoff_priority_routine(db_session, test_patient):
    """Test that symptoms without red flags or moderate risk yield ROUTINE."""
    intake_id = "intake-routine-01"
    fact = MedicalFact(
        patient_id=test_patient.id,
        fact_type=FactType.SYMPTOM.value,
        category="symptom",
        field="chief_complaint",
        value="Mild seasonal runny nose",
        confidence=0.9,
    )
    db_session.add(fact)
    db_session.commit()

    service = HandoffService(db_session)
    handoff = service.create_handoff(HandoffCreate(
        patient_id=test_patient.id,
        intake_id=intake_id,
    ))

    assert handoff.priority == WorkflowPriority.ROUTINE.value


def test_handoff_assignment_and_review(db_session, test_patient):
    """Test assigning a handoff to a clinician and updating its review status."""
    service = HandoffService(db_session)
    handoff = service.create_handoff(HandoffCreate(
        patient_id=test_patient.id,
        intake_id="intake-assign-test",
    ))

    assigned = service.assign_doctor(
        handoff.id,
        HandoffAssign(assigned_to="Dr. Anita Sharma", notes="Assigned from Cardiology intake")
    )
    assert assigned.status == HandoffStatus.ASSIGNED.value
    assert assigned.assigned_to == "Dr. Anita Sharma"

    reviewed = service.review_handoff(
        handoff.id,
        HandoffReview(
            status="COMPLETED",
            review_notes="Consultation started. All findings reviewed.",
            reviewer_id="DOC-ANITA-01"
        )
    )
    assert reviewed.status == HandoffStatus.COMPLETED.value
    assert reviewed.completed_at is not None


# ==============================================================================
# 3. FHIR R4 MAPPING & PROVENANCE TESTS
# ==============================================================================

def test_fhir_patient_mapping(test_patient):
    """Test mapping internal patient to FHIR R4 Patient resource."""
    mapper = FHIRMapper()
    fhir_pat = mapper.map_patient(test_patient)

    assert fhir_pat["resourceType"] == "Patient"
    assert fhir_pat["id"] == f"pat-{test_patient.id}"
    assert fhir_pat["name"][0]["text"] == "Ramesh Kumar"
    assert fhir_pat["gender"] == "male"
    assert fhir_pat["telecom"][0]["value"] == "9876543210"


def test_fhir_condition_mapping_with_provenance(test_patient):
    """Test Condition resource mapping with internal provenance extension."""
    fact = MedicalFact(
        id="fact-sym-01",
        patient_id=test_patient.id,
        fact_type=FactType.SYMPTOM.value,
        category="Cardiovascular",
        field="symptom",
        value="Retrosternal chest pressure for 2 days",
        normalized_value="Chest Pressure",
        confidence=0.92,
        source_type="AI_EXTRACTED",
        verification_status=VerificationStatus.NEEDS_VERIFICATION.value,
    )

    mapper = FHIRMapper()
    fhir_cond = mapper.map_condition(test_patient, fact)

    assert fhir_cond["resourceType"] == "Condition"
    assert fhir_cond["code"]["text"] == "Chest Pressure"
    assert fhir_cond["subject"]["reference"] == f"Patient/pat-{test_patient.id}"

    prov_ext = next(
        (ext for ext in fhir_cond.get("extension", []) if "internal-provenance" in ext["url"]),
        None
    )
    assert prov_ext is not None
    ext_vals = {item["url"]: item.get("valueString") or item.get("valueDecimal") for item in prov_ext["extension"]}
    assert ext_vals["sourceType"] == "AI_EXTRACTED"
    assert "chest pressure" in ext_vals["verbatimSnippet"].lower()


def test_fhir_medication_statement_mapping(test_patient):
    """Test MedicationStatement mapping with dosage instructions."""
    fact = MedicalFact(
        id="fact-med-01",
        patient_id=test_patient.id,
        fact_type=FactType.MEDICATION.value,
        category="Endocrine",
        value="Metformin 500 mg BD",
        normalized_value="Metformin",
        confidence=0.88,
        verification_status=VerificationStatus.NEEDS_VERIFICATION.value,
    )
    med_entity = DocumentEntity(
        id="ent-med-01",
        document_id="doc-01",
        entity_type="MEDICATION",
        name="Metformin",
        value="500 mg",
        unit="BD",
        source_text="Rx: Tab Metformin 500mg BD after food.",
        confidence=0.95
    )

    mapper = FHIRMapper()
    fhir_med = mapper.map_medication_statement(test_patient, fact, med_entity)

    assert fhir_med["resourceType"] == "MedicationStatement"
    assert fhir_med["status"] == "active"
    assert fhir_med["medicationCodeableConcept"]["text"] == "Metformin"
    assert len(fhir_med["dosage"]) > 0
    assert "500 mg BD" in fhir_med["dosage"][0]["text"]


def test_fhir_allergy_intolerance_mapping(test_patient):
    """Test AllergyIntolerance mapping with verification status."""
    fact = MedicalFact(
        id="fact-alg-01",
        patient_id=test_patient.id,
        fact_type=FactType.ALLERGY.value,
        category="Allergy",
        value="Penicillin (severe hives and rash in 2021)",
        normalized_value="Penicillin",
        confidence=0.96,
        verification_status=VerificationStatus.DOCTOR_VERIFIED.value,
    )
    mapper = FHIRMapper()
    fhir_alg = mapper.map_allergy_intolerance(test_patient, fact)

    assert fhir_alg["resourceType"] == "AllergyIntolerance"
    assert fhir_alg["code"]["text"] == "Penicillin"
    assert fhir_alg["verificationStatus"]["coding"][0]["code"] == "confirmed"


def test_fhir_observation_reference_range_honesty(test_patient):
    """
    CRITICAL SAFETY REQUIREMENT:
    If a lab test does NOT have a reference range from the document,
    it must NOT invent/hallucinate one. It must record reference range strictly from document.
    """
    mapper = FHIRMapper()

    # 1. Lab WITHOUT reference range
    lab_no_ref = DocumentEntity(
        id="ent-lab-no-ref",
        document_id="doc-lab-01",
        entity_type="LAB_RESULT",
        name="HbA1c",
        value="7.8",
        unit="%",
        reference_range=None,
        abnormal_flag="ABNORMAL_HIGH",
        source_text="HbA1c: 7.8%",
        confidence=0.95
    )
    fhir_obs_no_ref = mapper.map_observation(test_patient, lab_no_ref)
    assert fhir_obs_no_ref["resourceType"] == "Observation"
    assert "referenceRange" not in fhir_obs_no_ref
    assert fhir_obs_no_ref["valueQuantity"]["value"] == 7.8
    assert fhir_obs_no_ref["interpretation"][0]["coding"][0]["code"] == "H"

    # 2. Lab WITH explicit reference range from uploaded report
    lab_with_ref = DocumentEntity(
        id="ent-lab-with-ref",
        document_id="doc-lab-02",
        entity_type="LAB_RESULT",
        name="Fasting Blood Glucose",
        value="138",
        unit="mg/dL",
        reference_range="70 - 100 mg/dL",
        abnormal_flag="ABNORMAL_HIGH",
        source_text="Fasting Blood Sugar: 138 mg/dL (Normal: 70 - 100 mg/dL)",
        confidence=0.98
    )
    fhir_obs_with_ref = mapper.map_observation(test_patient, lab_with_ref)
    assert "referenceRange" in fhir_obs_with_ref
    assert fhir_obs_with_ref["referenceRange"][0]["text"] == "70 - 100 mg/dL"


def test_fhir_composition_clearly_labeled_ai_assisted(test_patient):
    """Verify that FHIR Composition is explicitly titled 'AI-assisted patient intake summary'."""
    mapper = FHIRMapper()
    story = {
        "chiefComplaint": "Chest tightness and fatigue",
        "onsetAndDuration": "2 days ago",
        "timelineSummary": "Reported symptoms starting yesterday.",
    }
    comp = mapper.map_composition(test_patient, story, None)
    assert comp["resourceType"] == "Composition"
    assert "AI-Assisted Patient Intake Summary" in comp["title"]
    assert any("not a doctor" in section["text"]["div"].lower() for section in comp["section"])


def test_fhir_document_reference_mapping(test_patient):
    """Test DocumentReference resource mapping for patient uploaded records."""
    doc = MedicalDocument(
        id="doc-prescription-01",
        patient_id=test_patient.id,
        file_name="Old_Prescription.pdf",
        mime_type="application/pdf",
        file_size_bytes=102400,
        storage_path="prescriptions/Old_Prescription.pdf",
        document_type=DocumentType.PRESCRIPTION.value,
        processing_status=ProcessingStatus.PROCESSED.value
    )
    mapper = FHIRMapper()
    fhir_doc = mapper.map_document_reference(test_patient, doc)

    assert fhir_doc["resourceType"] == "DocumentReference"
    assert fhir_doc["status"] == "current"
    assert fhir_doc["type"]["text"] == DocumentType.PRESCRIPTION.value
    assert fhir_doc["content"][0]["attachment"]["title"] == "Old_Prescription.pdf"


def test_fhir_consent_mapping(test_patient):
    """Test Consent resource mapping to FHIR R4."""
    consent = Consent(
        id="consent-01",
        patient_id=test_patient.id,
        purpose=ConsentPurpose.CLINICAL_INTAKE.value,
        scope=json.dumps(["history", "structured_facts"]),
        status=ConsentStatus.GRANTED.value,
        language="en",
        consent_method="patient_ui",
        consent_text_version="v1.0"
    )
    mapper = FHIRMapper()
    fhir_consent = mapper.map_consent(test_patient, consent)

    assert fhir_consent["resourceType"] == "Consent"
    assert fhir_consent["status"] == "active"
    assert fhir_consent["patient"]["reference"] == f"Patient/pat-{test_patient.id}"


# ==============================================================================
# 4. BUNDLE ASSEMBLY & STRUCTURAL VALIDATION TESTS
# ==============================================================================

def test_fhir_bundle_assembly_and_validation():
    """Test offline structural validation of a FHIR Bundle."""
    bundle = {
        "resourceType": "Bundle",
        "id": "bundle-test-01",
        "type": "collection",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "entry": [
            {
                "fullUrl": "urn:uuid:pat-01",
                "resource": {
                    "resourceType": "Patient",
                    "id": "pat-01",
                    "name": [{"text": "Ramesh Kumar"}],
                    "gender": "male"
                }
            },
            {
                "fullUrl": "urn:uuid:enc-01",
                "resource": {
                    "resourceType": "Encounter",
                    "id": "enc-01",
                    "status": "finished",
                    "class": {"code": "AMB"},
                    "subject": {"reference": "Patient/pat-01"}
                }
            }
        ]
    }

    result = FHIRValidator.validate_bundle(bundle)
    assert result.is_valid is True
    assert len(result.errors) == 0


def test_fhir_validator_detects_corrupted_bundle():
    """Test that validator catches missing fields and invalid types."""
    corrupted_bundle = {
        "resourceType": "Bundle",
        "entry": [
            {
                "fullUrl": "urn:uuid:bad-01"
            },
            {
                "resource": {
                    "resourceType": "UnknownResource",
                    "id": "bad-02"
                }
            }
        ]
    }
    result = FHIRValidator.validate_bundle(corrupted_bundle)
    assert result.is_valid is False
    assert len(result.errors) > 0


# ==============================================================================
# 5. SIMULATED INTEROPERABILITY SUBMISSION TESTS
# ==============================================================================

def test_simulated_interoperability_submission(client, test_patient):
    """
    Test submitting a FHIR bundle to the simulated interoperability gateway.
    Verifies synthetic DEMO-INT-* reference ID and non-production disclaimer.
    """
    bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": [
            {
                "resource": {
                    "resourceType": "Patient",
                    "id": test_patient.id,
                    "name": [{"text": test_patient.name}]
                }
            }
        ]
    }

    res = client.post("/api/v1/demo/interoperability/submit", json={
        "patient_id": test_patient.id,
        "bundle": bundle
    })
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["status"].lower() == "accepted"
    assert data["reference_id"].startswith("DEMO-INT-")
    assert "simulated" in data["message"].lower() and "submission" in data["message"].lower()


# ==============================================================================
# 6. END-TO-END CLINICAL INTAKE -> INTEROPERABILITY WORKFLOW
# ==============================================================================

def test_e2e_ramesh_kumar_intake_to_interoperability_export(client, db_session, test_patient):
    """
    Full end-to-end simulation:
    1. Patient grants consent on Kiosk.
    2. Facts and risk recorded (Chest pain, Metformin, Penicillin allergy).
    3. Handoff created -> safety signal triggers HIGH_PRIORITY_REVIEW.
    4. FHIR bundle exported via interoperability service.
    5. FHIR bundle structurally validated.
    6. Simulated submission executed and tracked.
    """
    intake_id = "intake-ramesh-e2e"

    # Step 1: Grant Consent
    consent_res = client.post("/api/v1/consents", json={
        "patient_id": test_patient.id,
        "intake_id": intake_id,
        "purpose": "CLINICAL_INTAKE",
        "scope": ["history", "uploaded_documents", "structured_facts", "clinician_review"],
        "language": "en"
    })
    assert consent_res.status_code in [200, 201]

    # Step 2: Seed Clinical Data
    risk = RiskAssessment(
        patient_id=test_patient.id,
        priority=RiskPriority.IMMEDIATE.value,
        reason="Chest pressure and left arm radiation",
    )
    fact_med = MedicalFact(
        patient_id=test_patient.id,
        fact_type=FactType.MEDICATION.value,
        category="Endocrine",
        field="current_medication",
        value="Metformin 500 mg BD",
        confidence=0.9,
    )
    fact_alg = MedicalFact(
        patient_id=test_patient.id,
        fact_type=FactType.ALLERGY.value,
        category="Allergy",
        field="allergy",
        value="Penicillin severe rash",
        confidence=0.95,
    )
    db_session.add_all([risk, fact_med, fact_alg])
    db_session.commit()

    # Step 3: Clinical Handoff Creation
    handoff_res = client.post(f"/api/v1/intakes/{intake_id}/handoff", json={
        "patient_id": test_patient.id,
        "intake_id": intake_id,
    })
    assert handoff_res.status_code in [200, 201]
    handoff_data = handoff_res.json()["data"]
    assert handoff_data["priority"] == "HIGH_PRIORITY_REVIEW"

    # Step 4: Export FHIR Bundle
    fhir_res = client.get(f"/api/v1/patients/{test_patient.id}/fhir")
    assert fhir_res.status_code == 200
    bundle_data = fhir_res.json()["data"]

    assert bundle_data["resourceType"] == "Bundle"
    assert bundle_data["type"] == "collection"

    # Step 5: Check resources in Bundle
    resource_types = [entry["resource"]["resourceType"] for entry in bundle_data["entry"]]
    assert "Patient" in resource_types
    assert "MedicationStatement" in resource_types
    assert "AllergyIntolerance" in resource_types
    assert "Composition" in resource_types
    assert "Consent" in resource_types

    # Step 6: Verify Composition Title
    composition = next(e["resource"] for e in bundle_data["entry"] if e["resource"]["resourceType"] == "Composition")
    assert "AI-Assisted Patient Intake Summary" in composition["title"]

    # Step 7: Simulate Interoperability Gateway Submission
    submit_res = client.post("/api/v1/demo/interoperability/submit", json={
        "patient_id": test_patient.id,
        "bundle": bundle_data
    })
    assert submit_res.status_code == 200
    submit_data = submit_res.json()["data"]
    assert submit_data["status"].lower() == "accepted"
    assert submit_data["reference_id"].startswith("DEMO-INT-")

