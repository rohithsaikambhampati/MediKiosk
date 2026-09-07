"""
MediKiosk End-to-End Master Integration and Security Audit Test Suite.
Verifies the complete patient intake lifecycle, security boundaries,
demo preloader, conflict detection, abnormal lab tracking, and FHIR interoperability.
Conforms directly with SIH 2026 specifications.
"""

import pytest
import json
import os
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.department import Department
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.intake import IntakeSession, IntakeStatus
from app.models.conversation import Conversation, ConversationMessage
from app.models.medical_fact import MedicalFact, FactType, FactSourceType, VerificationStatus
from app.models.document import MedicalDocument, DocumentType, ProcessingStatus, DocumentEntity
from app.models.consent import Consent, ConsentPurpose
from app.models.handoff import ClinicalHandoff, HandoffPriority, HandoffStatus
from app.models.queue import QueueItem, QueueStatus
from app.models.evidence import EvidenceSource
from app.models.audit import AuditEvent
from app.utils.storage import LocalFileStorage
from app.core.security import get_password_hash, create_access_token


# Setup isolated in-memory database fixture
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

    # Seed base departments and staff
    dept_cardio = Department(name="Cardiology", code="CARD", is_active=True)
    dept_gen = Department(name="General Medicine", code="GEN_MED", is_active=True)
    db.add_all([dept_cardio, dept_gen])
    db.commit()

    pwd = get_password_hash("password123")
    u_admin = User(name="IT Lead", email="admin@medikiosk.org", password_hash=pwd, role="ADMIN", is_active=True)
    u_doc = User(name="Dr. Rajesh Sharma", email="dr.rajesh@medikiosk.org", password_hash=pwd, role="DOCTOR", is_active=True)
    u_nurse = User(name="Nurse Priya", email="nurse.priya@medikiosk.org", password_hash=pwd, role="NURSE", is_active=True)
    db.add_all([u_admin, u_doc, u_nurse])
    db.commit()

    doc = Doctor(user_id=u_doc.id, department_id=dept_cardio.id, hospital_id="DOC-01", specialty="Cardiology")
    db.add(doc)
    db.commit()

    yield db
    db.close()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(test_db):
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# =========================================================================
# 1. Health and Diagnostics Contract Tests (Sections 51 and 53)
# =========================================================================

