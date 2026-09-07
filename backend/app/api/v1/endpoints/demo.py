"""
Demo Environment Controls and Scenario Preloader for MediKiosk.
Implements Sections 32, 33, 34, 35, 36, 37, 52, 54, 57 of SIH 2026 specifications.
Enables clean presentation resets and deterministic preloading of the 5 official test scenarios.
"""

import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.schemas.common import ApiResponse
from app.models.patient import Patient
from app.models.department import Department
from app.models.doctor import Doctor
from app.models.intake import IntakeSession, ConsentRecord, IntakeStatus
from app.models.conversation import Conversation, ConversationMessage
from app.models.document import MedicalDocument, DocumentType, ProcessingStatus, DocumentEntity, DocumentPage, OCRBlock
from app.models.medical_fact import MedicalFact, FactType, FactSourceType, VerificationStatus
from app.models.medication import Medication
from app.models.allergy import Allergy
from app.models.timeline import TimelineEvent, TimelineEventType
from app.models.risk import RiskAssessment, RiskPriority
from app.models.evidence import EvidenceSource
from app.models.verification import VerificationRecord
from app.models.queue import QueueItem, QueueStatus
from app.models.consent import Consent, ConsentPurpose
from app.models.handoff import ClinicalHandoff, HandoffPriority, HandoffStatus
from app.models.interoperability import InteroperabilityExport, DemoInteroperabilityTransaction
from app.services.audit_service import audit_service

router = APIRouter(prefix="/demo", tags=["SIH Demo Environment"])

DEMO_MRN_PREFIXES = ["MRN-102", "MRN-204", "MRN-309", "MRN-401", "MRN-501", "DEMO-"]
DEMO_PATIENT_NAMES = ["Ramesh Kumar", "Sita Devi", "Mohan Singh", "Anita Rao", "Vikram Patel"]


def _check_demo_mode():
    if not getattr(settings, "DEMO_MODE", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo controls are disabled in non-demo environment.",
        )


