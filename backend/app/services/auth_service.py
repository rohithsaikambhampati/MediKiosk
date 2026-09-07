from datetime import timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User, UserRole
from app.models.doctor import Doctor, DoctorStatus
from app.models.nurse import Nurse
from app.models.admin import Admin
from app.repositories.user_repository import (
    UserRepository,
    DoctorRepository,
    NurseRepository,
    AdminRepository,
)
from app.schemas.auth import RegisterRequest, TokenResponse, UserResponse


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.doctor_repo = DoctorRepository(db)
        self.nurse_repo = NurseRepository(db)
        self.admin_repo = AdminRepository(db)

    def authenticate_user(self, email: str, password: str) -> User:
        user = self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )
        return user

    def create_user_token(self, user: User) -> TokenResponse:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        role_str = user.role.value if isinstance(user.role, UserRole) else str(user.role)
        token_payload = {
            "sub": user.id,
            "email": user.email,
            "role": role_str,
            "name": user.name,
        }
        access_token = create_access_token(
            data=token_payload, expires_delta=access_token_expires
        )
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            name=user.name,
            email=user.email,
            role=role_str,
            expires_in=int(access_token_expires.total_seconds()),
            user=UserResponse.model_validate(user),
        )

    def register_user(self, user_in: RegisterRequest) -> User:
        if self.user_repo.get_by_email(user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        hashed_password = get_password_hash(user_in.password)
        role_val = user_in.role.upper()
        db_user = User(
            name=user_in.name,
            email=user_in.email,
            password_hash=hashed_password,
            role=role_val,
            is_active=True,
        )
        user = self.user_repo.create(db_user)

        # Create corresponding role profile if applicable
        if role_val == "DOCTOR":
            doctor = Doctor(
                user_id=user.id,
                specialty="General Medicine",
                status=DoctorStatus.ACTIVE.value,
            )
            self.doctor_repo.create(doctor)
        elif role_val == "NURSE":
            nurse = Nurse(
                user_id=user.id,
                desk_name="Triage Desk 01",
                status="ACTIVE",
            )
            self.nurse_repo.create(nurse)
        elif role_val == "ADMIN":
            admin = Admin(
                user_id=user.id,
                designation="Administrator",
            )
            self.admin_repo.create(admin)

        return user

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self.user_repo.get_by_id(user_id)
