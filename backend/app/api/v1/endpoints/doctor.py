from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role
from app.models.user import UserRole
from app.models.queue import QueueStatus
from app.schemas.patient import PatientDetailResponse
from app.schemas.queue import QueueItemResponse, QueueItemUpdate
from app.schemas.common import ApiResponse
from app.services.patient_service import PatientService
from app.services.queue_service import QueueService
from app.services.fact_service import FactService
from app.services.timeline_service import TimelineService
from app.services.risk_service import RiskService
from app.services.document_service import DocumentService
from app.schemas.medical_fact import MedicalFactResponse
from app.schemas.medication import MedicationResponse
from app.schemas.allergy import AllergyResponse
from app.schemas.timeline import TimelineEventResponse
from app.schemas.risk import RiskAssessmentResponse
from app.schemas.document import DocumentResponse

router = APIRouter(
    prefix="/doctor",
    tags=["Doctor Workspace"],
    dependencies=[Depends(require_role(UserRole.DOCTOR, UserRole.ADMIN))]
)


@router.get("/workspace/{patient_id}", response_model=ApiResponse[PatientDetailResponse])
def get_unified_workspace(patient_id: str, db: Session = Depends(get_db)):
    patient_svc = PatientService(db)
    fact_svc = FactService(db)
    timeline_svc = TimelineService(db)
    risk_svc = RiskService(db)
    doc_svc = DocumentService(db)

    patient = patient_svc.get_patient_by_id(patient_id)
    facts = fact_svc.get_patient_facts(patient_id)
    medications = fact_svc.get_patient_medications(patient_id)
    allergies = fact_svc.get_patient_allergies(patient_id)
    timeline = timeline_svc.get_patient_timeline(patient_id)
    risks = risk_svc.get_patient_assessments(patient_id)
    documents = doc_svc.get_patient_documents(patient_id)

    detail_data = PatientDetailResponse(
        id=patient.id,
        hospital_id=patient.hospital_id,
        name=patient.name,
        gender=patient.gender,
        age=patient.age,
        phone=patient.phone,
        preferred_language=patient.preferred_language,
        accessibility_mode=patient.accessibility_mode,
        abha_reference=patient.abha_reference,
        created_at=patient.created_at,
        updated_at=patient.updated_at,
        facts=[MedicalFactResponse.model_validate(f) for f in facts],
        medications=[MedicationResponse.model_validate(m) for m in medications],
        allergies=[AllergyResponse.model_validate(a) for a in allergies],
        timeline=[TimelineEventResponse.model_validate(t) for t in timeline],
        risks=[RiskAssessmentResponse.model_validate(r) for r in risks],
        documents=[DocumentResponse.model_validate(d) for d in documents],
    )
    return ApiResponse(data=detail_data)


@router.post("/consultation/{queue_id}/start", response_model=ApiResponse[QueueItemResponse])
def start_doctor_consultation(queue_id: str, db: Session = Depends(get_db)):
    service = QueueService(db)
    item = service.update_queue_item(queue_id, QueueItemUpdate(status=QueueStatus.CONSULTATION.value))
    return ApiResponse(data=QueueItemResponse.model_validate(item))


@router.post("/consultation/{queue_id}/complete", response_model=ApiResponse[QueueItemResponse])
def complete_doctor_consultation(queue_id: str, db: Session = Depends(get_db)):
    service = QueueService(db)
    item = service.update_queue_item(queue_id, QueueItemUpdate(status=QueueStatus.COMPLETED.value))
    return ApiResponse(data=QueueItemResponse.model_validate(item))


@router.get("/patients/{patient_id}/story", response_model=ApiResponse)
async def get_doctor_patient_story(patient_id: str, db: Session = Depends(get_db)):
    from app.services.patient_story.story_generator import PatientStoryGenerator
    generator = PatientStoryGenerator(db)
    story = await generator.generate_story(patient_id=patient_id)
    return ApiResponse(data=story)

