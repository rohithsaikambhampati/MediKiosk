from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse, PatientDetailResponse
from app.schemas.common import ApiResponse
from app.schemas.medical_fact import MedicalFactResponse
from app.schemas.medication import MedicationResponse
from app.schemas.allergy import AllergyResponse
from app.schemas.timeline import TimelineEventResponse
from app.schemas.risk import RiskAssessmentResponse
from app.schemas.document import DocumentResponse
from app.services.patient_service import PatientService
from app.services.fact_service import FactService
from app.services.timeline_service import TimelineService
from app.services.risk_service import RiskService
from app.services.document_service import DocumentService

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("", response_model=ApiResponse[PatientResponse], status_code=status.HTTP_201_CREATED)
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    service = PatientService(db)
    patient = service.create_patient(patient_in)
    return ApiResponse(data=PatientResponse.model_validate(patient))


@router.get("", response_model=ApiResponse[List[PatientResponse]])
def list_or_search_patients(
    query: Optional[str] = Query(None, description="Search query by name, MRN, phone, ABHA"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    service = PatientService(db)
    if query:
        patients = service.search_patients(query, limit=limit)
    else:
        patients = service.list_patients(skip=skip, limit=limit)
    return ApiResponse(data=[PatientResponse.model_validate(p) for p in patients])


@router.get("/{patient_id}", response_model=ApiResponse[PatientResponse])
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    service = PatientService(db)
    patient = service.get_patient_by_id(patient_id)
    return ApiResponse(data=PatientResponse.model_validate(patient))


@router.patch("/{patient_id}", response_model=ApiResponse[PatientResponse])
def update_patient(patient_id: str, patient_in: PatientUpdate, db: Session = Depends(get_db)):
    service = PatientService(db)
    patient = service.update_patient(patient_id, patient_in)
    return ApiResponse(data=PatientResponse.model_validate(patient))


@router.get("/{patient_id}/full-profile", response_model=ApiResponse[PatientDetailResponse])
def get_patient_full_profile(patient_id: str, db: Session = Depends(get_db)):
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


@router.get("/{patient_id}/story", response_model=ApiResponse)
async def get_patient_story(patient_id: str, db: Session = Depends(get_db)):
    from app.services.patient_story.story_generator import PatientStoryGenerator
    generator = PatientStoryGenerator(db)
    story = await generator.generate_story(patient_id=patient_id)
    return ApiResponse(data=story)