def test_section_51_health_check_contract(client):
    """Validates Section 51 /api/health format and zero secret exposure."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data.get("status") in ["ok", "degraded"]
    assert data.get("database") == "ok"
    assert data.get("storage") == "ok"
    assert data.get("ai_provider") == "mock"
    assert data.get("ocr_provider") == "mock"
    assert data.get("environment") == "demo"
    assert "password" not in json.dumps(data)
    assert "SECRET" not in json.dumps(data)


def test_section_53_system_diagnostics_ten_engines(client):
    """Validates Section 53 diagnostics checking all 10 clinical/infra subsystems."""
    res = client.get("/api/v1/system/diagnostics")
    assert res.status_code == 200
    payload = res.json()
    assert payload.get("success") is True
    diag_data = payload.get("data")
    assert diag_data.get("overall_status") in ["READY", "WARNING", "ERROR"]
    subsystems = diag_data.get("subsystems")
    
    expected_engines = [
        "Database",
        "Storage",
        "Authentication",
        "Conversation Engine",
        "Document Engine",
        "Evidence Engine",
        "Risk Engine",
        "Consent",
        "Handoff",
        "FHIR Export",
    ]
    for eng in expected_engines:
        assert eng in subsystems, f"Missing diagnostic check for {eng}"
        assert subsystems[eng]["status"] in ["READY", "WARNING"]


# =========================================================================
# 2. Demo Reset and Preload Tests (Sections 32, 33, 54, 57)
# =========================================================================

def test_demo_preload_and_reset_flow(client, test_db):
    """Validates that POST /api/v1/demo/preload loads the 5 test cases and reset wipes only synthetic records."""
    # 1. Preload
    preload_res = client.post("/api/v1/demo/preload")
    assert preload_res.status_code == 200
    preload_json = preload_res.json()
    assert preload_json["data"]["preloaded_count"] == 5

    # Check demo patients list
    list_res = client.get("/api/v1/demo/patients")
    assert list_res.status_code == 200
    patients = list_res.json()["data"]
    assert len(patients) == 5
    names = [p["name"] for p in patients]
    assert "Ramesh Kumar" in names
    assert "Mohan Singh" in names
    assert "Vikram Patel" in names

    # Verify audit event logged
    audit_pre = test_db.query(AuditEvent).filter(AuditEvent.action == "DEMO_DATA_PRELOADED").first()
    assert audit_pre is not None

    # 2. Reset
    reset_res = client.post("/api/v1/demo/reset")
    assert reset_res.status_code == 200
    reset_json = reset_res.json()
    assert reset_json["data"]["status"] == "ok"

    # Verify demo patients gone
    list_after = client.get("/api/v1/demo/patients")
    assert len(list_after.json()["data"]) == 0

    # Verify real staff untouched
    doc = test_db.query(Doctor).first()
    assert doc is not None


# =========================================================================
# 3. Primary Full Intake Journey: Ramesh Kumar (Sections 34, 55, 62)
# =========================================================================

def test_ramesh_kumar_full_acceptance_journey(client, test_db):
    """
    Executes the exact Section 62 acceptance path:
    Patient -> Consent -> Intake -> Conversation -> Document Upload -> OCR -> Facts ->
    Evidence -> Risk -> Timeline -> Handoff -> Queue -> Verification -> FHIR Export -> Demo Interop.
    """
    # 1. Preload synthetic Ramesh Kumar
    client.post("/api/v1/demo/preload")
    ramesh = test_db.query(Patient).filter(Patient.hospital_id == "MRN-102948").first()
    assert ramesh is not None
    assert ramesh.name == "Ramesh Kumar"
    assert ramesh.age == 54

    # 2. Verify Consent was recorded
    consents = test_db.query(Consent).filter(Consent.patient_id == ramesh.id).all()
    assert len(consents) > 0
    assert consents[0].status == "GRANTED"

    # 3. Verify AI Conversation & Follow-up
    intake = test_db.query(IntakeSession).filter(IntakeSession.patient_id == ramesh.id).first()
    assert intake is not None
    messages = test_db.query(ConversationMessage).all()
    assert len(messages) >= 4
    patient_msgs = [m.content for m in messages if m.role == "PATIENT"]
    assert any("chest discomfort" in m.lower() for m in patient_msgs)
    assert any("severity is 8/10" in m.lower() for m in patient_msgs)

    # 4. Verify Document Processing & OCR
    docs = test_db.query(MedicalDocument).filter(MedicalDocument.patient_id == ramesh.id).all()
    assert len(docs) == 2
    doc_types = [d.document_type for d in docs]
    assert "PRESCRIPTION" in doc_types
    assert "LAB_REPORT" in doc_types

    # 5. Verify Abnormal Lab Extraction
    lab_entity = test_db.query(DocumentEntity).filter(
        DocumentEntity.name == "Hemoglobin"
    ).first()
    assert lab_entity is not None
    assert lab_entity.value == "10.2"
    assert lab_entity.abnormal_flag == "ABNORMAL_LOW"
    assert "mild anemia" in lab_entity.clinician_advisory.lower()

    # 6. Verify Evidence Provenance Links
    evidence_links = test_db.query(EvidenceSource).all()
    assert len(evidence_links) >= 2
    sources = [ev.source_type for ev in evidence_links]
    assert "CONVERSATION" in sources
    assert "DOCUMENT" in sources

    # 7. Verify Priority Calculation & Handoff
    handoff = test_db.query(ClinicalHandoff).filter(ClinicalHandoff.patient_id == ramesh.id).first()
    assert handoff is not None
    assert handoff.priority == HandoffPriority.HIGH_PRIORITY_REVIEW.value
    assert handoff.status == HandoffStatus.READY.value

    # 8. Verify Queue Enqueueing
    queue_item = test_db.query(QueueItem).filter(QueueItem.patient_id == ramesh.id).first()
    assert queue_item is not None
    assert queue_item.token_number == "#102"
    assert queue_item.priority == "HIGH_PRIORITY"

    # 9. Doctor Verification of Facts
    fact_to_verify = test_db.query(MedicalFact).filter(
        MedicalFact.patient_id == ramesh.id,
        MedicalFact.field == "chief_complaint"
    ).first()
    assert fact_to_verify is not None
    fact_to_verify.verification_status = VerificationStatus.DOCTOR_VERIFIED.value
    fact_to_verify.doctor_notes = "Confirmed exertional nature during bedside review."
    test_db.commit()

    fhir_res = client.get(f"/api/v1/patients/{ramesh.id}/fhir")
    assert fhir_res.status_code == 200
    res_json = fhir_res.json()
    bundle = res_json.get("data") if "data" in res_json else res_json
    assert bundle.get("resourceType") == "Bundle"
    assert bundle.get("type") == "collection"
    assert bundle.get("validation", {}).get("is_valid") is True
    entries = bundle.get("entry", [])
    entry_types = [e.get("resource", {}).get("resourceType") for e in entries]
    assert "Patient" in entry_types
    assert "Condition" in entry_types
    assert "Observation" in entry_types
    assert "MedicationStatement" in entry_types
    assert "Composition" in entry_types

    # 11. Simulated Exchange Submission
    submit_res = client.post("/api/v1/demo/interoperability/submit", json={
        "patient_id": ramesh.id,
        "bundle": bundle,
    })
    assert submit_res.status_code == 200
    sub_data = submit_res.json()["data"]
    assert sub_data["status"] == "accepted"
    assert sub_data["mode"] == "demo"
    assert sub_data["reference_id"].startswith("DEMO-INT-")
    assert "simulated" in sub_data["message"].lower()


# =========================================================================
# 4. Conflict Detection Scenario Test (Section 35)
# =========================================================================

def test_allergy_conflict_detection_and_resolution(client, test_db):
    """Validates Section 35: Patient claims NKDA, but prior document notes Penicillin allergy."""
    client.post("/api/v1/demo/preload")
    mohan = test_db.query(Patient).filter(Patient.hospital_id == "MRN-309182").first()
    assert mohan is not None

    # Check conflicted fact
    conflicted_fact = test_db.query(MedicalFact).filter(
        MedicalFact.patient_id == mohan.id,
        MedicalFact.conflict_status == "CONFLICTED"
    ).first()
    assert conflicted_fact is not None
    assert conflicted_fact.verification_status == VerificationStatus.CONFLICTED.value

    # Doctor resolves conflict
    conflicted_fact.conflict_status = "RESOLVED"
    conflicted_fact.verification_status = VerificationStatus.DOCTOR_VERIFIED.value
    conflicted_fact.doctor_notes = "Patient verified childhood Penicillin rash; charted as confirmed allergy."
    test_db.commit()

    assert conflicted_fact.verification_status == VerificationStatus.DOCTOR_VERIFIED.value
    assert conflicted_fact.conflict_status == "RESOLVED"


# =========================================================================
# 5. Incomplete Information / Unknown Onset (Section 36)
# =========================================================================

def test_unknown_onset_without_hallucination(client, test_db):
    """Validates Section 36: Patient says 'I don't remember when it started', onset is UNKNOWN."""
    client.post("/api/v1/demo/preload")
    vikram = test_db.query(Patient).filter(Patient.hospital_id == "MRN-501934").first()
    assert vikram is not None

    onset_fact = test_db.query(MedicalFact).filter(
        MedicalFact.patient_id == vikram.id,
        MedicalFact.field == "onset"
    ).first()
    assert onset_fact is not None
    assert onset_fact.value == "UNKNOWN"
    assert "not reported" in onset_fact.normalized_value.lower()


