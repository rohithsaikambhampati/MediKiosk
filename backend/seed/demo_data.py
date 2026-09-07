"""
Demo seed data script for MediKiosk.
Populates complete, realistic synthetic data matching the frontend patient workflows:
- Ramesh Kumar (MRN: MRN-102948 / Token #102, Cardiology, Dr. Rajesh Sharma)
- Sita Devi (MRN: MRN-204918 / Token #103, Orthopedics)
- Mohan Singh (MRN: MRN-309182 / Token #104, General Medicine, Dr. Ananya Iyer)
"""

import sys
import os
import json
from datetime import datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.department import Department
from app.models.doctor import Doctor, DoctorStatus
from app.models.nurse import Nurse
from app.models.admin import Admin
from app.models.patient import Patient
from app.models.intake import IntakeSession, ConsentRecord, IntakeStatus
from app.models.conversation import Conversation, ConversationMessage
from app.models.document import MedicalDocument, DocumentType, ProcessingStatus
from app.models.medical_fact import MedicalFact, FactType, FactSourceType, VerificationStatus
from app.models.medication import Medication
from app.models.allergy import Allergy
from app.models.timeline import TimelineEvent, TimelineEventType
from app.models.risk import RiskAssessment, RiskPriority
from app.models.evidence import EvidenceSource
from app.models.verification import VerificationRecord
from app.models.queue import QueueItem, QueueStatus


