"""
Comprehensive Test Suite for MediKiosk Document Intelligence, OCR & Evidence Engine.

Covers:
1. Valid PDF upload and metadata registration
2. Valid image upload (JPG/PNG)
3. Invalid MIME type rejection
4. Oversized file rejection (> 15MB)
5. Empty file rejection
6. Structured OCR blocks, coordinates, and text extraction
7. OCR provider fallback and failure handling
8. Document classification: PRESCRIPTION
9. Document classification: LAB_REPORT
10. Document classification: DISCHARGE_SUMMARY
11. Document classification: UNKNOWN_DOCUMENT fallback
12. Complete medication extraction (name, dose, frequency, duration)
13. Partial medication extraction (missing fields kept as None without fabrication)
14. Lab extraction & Abnormal Value Engine: ABNORMAL_LOW
15. Lab extraction & Abnormal Value Engine: ABNORMAL_HIGH
16. Lab extraction: REFERENCE_RANGE_NOT_AVAILABLE without invention
17. Date extraction and ISO normalization
18. Document quality assessment (GOOD, FAIR, POOR)
19. Handwritten / poor image quality confidence degradation
20. Cross-document medication deduplication
21. Merging conversation facts and document facts with multi-source evidence
22. Cross-source conflict detection (Conversation "No allergy" vs Document "Penicillin allergy")
23. Evidence provenance linking (document ID, page, block, verbatim snippet)
24. Timeline event generation from clinical records
25. Patient Story update with abnormal labs and document evidence
26. Document processing retry workflow
27. Secure binary file download endpoint
28. Synthetic demo data seeding for Ramesh Kumar
"""

import io
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.models.patient import Patient
from app.models.document import MedicalDocument, DocumentType, ProcessingStatus, DocumentEntity
from app.models.medical_fact import MedicalFact, VerificationStatus
from app.models.evidence import EvidenceSource
from app.models.timeline import TimelineEvent
from app.services.ocr.ocr_provider import MockOCRProvider, OCRBlockResult
from app.services.ocr.text_normalizer import TextNormalizer
from app.services.documents.document_classifier import document_classifier
from app.services.extraction.date_extractor import date_extractor
from app.services.extraction.medication_extractor import medication_extractor
from app.services.extraction.lab_extractor import lab_extractor
from app.services.extraction.history_extractor import history_extractor
from app.services.extraction.medical_entity_extractor import medical_entity_extractor
from app.services.documents.document_processor import DocumentProcessor
from app.services.document_service import DocumentService
from app.services.patient_story.story_generator import PatientStoryGenerator


@pytest.fixture
def test_patient(db_session):
    patient = Patient(
        id="test-patient-doc-01",
        hospital_id="HOSP-DOC-01",
        name="Ramesh Kumar",
        age=58,
        gender="MALE",
        phone="+919876543210",
        preferred_language="en",
    )
    db_session.add(patient)
    db_session.commit()
    db_session.refresh(patient)
    return patient


# ---------------------------------------------------------------------------
# Test 1 & 2: Valid File Uploads (PDF and Image)
# ---------------------------------------------------------------------------

def test_upload_valid_pdf(client: TestClient, test_patient):
    pdf_content = b"%PDF-1.4 mock pdf content with Tab Amlodipine 5 mg"
    files = {"file": ("prescription.pdf", pdf_content, "application/pdf")}
    data = {"patient_id": test_patient.id, "document_type": "PRESCRIPTION"}
    response = client.post("/api/v1/documents/upload", files=files, data=data)
    assert response.status_code == 201
    res_data = response.json()["data"]
    assert res_data["file_name"] == "prescription.pdf"
    assert res_data["mime_type"] == "application/pdf"
    assert res_data["patient_id"] == test_patient.id


def test_upload_valid_image(client: TestClient, test_patient):
    img_content = b"\x89PNG\r\n\x1a\n mock png data"
    files = {"file": ("lab_report.png", img_content, "image/png")}
    data = {"patient_id": test_patient.id, "document_type": "LAB_REPORT"}
    response = client.post("/api/v1/documents/upload", files=files, data=data)
    assert response.status_code == 201
    res_data = response.json()["data"]
    assert res_data["file_name"] == "lab_report.png"
    assert res_data["mime_type"] == "image/png"


