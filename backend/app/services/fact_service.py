from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.medical_fact import MedicalFact
from app.models.medication import Medication
from app.models.allergy import Allergy
from app.repositories.fact_repository import MedicalFactRepository, MedicationRepository, AllergyRepository
from app.schemas.medical_fact import MedicalFactCreate, MedicalFactUpdate
from app.schemas.medication import MedicationCreate
from app.schemas.allergy import AllergyCreate


class FactService:
    def __init__(self, db: Session):
        self.db = db
        self.fact_repo = MedicalFactRepository(db)
        self.med_repo = MedicationRepository(db)
        self.allergy_repo = AllergyRepository(db)

    def create_fact(self, fact_in: MedicalFactCreate) -> MedicalFact:
        fact = MedicalFact(
            patient_id=fact_in.patient_id,
            intake_session_id=fact_in.intake_session_id,
            fact_type=fact_in.fact_type,
            value=fact_in.value,
            normalized_value=fact_in.normalized_value,
            date=fact_in.date,
            confidence=fact_in.confidence,
            source_type=fact_in.source_type,
            verification_status=fact_in.verification_status,
        )
        return self.fact_repo.create(fact)

    def get_fact(self, fact_id: str) -> MedicalFact:
        fact = self.fact_repo.get_by_id(fact_id)
        if not fact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical fact not found",
            )
        return fact

    def get_patient_facts(self, patient_id: str, fact_type: Optional[str] = None) -> List[MedicalFact]:
        if fact_type:
            return self.fact_repo.get_by_fact_type(patient_id, fact_type)
        return self.fact_repo.get_by_patient_id(patient_id)

    def update_fact(self, fact_id: str, fact_in: MedicalFactUpdate) -> MedicalFact:
        fact = self.get_fact(fact_id)
        update_data = fact_in.model_dump(exclude_unset=True)
        return self.fact_repo.update(fact, update_data)

    def create_medication(self, med_in: MedicationCreate) -> Medication:
        med = Medication(
            patient_id=med_in.patient_id,
            name=med_in.name,
            dose=med_in.dose,
            unit=med_in.unit,
            frequency=med_in.frequency,
            duration=med_in.duration,
            start_date=med_in.start_date,
            end_date=med_in.end_date,
            source_fact_id=med_in.source_fact_id,
            confidence=med_in.confidence,
            verification_status=med_in.verification_status,
        )
        return self.med_repo.create(med)

    def get_patient_medications(self, patient_id: str) -> List[Medication]:
        return self.med_repo.get_by_patient_id(patient_id)

    def create_allergy(self, allergy_in: AllergyCreate) -> Allergy:
        allergy = Allergy(
            patient_id=allergy_in.patient_id,
            substance=allergy_in.substance,
            reaction=allergy_in.reaction,
            severity=allergy_in.severity,
            source_fact_id=allergy_in.source_fact_id,
            confidence=allergy_in.confidence,
            verification_status=allergy_in.verification_status,
        )
        return self.allergy_repo.create(allergy)

    def get_patient_allergies(self, patient_id: str) -> List[Allergy]:
        return self.allergy_repo.get_by_patient_id(patient_id)
