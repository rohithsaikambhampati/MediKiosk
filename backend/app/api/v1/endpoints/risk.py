from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.risk import RiskAssessmentCreate, RiskAssessmentResponse
from app.schemas.common import ApiResponse
from app.services.risk_service import RiskService

router = APIRouter(prefix="/risk", tags=["Risk Stratification"])


@router.post("", response_model=ApiResponse[RiskAssessmentResponse], status_code=status.HTTP_201_CREATED)
def create_assessment(risk_in: RiskAssessmentCreate, db: Session = Depends(get_db)):
    service = RiskService(db)
    assessment = service.create_assessment(risk_in)
    return ApiResponse(data=RiskAssessmentResponse.model_validate(assessment))


@router.get("/patient/{patient_id}", response_model=ApiResponse[List[RiskAssessmentResponse]])
def get_patient_assessments(patient_id: str, db: Session = Depends(get_db)):
    service = RiskService(db)
    assessments = service.get_patient_assessments(patient_id)
    return ApiResponse(data=[RiskAssessmentResponse.model_validate(a) for a in assessments])


@router.get("/{assessment_id}", response_model=ApiResponse[RiskAssessmentResponse])
def get_assessment(assessment_id: str, db: Session = Depends(get_db)):
    service = RiskService(db)
    assessment = service.get_assessment(assessment_id)
    return ApiResponse(data=RiskAssessmentResponse.model_validate(assessment))