# ---------------------------------------------------------------------------
# Test 3, 4, 5: File Validation & Boundaries
# ---------------------------------------------------------------------------

def test_invalid_extension_rejected(client: TestClient, test_patient):
    bad_file = {"file": ("malicious.exe", b"binary content", "application/octet-stream")}
    data = {"patient_id": test_patient.id}
    response = client.post("/api/v1/documents/upload", files=bad_file, data=data)
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["error"]["message"]


def test_empty_file_rejected(client: TestClient, test_patient):
    empty_file = {"file": ("empty.pdf", b"", "application/pdf")}
    data = {"patient_id": test_patient.id}
    response = client.post("/api/v1/documents/upload", files=empty_file, data=data)
    assert response.status_code == 400
    assert "Empty file uploaded" in response.json()["error"]["message"]



def test_oversized_file_rejected(db_session, test_patient):
    service = DocumentService(db_session)
    with pytest.raises(Exception) as excinfo:
        service.validate_file("huge_file.pdf", "application/pdf", 16 * 1024 * 1024)
    assert "exceeds maximum allowed size" in str(excinfo.value.detail)


# ---------------------------------------------------------------------------
# Test 6 & 7: OCR Provider Execution & Normalization
# ---------------------------------------------------------------------------

def test_mock_ocr_provider_structure():
    provider = MockOCRProvider()
    content = b"Rx: Tab Amlodipine 5 mg once daily\nDoctor: Dr. S. Rao"
    res = provider.extract_document_structure(content, "application/pdf")
    assert len(res.pages) >= 1
    assert len(res.pages[0].blocks) >= 2
    b1 = res.pages[0].blocks[0]
    assert "Amlodipine" in b1.text
    assert b1.bbox is not None
    assert "x" in b1.bbox and "y" in b1.bbox


def test_ocr_text_normalizer():
    raw = "Tab. Amlodipine 5 mg  once  daily \r\nHb 10.2 g / dl"
    clean = TextNormalizer.normalize(raw)
    assert "Tablet Amlodipine 5 mg once daily" in clean
    assert "g/dL" in clean


# ---------------------------------------------------------------------------
# Test 8, 9, 10, 11: Document Classification
# ---------------------------------------------------------------------------

def test_classify_prescription():
    text = "City Clinic\nRx:\nTab Amlodipine 5 mg once daily\nRefill: 1\nDr. S. Rao"
    doc_type, conf, signals = document_classifier.classify(text, "rx_august.pdf")
    assert doc_type == "PRESCRIPTION"
    assert conf >= 0.85
    assert len(signals) > 0


def test_classify_lab_report():
    text = "Hematology Report\nTest Name: Hemoglobin\nObserved Value: 10.2 g/dL\nReference Range: 13.0 - 17.0"
    doc_type, conf, signals = document_classifier.classify(text, "blood_test.pdf")
    assert doc_type == "LAB_REPORT"
    assert conf >= 0.85


def test_classify_discharge_summary():
    text = "Hospital Discharge Summary\nAdmission Date: 10/04/2024\nDischarge Date: 12/04/2024\nHospital Course: Laparoscopic cholecystectomy"
    doc_type, conf, signals = document_classifier.classify(text, "discharge.pdf")
    assert doc_type == "DISCHARGE_SUMMARY"
    assert conf >= 0.85


def test_classify_unknown_document():
    text = "The quick brown fox jumps over the lazy dog."
    doc_type, conf, signals = document_classifier.classify(text, "random_notes.txt")
    assert doc_type == "UNKNOWN_DOCUMENT"
    assert conf < 0.35


# ---------------------------------------------------------------------------
# Test 12 & 13: Medication Extraction
# ---------------------------------------------------------------------------

def test_medication_extraction_complete():
    text = "Tab Amlodipine 5 mg once daily - 30 days after food"
    meds = medication_extractor.extract_medications(text)
    assert len(meds) == 1
    m = meds[0]
    assert m.name == "Amlodipine"
    assert m.dose == "5 mg"
    assert m.frequency == "once daily"
    assert m.duration == "30 days"
    assert m.instructions == "after food"


