from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role
from app.schemas.audit import AuditEventResponse
from app.schemas.department import DepartmentResponse
from app.schemas.auth import UserResponse
from app.schemas.common import ApiResponse
from app.services.audit_service import AuditService
from app.repositories.user_repository import UserRepository, DepartmentRepository
from app.repositories.patient_repository import PatientRepository
from app.repositories.queue_repository import QueueRepository

router = APIRouter(
    prefix="/admin",
    tags=["Admin Portal"],
    dependencies=[Depends(require_role(["ADMIN"]))]
)


@router.get("/audit-logs", response_model=ApiResponse[List[AuditEventResponse]])
def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    actor_id: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    service = AuditService(db)
    events = service.get_audit_trail(actor_id=actor_id, resource_type=resource_type, limit=limit, skip=skip)
    return ApiResponse(data=[AuditEventResponse.model_validate(e) for e in events])


@router.get("/departments", response_model=ApiResponse[List[DepartmentResponse]])
def get_departments(db: Session = Depends(get_db)):
    dept_repo = DepartmentRepository(db)
    depts = dept_repo.get_all()
    return ApiResponse(data=[DepartmentResponse.model_validate(d) for d in depts])


@router.get("/users", response_model=ApiResponse[List[UserResponse]])
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    user_repo = UserRepository(db)
    users = user_repo.get_all(skip=skip, limit=limit)
    return ApiResponse(data=[UserResponse.model_validate(u) for u in users])


@router.get("/stats", response_model=ApiResponse)
def get_system_stats(db: Session = Depends(get_db)):
    patient_repo = PatientRepository(db)
    queue_repo = QueueRepository(db)
    user_repo = UserRepository(db)
    dept_repo = DepartmentRepository(db)

    return ApiResponse(data={
        "total_patients": patient_repo.count(),
        "active_queue_count": queue_repo.count(),
        "total_staff": user_repo.count(),
        "total_departments": dept_repo.count(),
    })