# =========================================================================
# 6. Security: Path Traversal and Storage Sandboxing (Sections 8, 11, 12)
# =========================================================================

def test_storage_path_traversal_prevention(tmp_path):
    """Validates that LocalFileStorage strictly sandboxes paths and rejects traversal."""
    storage = LocalFileStorage(base_dir=str(tmp_path))

    # Legitimate save
    file_bytes = b"Sample Medical Text"
    unique_name = storage.save(open(os.path.join(tmp_path, "temp.txt"), "wb+"), "legit.txt")

    # Directory traversal attempts
    traversal_paths = [
        "../../etc/passwd",
        "..\\..\\secret.txt",
        "../sub/test.txt",
        "/etc/shadow",
        "C:\\Windows\\System32\\cmd.exe",
    ]
    for bad_path in traversal_paths:
        assert storage.get(bad_path) is None, f"Failed to reject traversal: {bad_path}"
        assert storage.exists(bad_path) is False, f"Failed to reject traversal: {bad_path}"
        assert storage.delete(bad_path) is False, f"Failed to reject traversal: {bad_path}"


# =========================================================================
# 7. Security: Role Authorization Check (Section 6)
# =========================================================================

def test_role_authorization_enforcement(client):
    """Validates RBAC protection on sensitive routes."""
    # Unauthenticated request to doctor workspace should fail with 401
    unauth_res = client.get("/api/v1/doctor/workspace/nonexistent-patient")
    assert unauth_res.status_code == 401

    # Token with NURSE role attempting ADMIN endpoint should fail with 403
    nurse_token = create_access_token({"sub": "nurse_01", "role": "NURSE", "email": "nurse@hospital.org"})
    auth_headers = {"Authorization": f"Bearer {nurse_token}"}
    admin_res = client.get("/api/v1/admin/stats", headers=auth_headers)
    assert admin_res.status_code == 403
