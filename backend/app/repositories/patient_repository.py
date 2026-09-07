from typing import Optional, List
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.repositories.base import BaseRepository


class PatientRepository(BaseRepository[Patient]):
    def __init__(self, db: Session):
        super().__init__(Patient, db)

    def get_by_hospital_id(self, hospital_id: str) -> Optional[Patient]:
        stmt = select(Patient).where(Patient.hospital_id == hospital_id)
        return self.db.execute(stmt).scalars().first()

    def get_by_phone(self, phone: str) -> Optional[Patient]:
        stmt = select(Patient).where(Patient.phone == phone)
        return self.db.execute(stmt).scalars().first()

    def get_by_abha_reference(self, abha_reference: str) -> Optional[Patient]:
        stmt = select(Patient).where(Patient.abha_reference == abha_reference)
        return self.db.execute(stmt).scalars().first()

    def search_patients(self, query: str, limit: int = 20) -> List[Patient]:
        search = f"%{query}%"
        stmt = select(Patient).where(
            or_(
                Patient.name.ilike(search),
                Patient.hospital_id.ilike(search),
                Patient.phone.ilike(search),
                Patient.abha_reference.ilike(search),
            )
        ).limit(limit)
        return list(self.db.execute(stmt).scalars().all())