def seed_database():
    print("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.email == "dr.rajesh@medikiosk.org").first()
        if existing_user:
            print("Database already contains seed data. Skipping re-seed.")
            return

        print("Seeding Departments...")
        dept_cardio = Department(
            name="Cardiology",
            code="CARD",
            description="Cardiovascular Medicine & Interventional Cardiology",
            is_active=True,
        )
        dept_gen = Department(
            name="General Medicine",
            code="GEN_MED",
            description="Internal Medicine and Primary Care",
            is_active=True,
        )
        dept_ortho = Department(
            name="Orthopedics",
            code="ORTHO",
            description="Bone and Joint Specialist Clinic",
            is_active=True,
        )
        db.add_all([dept_cardio, dept_gen, dept_ortho])
        db.commit()
        db.refresh(dept_cardio)
        db.refresh(dept_gen)
        db.refresh(dept_ortho)

        print("Seeding Users & Staff...")
        default_pwd = get_password_hash("password123")

        # Doctor 1: Dr. Rajesh Sharma
        user_doc1 = User(
            name="Dr. Rajesh Sharma",
            email="dr.rajesh@medikiosk.org",
            password_hash=default_pwd,
            role=UserRole.DOCTOR.value,
            is_active=True,
        )
        db.add(user_doc1)
        db.commit()
        db.refresh(user_doc1)

        doc1 = Doctor(
            user_id=user_doc1.id,
            department_id=dept_cardio.id,
            hospital_id="DOC-CARD-01",
            specialty="Cardiologist",
            room_number="Room #04",
            status=DoctorStatus.ACTIVE.value,
        )
        db.add(doc1)

        # Doctor 2: Dr. Ananya Iyer
        user_doc2 = User(
            name="Dr. Ananya Iyer",
            email="dr.ananya@medikiosk.org",
            password_hash=default_pwd,
            role=UserRole.DOCTOR.value,
            is_active=True,
        )
        db.add(user_doc2)
        db.commit()
        db.refresh(user_doc2)

        doc2 = Doctor(
            user_id=user_doc2.id,
            department_id=dept_gen.id,
            hospital_id="DOC-GEN-02",
            specialty="General Physician",
            room_number="Room #02",
            status=DoctorStatus.ACTIVE.value,
        )
        db.add(doc2)

        # Nurse: Nurse Priya Nair (Triage Desk 02)
        user_nurse = User(
            name="Nurse Priya Nair",
            email="nurse.priya@medikiosk.org",
            password_hash=default_pwd,
            role=UserRole.NURSE.value,
            is_active=True,
        )
        db.add(user_nurse)
        db.commit()
        db.refresh(user_nurse)

        nurse1 = Nurse(
            user_id=user_nurse.id,
            department_id=dept_gen.id,
            desk_name="Triage Desk 02",
            status="ACTIVE",
        )
        db.add(nurse1)

        # Admin: System Admin
        user_admin = User(
            name="Hospital IT Administrator",
            email="admin@medikiosk.org",
            password_hash=default_pwd,
            role=UserRole.ADMIN.value,
            is_active=True,
        )
        db.add(user_admin)
        db.commit()
        db.refresh(user_admin)

        admin_profile = Admin(
            user_id=user_admin.id,
            designation="Hospital IT & Clinical Systems Lead",
        )
        db.add(admin_profile)
        db.commit()

        print("Seeding Patients...")
        p1 = Patient(
            hospital_id="MRN-102948",
            name="Ramesh Kumar",
            age=58,
            gender="male",
            phone="+91-98765-43210",
            preferred_language="hi",
            accessibility_mode=True,
            abha_reference="91-8273-1928-4451",
        )
        p2 = Patient(
            hospital_id="MRN-204918",
            name="Sita Devi",
            age=62,
            gender="female",
            phone="+91-98111-22334",
            preferred_language="hi",
            accessibility_mode=False,
            abha_reference="91-4412-9012-7721",
        )
        p3 = Patient(
            hospital_id="MRN-309182",
            name="Mohan Singh",
            age=45,
            gender="male",
            phone="+91-99223-34455",
            preferred_language="en",
            accessibility_mode=False,
            abha_reference="91-6671-3321-9908",
        )
        db.add_all([p1, p2, p3])
        db.commit()
        db.refresh(p1)
        db.refresh(p2)
        db.refresh(p3)

        print("Seeding Intake Session, Consent, and Conversation for Ramesh Kumar...")
        intake_ramesh = IntakeSession(
            patient_id=p1.id,
            department_id=dept_cardio.id,
            status=IntakeStatus.COMPLETED.value,
            language="hi",
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
        )
        db.add(intake_ramesh)
        db.commit()
        db.refresh(intake_ramesh)

        consent = ConsentRecord(
            patient_id=p1.id,
            intake_session_id=intake_ramesh.id,
            voice_consent=True,
            document_consent=True,
            ai_processing_consent=True,
            hospital_sharing_consent=True,
            abha_consent=True,
        )
        db.add(consent)

        conv = Conversation(
            intake_session_id=intake_ramesh.id,
            language="hi",
            status="COMPLETED",
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

        msg1 = ConversationMessage(
            conversation_id=conv.id,
            role="ASSISTANT",
            content="नमस्ते रमेश जी। कृपया बताइए आज आपको क्या तकलीफ हो रही है?",
            source="AI",
        )
        msg2 = ConversationMessage(
            conversation_id=conv.id,
            role="PATIENT",
            content="मुझे पिछले तीन दिनों से सीने में भारीपन महसूस हो रहा है और सीढ़ियाँ चढ़ते समय सांस फूलती है।",
            source="VOICE",
            metadata_json=json.dumps({"confidence": 0.94, "audio_length": 4.2}),
        )
        msg3 = ConversationMessage(
            conversation_id=conv.id,
            role="ASSISTANT",
            content="क्या यह दर्द आपके बाएं हाथ या कंधे की तरफ भी जाता है?",
            source="AI",
        )
        msg4 = ConversationMessage(
            conversation_id=conv.id,
            role="PATIENT",
            content="हाँ, थोड़ा सा बाएं कंधे में भारीपन महसूस होता है।",
            source="VOICE",
            metadata_json=json.dumps({"confidence": 0.92, "audio_length": 3.1}),
        )
        db.add_all([msg1, msg2, msg3, msg4])
        db.commit()
        db.refresh(msg2)

        print("Seeding Documents & Clinical Facts...")
        med_doc1 = MedicalDocument(
            patient_id=p1.id,
            intake_session_id=intake_ramesh.id,
            file_name="CityHospital_DischargeSummary.pdf",
            document_type=DocumentType.DISCHARGE_SUMMARY.value,
            storage_path="documents/patient-ramesh-01/CityHospital_DischargeSummary.pdf",
            mime_type="application/pdf",
            document_date="2024-03-12",
            processing_status=ProcessingStatus.PROCESSED.value,
            ocr_status="COMPLETED",
            extracted_facts_count=3,
        )
        db.add(med_doc1)
        db.commit()
        db.refresh(med_doc1)

        f1 = MedicalFact(
            patient_id=p1.id,
            intake_session_id=intake_ramesh.id,
            fact_type=FactType.SYMPTOM.value,
            value="Chest heaviness radiating to left shoulder on exertion",
            normalized_value="Exertional Angina",
            date="2026-09-04",
            confidence=0.92,
            source_type=FactSourceType.PATIENT_REPORTED.value,
            verification_status=VerificationStatus.DOCTOR_VERIFIED.value,
        )
        f2 = MedicalFact(
            patient_id=p1.id,
            intake_session_id=intake_ramesh.id,
            fact_type=FactType.CONDITION.value,
            value="Essential Hypertension (Stage 2)",
            normalized_value="Hypertension",
            date="2021-06-15",
            confidence=0.98,
            source_type=FactSourceType.DOCUMENT_DERIVED.value,
            verification_status=VerificationStatus.DOCTOR_VERIFIED.value,
        )
        f3 = MedicalFact(
            patient_id=p1.id,
            intake_session_id=intake_ramesh.id,
            fact_type=FactType.CONDITION.value,
            value="Type 2 Diabetes Mellitus",
            normalized_value="Diabetes Mellitus Type 2",
            date="2022-01-10",
            confidence=0.96,
            source_type=FactSourceType.DOCUMENT_DERIVED.value,
            verification_status=VerificationStatus.DOCTOR_VERIFIED.value,
        )
        db.add_all([f1, f2, f3])
        db.commit()
        db.refresh(f1)
        db.refresh(f2)
        db.refresh(f3)

        ev1 = EvidenceSource(
            medical_fact_id=f1.id,
            source_type="CONVERSATION",
            conversation_message_id=msg2.id,
            source_label="Voice Dialogue (Kiosk Intake)",
            source_excerpt="Patient stated chest tightness spreading to the left shoulder.",
            confidence=0.94,
        )
        ev2 = EvidenceSource(
            medical_fact_id=f2.id,
            source_type="DOCUMENT",
            document_id=med_doc1.id,
            source_label="CityHospital_DischargeSummary.pdf (Page 2)",
            source_excerpt="Primary Diagnosis: Stage 2 Hypertension. Prescribed Telmisartan 40mg OD.",
            confidence=0.98,
        )
        db.add_all([ev1, ev2])

        ver1 = VerificationRecord(
            medical_fact_id=f1.id,
            reviewed_by="Dr. Rajesh Sharma",
            previous_status="NEEDS_VERIFICATION",
            new_status="DOCTOR_VERIFIED",
            previous_value="Chest discomfort",
            new_value="Chest heaviness radiating to left shoulder on exertion",
            reason="Confirmed during clinical interrogation",
        )
        db.add(ver1)

        med1 = Medication(
            patient_id=p1.id,
            name="Metformin",
            dose="500",
            unit="mg",
            frequency="BD",
            duration="Ongoing",
            source_fact_id=f3.id,
            confidence=0.96,
            verification_status="DOCTOR_VERIFIED",
        )
        med2 = Medication(
            patient_id=p1.id,
            name="Telmisartan",
            dose="40",
            unit="mg",
            frequency="OD",
            duration="Ongoing",
            source_fact_id=f2.id,
            confidence=0.98,
            verification_status="DOCTOR_VERIFIED",
        )
        db.add_all([med1, med2])

        allergy1 = Allergy(
            patient_id=p1.id,
            substance="Penicillin",
            reaction="Skin rash and facial swelling",
            severity="severe",
            confidence=0.99,
            verification_status="DOCTOR_VERIFIED",
        )
        db.add(allergy1)

        t1 = TimelineEvent(
            patient_id=p1.id,
            date="2021-06-15",
            event_type=TimelineEventType.CONDITION.value,
            title="Hypertension Diagnosed",
            description="Diagnosed with Stage 2 Essential Hypertension; started on Telmisartan 40mg.",
            source_fact_id=f2.id,
            confidence=0.98,
        )
        t2 = TimelineEvent(
            patient_id=p1.id,
            date="2024-03-12",
            event_type=TimelineEventType.HOSPITALIZATION.value,
            title="Discharge from City Hospital",
            description="Managed for glycemic spike; advised lifestyle modification and regular cardiology checkup.",
            confidence=0.95,
        )
        t3 = TimelineEvent(
            patient_id=p1.id,
            date="2026-09-04",
            event_type=TimelineEventType.PATIENT_REPORTED.value,
            title="Chest Heaviness Onset",
            description="Onset of sub-sternal exertional discomfort radiating to left shoulder.",
            source_fact_id=f1.id,
            confidence=0.92,
        )
        db.add_all([t1, t2, t3])

        risk1 = RiskAssessment(
            patient_id=p1.id,
            intake_session_id=intake_ramesh.id,
            priority=RiskPriority.HIGH_PRIORITY.value,
            reason="58M with HTN and T2DM presenting with new exertional chest tightness radiating to shoulder.",
            signals_json=json.dumps([
                {"signal": "Exertional chest tightness", "severity": "HIGH", "source": "Kiosk Voice"},
                {"signal": "Comorbid Hypertension + Diabetes", "severity": "MODERATE", "source": "Prior Records"}
            ]),
            source="Intake Cardiac Risk Stratifier",
        )
        db.add(risk1)

        print("Seeding Queue Items...")
        q1 = QueueItem(
            patient_id=p1.id,
            intake_session_id=intake_ramesh.id,
            token_number="#102",
            department_id=dept_cardio.id,
            status=QueueStatus.AWAITING_TRIAGE.value,
            priority="HIGH_PRIORITY",
            assigned_doctor_id=doc1.id,
        )
        q2 = QueueItem(
            patient_id=p2.id,
            token_number="#103",
            department_id=dept_ortho.id,
            status=QueueStatus.AWAITING_TRIAGE.value,
            priority="ROUTINE",
        )
        q3 = QueueItem(
            patient_id=p3.id,
            token_number="#104",
            department_id=dept_gen.id,
            status=QueueStatus.AWAITING_TRIAGE.value,
            priority="NEEDS_ATTENTION",
            assigned_doctor_id=doc2.id,
        )
        db.add_all([q1, q2, q3])
        db.commit()

        print("Demo seed data successfully created!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
