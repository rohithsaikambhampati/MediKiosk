from typing import Optional, List
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.models.medical_fact import MedicalFact
from app.models.medication import Medication
from app.models.allergy import Allergy
from app.repositories.base import BaseRepository


class MedicalFactRepository(BaseRepository[MedicalFact]):
    def __init__(self, db: Session):
        super().__init__(MedicalFact, db)

    def get_by_patient_id(self, patient_id: str) -> List[MedicalFact]:
        stmt = select(MedicalFact).where(
            MedicalFact.patient_id == patient_id
        ).order_by(desc(MedicalFact.created_at))
        return list(self.db.execute(stmt).scalars().all())

    def get_by_intake_session_id(self, intake_session_id: str) -> List[MedicalFact]:
        stmt = select(MedicalFact).where(
            MedicalFact.intake_session_id == intake_session_id
        ).order_by(desc(MedicalFact.created_at))
        return list(self.db.execute(stmt).scalars().all())

    def get_by_fact_type(self, patient_id: str, fact_type: str) -> List[MedicalFact]:
        stmt = select(MedicalFact).where(
            MedicalFact.patient_id == patient_id,
            MedicalFact.fact_type == fact_type
        )
        return list(self.db.execute(stmt).scalars().all())


class MedicationRepository(BaseRepository[Medication]):
    def __init__(self, db: Session):
        super().__init__(Medication, db)

    def get_by_patient_id(self, patient_id: str) -> List[Medication]:
        stmt = select(Medication).where(Medication.patient_id == patient_id)
        return list(self.db.execute(stmt).scalars().all())


class AllergyRepository(BaseRepository[Allergy]):
    def __init__(self, db: Session):
        super().__init__(Allergy, db)

    def get_by_patient_id(self, patient_id: str) -> List[Allergy]:
        stmt = select(Allergy).where(Allergy.patient_id == patient_id)
        return list(self.db.execute(stmt).scalars().all())
