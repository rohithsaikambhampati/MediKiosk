"""
ABDM / FHIR Interoperability Endpoints for MediKiosk.

Provides FHIR R4 Bundle export, structural validation, and simulated demo submission.
Explicitly labeled as prototype/demo environment with zero false certification claims.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.interoperability import FHIRBundleResponse, DemoSubmissionRequest, DemoSubmissionResponse
from app.schemas.common import ApiResponse
from app.services.interoperability.fhir_export_service import FHIRExportService
from app.models.intake import IntakeSession

router = APIRouter(prefix="", tags=["Interoperability & FHIR"])


@router.get("/patients/{patient_id}/fhir", response_model=ApiResponse[Dict[str, Any]])
async def export_patient_fhir(
    patient_id: str,
    intake_id: Optional[str] = Query(None, description="Optional intake session filter"),
    db: Session = Depends(get_db)
):
    """
    Generates and returns a FHIR R4-compatible collection Bundle for a patient.
    Enforces explicit patient consent and preserves internal provenance.
    Labeled as 'FHIR-compatible demo export'.
    """
    service = FHIRExportService(db)
    bundle = await service.export_patient_fhir(patient_id=patient_id, intake_id=intake_id)
    return ApiResponse(
        data=bundle,
        message="FHIR-compatible demo export generated successfully (Prototype Environment).",
    )


@router.get("/intakes/{intake_id}/fhir", response_model=ApiResponse[Dict[str, Any]])
async def export_intake_fhir(
    intake_id: str,
    db: Session = Depends(get_db)
):
    """
    Generates and returns a FHIR R4-compatible collection Bundle for a specific intake session.
    """
    intake = db.query(IntakeSession).filter(IntakeSession.id == intake_id).first()
    if not intake:
        return ApiResponse(
            success=False,
            error={"code": "NOT_FOUND", "message": f"Intake session {intake_id} not found"},
        )

    service = FHIRExportService(db)
    bundle = await service.export_patient_fhir(patient_id=intake.patient_id, intake_id=intake_id)
    return ApiResponse(
        data=bundle,
        message="FHIR-compatible demo export for intake session generated successfully.",
    )


@router.post("/demo/interoperability/submit", response_model=ApiResponse[DemoSubmissionResponse])
def submit_demo_interoperability(
    sub_in: DemoSubmissionRequest,
    intake_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Simulates sending a FHIR bundle to an external health data exchange / ABDM gateway.
    Returns simulated acceptance status with a synthetic reference ID.
    """
    service = FHIRExportService(db)
    result = service.submit_demo_interoperability(
        patient_id=sub_in.patient_id,
        bundle=sub_in.bundle,
        intake_id=intake_id,
    )
    return ApiResponse(
        data=DemoSubmissionResponse(**result),
        message="Simulated interoperability submission accepted (Demo Environment).",
    )