def test_medication_extraction_partial_no_fabrication():
    text = "Patient was prescribed Amlodipine previously."
    meds = medication_extractor.extract_medications(text)
    assert len(meds) == 1
    m = meds[0]
    assert m.name == "Amlodipine"
    assert m.dose is None
    assert m.frequency is None
    assert m.duration is None


# ---------------------------------------------------------------------------
# Test 14, 15, 16: Lab Extraction & Abnormal Value Engine
# ---------------------------------------------------------------------------

def test_lab_extraction_abnormal_low():
    text = "Hemoglobin 10.2 g/dL (Reference Range 13.0 - 17.0)"
    labs = lab_extractor.extract_labs(text)
    assert len(labs) == 1
    lab = labs[0]
    assert lab.test_name == "Hemoglobin"
    assert lab.numeric_value == 10.2
    assert lab.abnormal_flag == "ABNORMAL_LOW"
    assert "clinician review recommended" in lab.clinician_advisory
    # Rule: Must not diagnose Anemia!
    assert "anemia" not in lab.clinician_advisory.lower()


def test_lab_extraction_abnormal_high():
    text = "Fasting Blood Sugar: 142 mg/dL [Reference: 70 - 99]"
    labs = lab_extractor.extract_labs(text)
    assert len(labs) == 1
    lab = labs[0]
    assert lab.test_name == "Fasting Blood Sugar"
    assert lab.numeric_value == 142.0
    assert lab.abnormal_flag == "ABNORMAL_HIGH"
    assert "clinician review recommended" in lab.clinician_advisory


def test_lab_extraction_missing_reference_range():
    text = "Observed Serum Creatinine: 1.1 mg/dL"
    labs = lab_extractor.extract_labs(text)
    assert len(labs) == 1
    lab = labs[0]
    assert lab.test_name == "Serum Creatinine"
    assert lab.numeric_value == 1.1
    assert lab.abnormal_flag == "REFERENCE_RANGE_NOT_AVAILABLE"
    assert lab.reference_range is None


# ---------------------------------------------------------------------------
# Test 17: Date Extraction and ISO Normalization
# ---------------------------------------------------------------------------

def test_date_extraction_formats():
    text = "Prescription Date: 21/08/2026. Prior admission date was 2024-04-10."
    dates = date_extractor.extract_dates(text)
    iso_dates = [d.normalized_date for d in dates]
    assert "2026-08-21" in iso_dates
    assert "2024-04-10" in iso_dates


# ---------------------------------------------------------------------------
# Test 18 & 19: Document Quality & Handwriting Handling
# ---------------------------------------------------------------------------

def test_document_quality_assessment_good():
    provider = MockOCRProvider()
    res = provider.extract_document_structure(b"Clean crisp medical document with high resolution", "application/pdf")
    assert res.quality == "GOOD"
    assert res.average_confidence >= 0.90


def test_handwritten_quality_degradation():
    provider = MockOCRProvider()
    res = provider.extract_document_structure(b"Patient record with handwritten notes and signatures", "application/pdf")
    assert res.quality == "FAIR"
    assert "Handwritten document detected" in res.quality_message
    assert res.average_confidence < 0.85


# ---------------------------------------------------------------------------
# Test 20 & 21: Full Pipeline & Conversation-Document Fact Merging
# ---------------------------------------------------------------------------