@router.post("/reset", response_model=ApiResponse[Dict[str, Any]])
def reset_demo_data(db: Session = Depends(get_db)):
    """
    Section 32: Reset ONLY synthetic demo data. Never deletes real production staff or departments.
    """
    _check_demo_mode()

    # Find demo patients
    demo_patients = db.query(Patient).filter(
        (Patient.hospital_id.like("MRN-102%")) |
        (Patient.hospital_id.like("MRN-204%")) |
        (Patient.hospital_id.like("MRN-309%")) |
        (Patient.hospital_id.like("MRN-401%")) |
        (Patient.hospital_id.like("MRN-501%")) |
        (Patient.hospital_id.like("DEMO-%")) |
        (Patient.name.in_(DEMO_PATIENT_NAMES))
    ).all()

    patient_ids = [p.id for p in demo_patients]

    if patient_ids:
        # Cascade delete dependent records
        db.query(InteroperabilityExport).filter(InteroperabilityExport.patient_id.in_(patient_ids)).delete(synchronize_session=False)
        db.query(DemoInteroperabilityTransaction).filter(DemoInteroperabilityTransaction.patient_id.in_(patient_ids)).delete(synchronize_session=False)
        db.query(ClinicalHandoff).filter(ClinicalHandoff.patient_id.in_(patient_ids)).delete(synchronize_session=False)
        db.query(Consent).filter(Consent.patient_id.in_(patient_ids)).delete(synchronize_session=False)
        db.query(ConsentRecord).filter(ConsentRecord.patient_id.in_(patient_ids)).delete(synchronize_session=False)
        db.query(QueueItem).filter(QueueItem.patient_id.in_(patient_ids)).delete(synchronize_session=False)
        db.query(VerificationRecord).filter(VerificationRecord.medical_fact_id.in_(
            db.query(MedicalFact.id).filter(MedicalFact.patient_id.in_(patient_ids))
        )).delete(synchronize_session=False)
        db.query(EvidenceSource).filter(EvidenceSource.medical_fact_id.in_(
            db.query(MedicalFact.id).filter(MedicalFact.patient_id.in_(patient_ids))
        )).delete(synchronize_session=False)
        db.query(TimelineEvent).filter(TimelineEvent.patient_id.in_(patient_ids)).delete(synchronize_session=False)
        db.query(RiskAssessment).filter(RiskAssessment.patient_id.in_(patient_ids)).delete(synchronize_session=False)
        db.query(Allergy).filter(Allergy.patient_id.in_(patient_ids)).delete(synchronize_session=False)
        db.query(Medication).filter(Medication.patient_id.in_(patient_ids)).delete(synchronize_session=False)
        db.query(MedicalFact).filter(MedicalFact.patient_id.in_(patient_ids)).delete(synchronize_session=False)

        # Delete document entities, pages, blocks, and docs
        doc_ids = [d.id for d in db.query(MedicalDocument).filter(MedicalDocument.patient_id.in_(patient_ids)).all()]
        if doc_ids:
            db.query(DocumentEntity).filter(DocumentEntity.document_id.in_(doc_ids)).delete(synchronize_session=False)
            db.query(OCRBlock).filter(OCRBlock.document_id.in_(doc_ids)).delete(synchronize_session=False)
            db.query(DocumentPage).filter(DocumentPage.document_id.in_(doc_ids)).delete(synchronize_session=False)
            db.query(MedicalDocument).filter(MedicalDocument.id.in_(doc_ids)).delete(synchronize_session=False)

        # Delete conversations and messages
        intake_ids = [i.id for i in db.query(IntakeSession).filter(IntakeSession.patient_id.in_(patient_ids)).all()]
        if intake_ids:
            conv_ids = [c.id for c in db.query(Conversation).filter(Conversation.intake_session_id.in_(intake_ids)).all()]
            if conv_ids:
                db.query(ConversationMessage).filter(ConversationMessage.conversation_id.in_(conv_ids)).delete(synchronize_session=False)
                db.query(Conversation).filter(Conversation.id.in_(conv_ids)).delete(synchronize_session=False)
            db.query(IntakeSession).filter(IntakeSession.id.in_(intake_ids)).delete(synchronize_session=False)

        # Finally delete demo patients
        db.query(Patient).filter(Patient.id.in_(patient_ids)).delete(synchronize_session=False)
        db.commit()

    audit_service.log_event(
        db=db,
        event_type="DEMO_DATA_RESET",
        actor_role="ADMIN",
        details={"deleted_patients_count": len(patient_ids), "environment": "SYNTHETIC DEMO ENVIRONMENT"},
    )

    return ApiResponse(
        data={
            "status": "ok",
            "deleted_patients_count": len(patient_ids),
            "environment": "SYNTHETIC DEMO ENVIRONMENT",
            "message": "Synthetic demo data wiped successfully. System ready for fresh presentation.",
        }
    )


