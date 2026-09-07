from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.medical_fact import MedicalFactCreate, MedicalFactUpdate, MedicalFactResponse
from app.schemas.medication import MedicationCreate, MedicationResponse
from app.schemas.allergy import AllergyCreate, AllergyResponse
from app.schemas.common import ApiResponse
from app.services.fact_service import FactService

router = APIRouter(prefix="/facts", tags=["Facts & Clinical Entities"])


@router.post("", response_model=ApiResponse[MedicalFactResponse], status_code=status.HTTP_201_CREATED)
def create_fact(fact_in: MedicalFactCreate, db: Session = Depends(get_db)):
    service = FactService(db)
    fact = service.create_fact(fact_in)
    return ApiResponse(data=MedicalFactResponse.model_validate(fact))


@router.get("/patient/{patient_id}", response_model=ApiResponse[List[MedicalFactResponse]])
def get_patient_facts(
    patient_id: str,
    fact_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    service = FactService(db)
    facts = service.get_patient_facts(patient_id, fact_type=fact_type)
    return ApiResponse(data=[MedicalFactResponse.model_validate(f) for f in facts])


@router.get("/{fact_id}", response_model=ApiResponse[MedicalFactResponse])
def get_fact(fact_id: str, db: Session = Depends(get_db)):
    service = FactService(db)
    fact = service.get_fact(fact_id)
    return ApiResponse(data=MedicalFactResponse.model_validate(fact))


@router.patch("/{fact_id}", response_model=ApiResponse[MedicalFactResponse])
def update_fact(fact_id: str, fact_in: MedicalFactUpdate, db: Session = Depends(get_db)):
    service = FactService(db)
    fact = service.update_fact(fact_id, fact_in)
    return ApiResponse(data=MedicalFactResponse.model_validate(fact))


@router.post("/medications", response_model=ApiResponse[MedicationResponse], status_code=status.HTTP_201_CREATED)
def create_medication(med_in: MedicationCreate, db: Session = Depends(get_db)):
    service = FactService(db)
    med = service.create_medication(med_in)
    return ApiResponse(data=MedicationResponse.model_validate(med))


@router.get("/medications/patient/{patient_id}", response_model=ApiResponse[List[MedicationResponse]])
def get_patient_medications(patient_id: str, db: Session = Depends(get_db)):
    service = FactService(db)
    meds = service.get_patient_medications(patient_id)
    return ApiResponse(data=[MedicationResponse.model_validate(m) for m in meds])


@router.post("/allergies", response_model=ApiResponse[AllergyResponse], status_code=status.HTTP_201_CREATED)
def create_allergy(allergy_in: AllergyCreate, db: Session = Depends(get_db)):
    service = FactService(db)
    allergy = service.create_allergy(allergy_in)
    return ApiResponse(data=AllergyResponse.model_validate(allergy))


@router.get("/allergies/patient/{patient_id}", response_model=ApiResponse[List[AllergyResponse]])
def get_patient_allergies(patient_id: str, db: Session = Depends(get_db)):
    service = FactService(db)
    allergies = service.get_patient_allergies(patient_id)
    return ApiResponse(data=[AllergyResponse.model_validate(a) for a in allergies])
