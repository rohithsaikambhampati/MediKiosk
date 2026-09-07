from typing import Optional, List, Dict, Any
import random
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.repositories.patient_repository import PatientRepository
from app.schemas.patient import PatientCreate, PatientUpdate


class PatientService:
    def __init__(self, db: Session):
        self.db = db
        self.patient_repo = PatientRepository(db)

    def generate_hospital_id(self) -> str:
        return f"MRN-{random.randint(100000, 999999)}"

    def create_patient(self, patient_in: PatientCreate) -> Patient:
        hospital_id = patient_in.hospital_id or self.generate_hospital_id()
        if self.patient_repo.get_by_hospital_id(hospital_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Patient with hospital ID / MRN {hospital_id} already exists",
            )

        patient = Patient(
            hospital_id=hospital_id,
            name=patient_in.name,
            gender=patient_in.gender,
            age=patient_in.age,
            phone=patient_in.phone,
            preferred_language=patient_in.preferred_language,
            accessibility_mode=patient_in.accessibility_mode,
            abha_reference=patient_in.abha_reference,
        )
        return self.patient_repo.create(patient)

    def get_patient_by_id(self, patient_id: str) -> Patient:
        patient = self.patient_repo.get_by_id(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )
        return patient

    def get_by_hospital_id(self, hospital_id: str) -> Optional[Patient]:
        return self.patient_repo.get_by_hospital_id(hospital_id)

    def get_by_phone(self, phone: str) -> Optional[Patient]:
        return self.patient_repo.get_by_phone(phone)

    def search_patients(self, query: str, limit: int = 20) -> List[Patient]:
        return self.patient_repo.search_patients(query, limit=limit)

    def update_patient(self, patient_id: str, patient_in: PatientUpdate) -> Patient:
        patient = self.get_patient_by_id(patient_id)
        update_data = patient_in.model_dump(exclude_unset=True)
        return self.patient_repo.update(patient, update_data)

    def list_patients(self, skip: int = 0, limit: int = 50) -> List[Patient]:
        return self.patient_repo.get_all(skip=skip, limit=limit)