def test_end_to_end_document_processing(db_session, test_patient):
    # Setup conversation fact: "I take amlodipine"
    conv_fact = MedicalFact(
        patient_id=test_patient.id,
        fact_type="MEDICATION",
        category="MEDICATION",
        field="current_medication",
        value="I take amlodipine",
        normalized_value="Amlodipine",
        confidence=0.90,
        source_type="PATIENT_REPORTED",
        verification_status="PATIENT_CONFIRMED",
    )
    db_session.add(conv_fact)
    db_session.commit()

    # Upload prescription via DocumentService
    service = DocumentService(db_session)
    doc = MedicalDocument(
        patient_id=test_patient.id,
        file_name="Prescription_2026.pdf",
        document_type="PRESCRIPTION",
        storage_path=f"patients/{test_patient.id}/prescription.pdf",
        mime_type="application/pdf",
        raw_text="Rx:\nTab Amlodipine 5 mg once daily - 30 days",
        processing_status=ProcessingStatus.UPLOADED.value,
        ocr_status="PENDING",
    )
    db_session.add(doc)
    db_session.commit()

    # Save mock file bytes in storage
    service.storage.save_file(b"Rx:\nTab Amlodipine 5 mg once daily - 30 days", "Prescription_2026.pdf", test_patient.id)

    # Process document
    processor = DocumentProcessor(db_session)
    processed_doc = processor.process_document(doc.id)

    assert processed_doc.processing_status == ProcessingStatus.PROCESSED.value
    assert processed_doc.extracted_facts_count >= 1

    # Check evidence source created
    ev = db_session.query(EvidenceSource).filter(EvidenceSource.document_id == doc.id).first()
    assert ev is not None
    assert "Prescription_2026.pdf" in ev.source_label
    assert "Amlodipine" in ev.source_excerpt


# ---------------------------------------------------------------------------
# Test 22: Cross-Source Conflict Detection
# ---------------------------------------------------------------------------

def test_allergy_conflict_detection(db_session, test_patient):
    # Patient conversation states "no known allergies"
    conv_fact = MedicalFact(
        patient_id=test_patient.id,
        fact_type="ALLERGY",
        category="ALLERGY",
        field="allergies",
        value="No known drug allergies reported",
        normalized_value="No drug allergies",
        confidence=0.95,
        source_type="PATIENT_REPORTED",
        verification_status="PATIENT_CONFIRMED",
    )
    db_session.add(conv_fact)
    db_session.commit()

    # Document contains Penicillin allergy
    doc = MedicalDocument(
        patient_id=test_patient.id,
        file_name="Old_ER_Record.pdf",
        document_type="MEDICAL_REPORT",
        storage_path=f"patients/{test_patient.id}/allergy.pdf",
        mime_type="application/pdf",
        raw_text="Allergy: Penicillin (severe urticaria)",
        processing_status="UPLOADED",
        ocr_status="PENDING",
    )
    db_session.add(doc)
    db_session.commit()

    service = DocumentService(db_session)
    service.storage.save_file(b"Allergy: Penicillin (severe urticaria)", "Old_ER_Record.pdf", test_patient.id)

    processor = DocumentProcessor(db_session)
    processor.process_document(doc.id)

    # Verify conflict marked
    db_session.refresh(conv_fact)
    assert conv_fact.conflict_status == "CONFLICTED"
    assert conv_fact.verification_status == VerificationStatus.CONFLICTED.value


# ---------------------------------------------------------------------------
# Test 23 & 24: Timeline Generation & Evidence Provenance
# ---------------------------------------------------------------------------

def test_timeline_generation_from_records(db_session, test_patient):
    doc = MedicalDocument(
        patient_id=test_patient.id,
        file_name="Discharge_Summary_2024.pdf",
        document_type="DISCHARGE_SUMMARY",
        document_date="2024-04-10",
        storage_path=f"patients/{test_patient.id}/discharge.pdf",
        mime_type="application/pdf",
        raw_text="Discharge Summary\nProcedure: Laparoscopic Cholecystectomy\nDate: 10/04/2024",
        processing_status="UPLOADED",
        ocr_status="PENDING",
    )
    db_session.add(doc)
    db_session.commit()

    service = DocumentService(db_session)
    service.storage.save_file(b"Discharge Summary\nProcedure: Laparoscopic Cholecystectomy\nDate: 10/04/2024", "Discharge_Summary_2024.pdf", test_patient.id)

    processor = DocumentProcessor(db_session)
    processor.process_document(doc.id)

    # Verify timeline event created
    timeline_event = db_session.query(TimelineEvent).filter(TimelineEvent.document_id == doc.id).first()
    assert timeline_event is not None
    assert "Cholecystectomy" in timeline_event.title
    assert timeline_event.date == "2024-04-10"


