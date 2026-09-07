from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.doctor import Doctor
from app.models.nurse import Nurse
from app.models.admin import Admin
from app.models.department import Department
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_username(self, username: str) -> Optional[User]:
        stmt = select(User).where(User.username == username)
        return self.db.execute(stmt).scalars().first()

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return self.db.execute(stmt).scalars().first()

    def get_by_phone(self, phone: str) -> Optional[User]:
        stmt = select(User).where(User.phone == phone)
        return self.db.execute(stmt).scalars().first()

    def get_by_role(self, role: UserRole) -> List[User]:
        stmt = select(User).where(User.role == role)
        return list(self.db.execute(stmt).scalars().all())


class DoctorRepository(BaseRepository[Doctor]):
    def __init__(self, db: Session):
        super().__init__(Doctor, db)

    def get_by_user_id(self, user_id: str) -> Optional[Doctor]:
        stmt = select(Doctor).where(Doctor.user_id == user_id)
        return self.db.execute(stmt).scalars().first()

    def get_by_department(self, department_id: str) -> List[Doctor]:
        stmt = select(Doctor).where(Doctor.department_id == department_id)
        return list(self.db.execute(stmt).scalars().all())

    def get_active_doctors(self) -> List[Doctor]:
        stmt = select(Doctor).where(Doctor.is_active == True)
        return list(self.db.execute(stmt).scalars().all())


class NurseRepository(BaseRepository[Nurse]):
    def __init__(self, db: Session):
        super().__init__(Nurse, db)

    def get_by_user_id(self, user_id: str) -> Optional[Nurse]:
        stmt = select(Nurse).where(Nurse.user_id == user_id)
        return self.db.execute(stmt).scalars().first()

    def get_by_department(self, department_id: str) -> List[Nurse]:
        stmt = select(Nurse).where(Nurse.department_id == department_id)
        return list(self.db.execute(stmt).scalars().all())


class AdminRepository(BaseRepository[Admin]):
    def __init__(self, db: Session):
        super().__init__(Admin, db)

    def get_by_user_id(self, user_id: str) -> Optional[Admin]:
        stmt = select(Admin).where(Admin.user_id == user_id)
        return self.db.execute(stmt).scalars().first()


class DepartmentRepository(BaseRepository[Department]):
    def __init__(self, db: Session):
        super().__init__(Department, db)

    def get_by_code(self, code: str) -> Optional[Department]:
        stmt = select(Department).where(Department.code == code)
        return self.db.execute(stmt).scalars().first()