@router.post("/preload", response_model=ApiResponse[Dict[str, Any]])
def preload_demo_data(db: Session = Depends(get_db)):
    """
    Section 33, 54, 57: Preloads the 5 canonical SIH demonstration test cases.
    """
    _check_demo_mode()

    # 1. First reset any stale demo records
    reset_demo_data(db)

    # 2. Ensure departments exist
    dept_cardio = db.query(Department).filter(Department.code == "CARD").first()
    if not dept_cardio:
        dept_cardio = Department(name="Cardiology", code="CARD", description="Cardiovascular Medicine", is_active=True)
        db.add(dept_cardio)
        db.commit()
        db.refresh(dept_cardio)

    dept_gen = db.query(Department).filter(Department.code == "GEN_MED").first()
    if not dept_gen:
        dept_gen = Department(name="General Medicine", code="GEN_MED", description="Internal Medicine", is_active=True)
        db.add(dept_gen)
        db.commit()
        db.refresh(dept_gen)

    # Doctor Dr. Rajesh Sharma
    doc_sharma = db.query(Doctor).first()

    # -------------------------------------------------------------------------
    # PATIENT 001: Ramesh Kumar (Main Complete Journey - Sections 34, 55)
    # -------------------------------------------------------------------------
    p1 = Patient(
        hospital_id="MRN-102948",
        name="Ramesh Kumar",
        age=54,
        gender="male",
        phone="+91-98765-43210",
        preferred_language="en",
        accessibility_mode=False,
        abha_reference="91-8273-1928-4451",
    )
    db.add(p1)
    db.commit()
    db.refresh(p1)

    intake1 = IntakeSession(
        patient_id=p1.id,
        department_id=dept_cardio.id,
        status=IntakeStatus.COMPLETED.value,
        language="en",
        started_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
    )
    db.add(intake1)
    db.commit()
    db.refresh(intake1)

    c1 = Consent(
        patient_id=p1.id,
        intake_id=intake1.id,
        purpose=ConsentPurpose.CLINICAL_INTAKE.value,
        scope=json.dumps(["history", "uploaded_documents", "structured_facts", "clinician_review"]),
        status="GRANTED",
        language="en",
    )
    db.add(c1)

    conv1 = Conversation(intake_session_id=intake1.id, language="en", status="COMPLETED")
    db.add(conv1)
    db.commit()
    db.refresh(conv1)

    m1_1 = ConversationMessage(conversation_id=conv1.id, role="ASSISTANT", content="Hello Ramesh. What brings you to the clinic today?", source="AI")
    m1_2 = ConversationMessage(conversation_id=conv1.id, role="PATIENT", content="I have chest discomfort since yesterday.", source="VOICE", metadata_json=json.dumps({"confidence": 0.96}))
    m1_3 = ConversationMessage(conversation_id=conv1.id, role="ASSISTANT", content="Can you rate the severity and describe any other symptoms?", source="AI")
    m1_4 = ConversationMessage(conversation_id=conv1.id, role="PATIENT", content="Severity is 8/10. It spreads to my left shoulder and I have shortness of breath.", source="VOICE", metadata_json=json.dumps({"confidence": 0.94}))
    m1_5 = ConversationMessage(conversation_id=conv1.id, role="ASSISTANT", content="Do you have prior medical conditions or take any medications?", source="AI")
    m1_6 = ConversationMessage(conversation_id=conv1.id, role="PATIENT", content="I have hypertension, I take amlodipine 5mg once daily, and I have a penicillin allergy.", source="VOICE", metadata_json=json.dumps({"confidence": 0.95}))
    db.add_all([m1_1, m1_2, m1_3, m1_4, m1_5, m1_6])
    db.commit()
    db.refresh(m1_4)

    # Documents for Ramesh: Discharge Summary + Lab Report
    doc1_rx = MedicalDocument(
        patient_id=p1.id,
        intake_session_id=intake1.id,
        file_name="CityClinic_Prescription_Cardiology.pdf",
        document_type=DocumentType.PRESCRIPTION.value,
        storage_path="documents/demo/CityClinic_Prescription_Cardiology.pdf",
        mime_type="application/pdf",
        document_date="2026-08-15",
        processing_status=ProcessingStatus.PROCESSED.value,
        ocr_status="COMPLETED",
        raw_text="Rx: Amlodipine 5mg OD for Essential Hypertension. Allergy Alert: Penicillin hypersensitivity.",
        extracted_facts_count=2,
    )
    doc1_lab = MedicalDocument(
        patient_id=p1.id,
        intake_session_id=intake1.id,
        file_name="MetroLabs_CompleteBloodCount.pdf",
        document_type=DocumentType.LAB_REPORT.value,
        storage_path="documents/demo/MetroLabs_CompleteBloodCount.pdf",
        mime_type="application/pdf",
        document_date="2026-09-02",
        processing_status=ProcessingStatus.PROCESSED.value,
        ocr_status="COMPLETED",
        raw_text="COMPLETE BLOOD COUNT: Hemoglobin: 10.2 g/dL (Reference Range: 13.0 - 17.0 g/dL) [ABNORMAL_LOW].",
        extracted_facts_count=1,
    )
    db.add_all([doc1_rx, doc1_lab])
    db.commit()
    db.refresh(doc1_rx)
    db.refresh(doc1_lab)

    # Facts for Ramesh
    f1_cc = MedicalFact(
        patient_id=p1.id,
        intake_session_id=intake1.id,
        fact_type=FactType.SYMPTOM.value,
        category="CHIEF_COMPLAINT",
        field="chief_complaint",
        value="Chest discomfort radiating to left shoulder with shortness of breath",
        normalized_value="Exertional Angina with Dyspnea",
        date="2026-09-06",
        confidence=0.96,
        source_type=FactSourceType.PATIENT_REPORTED.value,
        verification_status=VerificationStatus.NEEDS_VERIFICATION.value,
    )
    f1_sev = MedicalFact(
        patient_id=p1.id,
        intake_session_id=intake1.id,
        fact_type=FactType.SYMPTOM.value,
        category="SYMPTOM",
        field="severity",
        value="8/10",
        confidence=0.95,
        source_type=FactSourceType.PATIENT_REPORTED.value,
        verification_status=VerificationStatus.NEEDS_VERIFICATION.value,
    )
    f1_htn = MedicalFact(
        patient_id=p1.id,
        intake_session_id=intake1.id,
        fact_type=FactType.CONDITION.value,
        category="PAST_MEDICAL_HISTORY",
        field="hypertension",
        value="Hypertension",
        normalized_value="Essential Hypertension",
        confidence=0.98,
        source_type=FactSourceType.DOCUMENT_DERIVED.value,
        verification_status=VerificationStatus.DOCTOR_VERIFIED.value,
    )
    f1_med = MedicalFact(
        patient_id=p1.id,
        intake_session_id=intake1.id,
        fact_type=FactType.MEDICATION.value,
        category="MEDICATION",
        field="amlodipine",
        value="Amlodipine 5 mg once daily",
        normalized_value="Amlodipine 5mg OD",
        confidence=0.97,
        source_type=FactSourceType.DOCUMENT_DERIVED.value,
        verification_status=VerificationStatus.DOCTOR_VERIFIED.value,
    )
    f1_all = MedicalFact(
        patient_id=p1.id,
        intake_session_id=intake1.id,
        fact_type=FactType.ALLERGY.value,
        category="ALLERGY",
        field="penicillin",
        value="Penicillin (skin rash / hypersensitivity)",
        normalized_value="Penicillin",
        confidence=0.98,
        source_type=FactSourceType.PATIENT_REPORTED.value,
        verification_status=VerificationStatus.DOCTOR_VERIFIED.value,
    )
    f1_lab = MedicalFact(
        patient_id=p1.id,
        intake_session_id=intake1.id,
        fact_type=FactType.LAB.value,
        category="LAB_TEST",
        field="hemoglobin",
        value="Hemoglobin 10.2 g/dL (Reference Range: 13.0 - 17.0 g/dL)",
        normalized_value="Hemoglobin 10.2 g/dL",
        confidence=0.95,
        source_type=FactSourceType.DOCUMENT_DERIVED.value,
        verification_status=VerificationStatus.NEEDS_VERIFICATION.value,
    )
    db.add_all([f1_cc, f1_sev, f1_htn, f1_med, f1_all, f1_lab])
    db.commit()
    db.refresh(f1_cc)

    # Evidence sources for Ramesh
    ev1_voice = EvidenceSource(
        medical_fact_id=f1_cc.id,
        source_type="CONVERSATION",
        conversation_message_id=m1_4.id,
        source_label="Voice Intake Audio (Message #4)",
        source_excerpt="Severity is 8/10. It spreads to my left shoulder and I have shortness of breath.",
        confidence=0.95,
    )
    ev1_doc = EvidenceSource(
        medical_fact_id=f1_lab.id,
        source_type="DOCUMENT",
        document_id=doc1_lab.id,
        source_label="MetroLabs_CompleteBloodCount.pdf (Page 1)",
        source_excerpt="Hemoglobin: 10.2 g/dL (Reference Range: 13.0 - 17.0 g/dL) [ABNORMAL_LOW]",
        confidence=0.98,
    )
    db.add_all([ev1_voice, ev1_doc])

    # Abnormal Lab Entity
    de1_lab = DocumentEntity(
        document_id=doc1_lab.id,
        entity_type="LAB_TEST",
        name="Hemoglobin",
        value="10.2",
        unit="g/dL",
        reference_range="13.0 - 17.0 g/dL",
        abnormal_flag="ABNORMAL_LOW",
        clinician_advisory="Lab value (10.2 g/dL) outside displayed reference range (13.0 - 17.0 g/dL) — mild anemia suspected; clinician evaluation recommended.",
        confidence=0.96,
        source_text="Hemoglobin: 10.2 g/dL (Reference Range: 13.0 - 17.0 g/dL)",
        source_page=1,
    )
    db.add(de1_lab)

    # Risk Assessment for Ramesh
    risk1 = RiskAssessment(
        patient_id=p1.id,
        intake_session_id=intake1.id,
        priority=RiskPriority.HIGH_PRIORITY.value,
        reason="54M presenting with acute exertional chest pain (8/10) radiating to shoulder with dyspnea on background of HTN.",
        signals_json=json.dumps([
            {"signal": "Substernal radiating chest pressure (8/10)", "severity": "HIGH", "source": "Voice Intake"},
            {"signal": "Dyspnea on exertion", "severity": "HIGH", "source": "Voice Intake"},
            {"signal": "Known Hypertension on Amlodipine", "severity": "MODERATE", "source": "Prescription Record"},
            {"signal": "Mild Anemia (Hb 10.2 g/dL)", "severity": "LOW", "source": "Lab Report"},
        ]),
        source="Intake Cardiac Risk Engine",
    )
    db.add(risk1)

    # Handoff & Queue for Ramesh
    h1 = ClinicalHandoff(
        patient_id=p1.id,
        intake_id=intake1.id,
        priority=HandoffPriority.HIGH_PRIORITY_REVIEW.value,
        status=HandoffStatus.READY.value,
        assigned_to="Dr. Rajesh Sharma",
    )
    db.add(h1)

    q1 = QueueItem(
        patient_id=p1.id,
        intake_session_id=intake1.id,
        token_number="#102",
        department_id=dept_cardio.id,
        status=QueueStatus.AWAITING_TRIAGE.value,
        priority="HIGH_PRIORITY",
        assigned_doctor_id=doc_sharma.id if doc_sharma else None,
    )
    db.add(q1)

    # -------------------------------------------------------------------------
    # PATIENT 002: Sita Devi (Routine Headache - Section 33)
    # -------------------------------------------------------------------------
    p2 = Patient(hospital_id="MRN-204918", name="Sita Devi", age=38, gender="female", phone="+91-98111-22334", preferred_language="hi")
    db.add(p2)
    db.commit()
    db.refresh(p2)

    intake2 = IntakeSession(patient_id=p2.id, department_id=dept_gen.id, status=IntakeStatus.COMPLETED.value, language="hi")
    db.add(intake2)
    db.commit()
    db.refresh(intake2)

    f2_cc = MedicalFact(
        patient_id=p2.id,
        intake_session_id=intake2.id,
        fact_type=FactType.SYMPTOM.value,
        category="CHIEF_COMPLAINT",
        field="chief_complaint",
        value="Tension headache for 2 days without visual changes or vomiting",
        normalized_value="Tension Headache",
        confidence=0.95,
        source_type=FactSourceType.PATIENT_REPORTED.value,
        verification_status=VerificationStatus.DOCTOR_VERIFIED.value,
    )
    db.add(f2_cc)

    q2 = QueueItem(patient_id=p2.id, token_number="#103", department_id=dept_gen.id, status=QueueStatus.AWAITING_TRIAGE.value, priority="ROUTINE")
    db.add(q2)

    # -------------------------------------------------------------------------
    # PATIENT 003: Mohan Singh (Medication Allergy Conflict - Section 35)
    # -------------------------------------------------------------------------
    p3 = Patient(hospital_id="MRN-309182", name="Mohan Singh", age=47, gender="male", phone="+91-99223-34455", preferred_language="en")
    db.add(p3)
    db.commit()
    db.refresh(p3)

    intake3 = IntakeSession(patient_id=p3.id, department_id=dept_gen.id, status=IntakeStatus.COMPLETED.value, language="en")
    db.add(intake3)
    db.commit()
    db.refresh(intake3)

    # Conversation fact: 'No known drug allergies'
    f3_all = MedicalFact(
        patient_id=p3.id,
        intake_session_id=intake3.id,
        fact_type=FactType.ALLERGY.value,
        category="ALLERGY",
        field="allergy",
        value="No known drug allergies reported",
        normalized_value="NKDA",
        confidence=0.91,
        source_type=FactSourceType.PATIENT_REPORTED.value,
        conflict_status="CONFLICTED",
        verification_status=VerificationStatus.CONFLICTED.value,
    )
    db.add(f3_all)

    # Document fact: Penicillin allergy noted in record
    doc3 = MedicalDocument(
        patient_id=p3.id,
        intake_session_id=intake3.id,
        file_name="Prior_Clinic_Discharge_2023.pdf",
        document_type=DocumentType.DISCHARGE_SUMMARY.value,
        storage_path="documents/demo/Prior_Clinic_Discharge_2023.pdf",
        mime_type="application/pdf",
        processing_status=ProcessingStatus.PROCESSED.value,
        ocr_status="COMPLETED",
        raw_text="Documented hypersensitivity: Severe Penicillin allergy diagnosed post-treatment.",
        extracted_facts_count=1,
    )
    db.add(doc3)
    db.commit()
    db.refresh(doc3)

    de3 = DocumentEntity(
        document_id=doc3.id,
        entity_type="ALLERGY",
        name="Penicillin",
        value="Penicillin allergy documented with urticarial rash",
        confidence=0.98,
        source_text="Documented hypersensitivity: Severe Penicillin allergy diagnosed post-treatment.",
        source_page=1,
    )
    db.add(de3)

    q3 = QueueItem(patient_id=p3.id, token_number="#104", department_id=dept_gen.id, status=QueueStatus.AWAITING_TRIAGE.value, priority="NEEDS_ATTENTION")
    db.add(q3)

    # -------------------------------------------------------------------------
    # PATIENT 004: Anita Rao (Lab Abnormal-Value - Section 33)
    # -------------------------------------------------------------------------
    p4 = Patient(hospital_id="MRN-401923", name="Anita Rao", age=42, gender="female", phone="+91-97654-11223", preferred_language="en")
    db.add(p4)
    db.commit()
    db.refresh(p4)

    intake4 = IntakeSession(patient_id=p4.id, department_id=dept_gen.id, status=IntakeStatus.COMPLETED.value, language="en")
    db.add(intake4)
    db.commit()
    db.refresh(intake4)

    doc4 = MedicalDocument(
        patient_id=p4.id,
        intake_session_id=intake4.id,
        file_name="Pathology_Hemogram_Report.pdf",
        document_type=DocumentType.LAB_REPORT.value,
        storage_path="documents/demo/Pathology_Hemogram_Report.pdf",
        mime_type="application/pdf",
        processing_status=ProcessingStatus.PROCESSED.value,
        ocr_status="COMPLETED",
        raw_text="Hemoglobin: 8.4 g/dL (Reference: 12.0 - 15.5 g/dL) [CRITICAL_LOW]. Ferritin: 9 ng/mL.",
        extracted_facts_count=2,
    )
    db.add(doc4)
    db.commit()
    db.refresh(doc4)

    de4_hb = DocumentEntity(
        document_id=doc4.id,
        entity_type="LAB_TEST",
        name="Hemoglobin",
        value="8.4",
        unit="g/dL",
        reference_range="12.0 - 15.5 g/dL",
        abnormal_flag="ABNORMAL_LOW",
        clinician_advisory="Significant microcytic anemia detected (8.4 g/dL). Urgently correlate with peripheral smear and iron studies.",
        confidence=0.99,
        source_text="Hemoglobin: 8.4 g/dL (Reference: 12.0 - 15.5 g/dL)",
        source_page=1,
    )
    db.add(de4_hb)

    q4 = QueueItem(patient_id=p4.id, token_number="#105", department_id=dept_gen.id, status=QueueStatus.AWAITING_TRIAGE.value, priority="HIGH_PRIORITY")
    db.add(q4)

    # -------------------------------------------------------------------------
    # PATIENT 005: Vikram Patel (Incomplete Information / Unknown Onset - Section 36)
    # -------------------------------------------------------------------------
    p5 = Patient(hospital_id="MRN-501934", name="Vikram Patel", age=61, gender="male", phone="+91-98777-66554", preferred_language="en")
    db.add(p5)
    db.commit()
    db.refresh(p5)

    intake5 = IntakeSession(patient_id=p5.id, department_id=dept_gen.id, status=IntakeStatus.COMPLETED.value, language="en")
    db.add(intake5)
    db.commit()
    db.refresh(intake5)

    f5_cc = MedicalFact(
        patient_id=p5.id,
        intake_session_id=intake5.id,
        fact_type=FactType.SYMPTOM.value,
        category="CHIEF_COMPLAINT",
        field="chief_complaint",
        value="General fatigue and intermittent mild knee discomfort",
        normalized_value="Fatigue and Knee Arthralgia",
        confidence=0.92,
        source_type=FactSourceType.PATIENT_REPORTED.value,
        verification_status=VerificationStatus.DOCTOR_VERIFIED.value,
    )
    f5_onset = MedicalFact(
        patient_id=p5.id,
        intake_session_id=intake5.id,
        fact_type=FactType.SYMPTOM.value,
        category="SYMPTOM",
        field="onset",
        value="UNKNOWN",
        normalized_value="Not reported by patient",
        confidence=0.88,
        source_type=FactSourceType.PATIENT_REPORTED.value,
        verification_status=VerificationStatus.DOCTOR_VERIFIED.value,
    )
    db.add_all([f5_cc, f5_onset])

    q5 = QueueItem(patient_id=p5.id, token_number="#106", department_id=dept_gen.id, status=QueueStatus.AWAITING_TRIAGE.value, priority="ROUTINE")
    db.add(q5)

    db.commit()

    audit_service.log_event(
        db=db,
        event_type="DEMO_DATA_PRELOADED",
        actor_role="ADMIN",
        details={"preloaded_cases": 5, "primary_patient": "Ramesh Kumar (MRN-102948)"},
    )

    return ApiResponse(
        data={
            "status": "ok",
            "preloaded_count": 5,
            "environment": "SYNTHETIC DEMO ENVIRONMENT",
            "patients": [
                {"name": "Ramesh Kumar", "mrn": "MRN-102948", "token": "#102", "type": "Primary Full Journey (Chest Pain, HTN, Anemia)"},
                {"name": "Sita Devi", "mrn": "MRN-204918", "token": "#103", "type": "Routine Journey (Tension Headache)"},
                {"name": "Mohan Singh", "mrn": "MRN-309182", "token": "#104", "type": "Allergy Conflict (NKDA vs Penicillin record)"},
                {"name": "Anita Rao", "mrn": "MRN-401923", "token": "#105", "type": "Abnormal Lab (Hemoglobin 8.4 g/dL Critical Low)"},
                {"name": "Vikram Patel", "mrn": "MRN-501934", "token": "#106", "type": "Incomplete Info (Onset UNKNOWN / Not Reported)"},
            ],
            "message": "All 5 canonical SIH demonstration test cases successfully preloaded into the active database.",
        }
    )


@router.get("/patients", response_model=ApiResponse[List[Dict[str, Any]]])
def list_demo_patients(db: Session = Depends(get_db)):
    """Returns the list of 5 synthetic demo test cases."""
    _check_demo_mode()
    patients = db.query(Patient).filter(
        (Patient.hospital_id.like("MRN-102%")) |
        (Patient.hospital_id.like("MRN-204%")) |
        (Patient.hospital_id.like("MRN-309%")) |
        (Patient.hospital_id.like("MRN-401%")) |
        (Patient.hospital_id.like("MRN-501%"))
    ).all()

    result = []
    for p in patients:
        intake = db.query(IntakeSession).filter(IntakeSession.patient_id == p.id).first()
        queue = db.query(QueueItem).filter(QueueItem.patient_id == p.id).first()
        result.append({
            "id": p.id,
            "name": p.name,
            "mrn": p.hospital_id,
            "age": p.age,
            "gender": p.gender,
            "token": queue.token_number if queue else "#---",
            "priority": queue.priority if queue else "ROUTINE",
            "intake_id": intake.id if intake else None,
        })
    return ApiResponse(data=result)