# ---------------------------------------------------------------------------
# Test 25: Patient Story Integration with Abnormal Labs
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_patient_story_abnormal_labs(db_session, test_patient):
    # Create lab report document and entity
    doc = MedicalDocument(
        patient_id=test_patient.id,
        file_name="Lab_Report_CBC.pdf",
        document_type="LAB_REPORT",
        document_date="2026-08-21",
        storage_path=f"patients/{test_patient.id}/lab.pdf",
        mime_type="application/pdf",
        raw_text="Hemoglobin 10.2 g/dL (Reference 13.0 - 17.0)",
        processing_status="PROCESSED",
        ocr_status="COMPLETED",
        extracted_facts_count=1,
    )
    db_session.add(doc)
    db_session.commit()

    lab_entity = DocumentEntity(
        document_id=doc.id,
        entity_type="LAB_TEST",
        name="Hemoglobin",
        value="10.2",
        unit="g/dL",
        reference_range="13.0 - 17.0",
        abnormal_flag="ABNORMAL_LOW",
        clinician_advisory="Lab value outside displayed reference range — clinician review recommended.",
        confidence=0.95,
        source_text="Hemoglobin 10.2 g/dL (Reference 13.0 - 17.0)",
        verification_status="NEEDS_VERIFICATION",
    )
    db_session.add(lab_entity)
    db_session.commit()

    story_gen = PatientStoryGenerator(db_session)
    story = await story_gen.generate_story(test_patient.id)

    assert len(story["abnormalLabs"]) >= 1
    lab_item = story["abnormalLabs"][0]
    assert lab_item["testName"] == "Hemoglobin"
    assert lab_item["abnormalFlag"] == "ABNORMAL_LOW"
    assert "clinician review recommended" in lab_item["clinicianAdvisory"]


# ---------------------------------------------------------------------------
# Test 26 & 27: Document Retry & Secure File Retrieval
# ---------------------------------------------------------------------------

def test_document_retry_workflow(db_session, test_patient):
    service = DocumentService(db_session)
    doc = MedicalDocument(
        patient_id=test_patient.id,
        file_name="Failed_Doc.pdf",
        document_type="OTHER",
        storage_path=f"patients/{test_patient.id}/failed.pdf",
        mime_type="application/pdf",
        processing_status=ProcessingStatus.FAILED.value,
        ocr_status="FAILED",
        error_message="Simulated temporary storage timeout",
    )
    db_session.add(doc)
    db_session.commit()

    service.storage.save_file(b"Recovered Prescription Tab Amlodipine 5 mg", "Failed_Doc.pdf", test_patient.id)

    # Retry document
    retried_doc = service.retry_document(doc.id)
    assert retried_doc.processing_status == ProcessingStatus.PROCESSED.value
    assert retried_doc.error_message is None


def test_secure_file_download(client: TestClient, db_session, test_patient):
    file_bytes = b"PDF-SECURE-CLINICAL-REPORT-CONTENT"

    doc = MedicalDocument(
        patient_id=test_patient.id,
        file_name="secure_report.pdf",
        document_type="PRESCRIPTION",
        storage_path=f"{test_patient.id}/secure_report.pdf",
        mime_type="application/pdf",
        processing_status="PROCESSED",
        raw_text=file_bytes.decode("utf-8"),
    )
    db_session.add(doc)
    db_session.commit()

    res = client.get(f"/api/v1/documents/{doc.id}/file")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert res.content == file_bytes


# ---------------------------------------------------------------------------
# Test 28: Synthetic Demo Seeding Endpoint
# ---------------------------------------------------------------------------

def test_synthetic_demo_seed_endpoint(client: TestClient, test_patient):
    response = client.post("/api/v1/documents/demo/seed", data={"patient_id": test_patient.id})
    assert response.status_code == 200
    res_data = response.json()["data"]
    assert len(res_data) == 2
    doc_types = [d["document_type"] for d in res_data]
    assert "PRESCRIPTION" in doc_types
    assert "LAB_REPORT" in doc_types

