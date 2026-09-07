import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.models.user import User, UserRole
from app.models.doctor import Doctor, DoctorStatus
from app.models.nurse import Nurse
from app.models.admin import Admin
from app.models.patient import Patient
from app.models.department import Department
from app.main import app

# In-memory SQLite engine for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator:
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session) -> Generator:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def doctor_user(db_session) -> User:
    dept = Department(name="Cardiology", code="CARD")
    db_session.add(dept)
    db_session.commit()
    db_session.refresh(dept)

    user = User(
        name="Dr. Test Specialist",
        email="dr.test@medikiosk.org",
        password_hash=get_password_hash("password123"),
        role=UserRole.DOCTOR.value,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    doc = Doctor(
        user_id=user.id,
        department_id=dept.id,
        specialty="Cardiology",
        room_number="Room 201",
        status=DoctorStatus.ACTIVE.value,
    )
    db_session.add(doc)
    db_session.commit()
    return user


@pytest.fixture(scope="function")
def nurse_user(db_session) -> User:
    user = User(
        name="Nurse Test Triage",
        email="nurse.test@medikiosk.org",
        password_hash=get_password_hash("password123"),
        role=UserRole.NURSE.value,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    nurse = Nurse(
        user_id=user.id,
        desk_name="Triage Desk 01",
        status="ACTIVE",
    )
    db_session.add(nurse)
    db_session.commit()
    return user


@pytest.fixture(scope="function")
def admin_user(db_session) -> User:
    user = User(
        name="Admin Test User",
        email="admin.test@medikiosk.org",
        password_hash=get_password_hash("password123"),
        role=UserRole.ADMIN.value,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    admin = Admin(
        user_id=user.id,
        designation="Super Admin",
    )
    db_session.add(admin)
    db_session.commit()
    return user


@pytest.fixture(scope="function")
def auth_headers_doctor(doctor_user: User) -> dict:
    token = create_access_token({
        "sub": doctor_user.id,
        "email": doctor_user.email,
        "role": doctor_user.role,
        "name": doctor_user.name,
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def auth_headers_nurse(nurse_user: User) -> dict:
    token = create_access_token({
        "sub": nurse_user.id,
        "email": nurse_user.email,
        "role": nurse_user.role,
        "name": nurse_user.name,
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def auth_headers_admin(admin_user: User) -> dict:
    token = create_access_token({
        "sub": admin_user.id,
        "email": admin_user.email,
        "role": admin_user.role,
        "name": admin_user.name,
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def test_patient(db_session) -> Patient:
    p = Patient(
        hospital_id="MRN-102948",
        name="Ramesh Kumar",
        gender="male",
        age=58,
        phone="+91-98765-43210",
        abha_reference="91-8273-1928-4451",
        preferred_language="hi",
    )
    db_session.add(p)
    db_session.commit()
    db_session.refresh(p)
    return p
