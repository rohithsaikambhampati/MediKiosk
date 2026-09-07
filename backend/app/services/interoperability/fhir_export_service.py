"""
FHIR Export and Demo Interoperability Service for MediKiosk.

Coordinates consent enforcement, bundle assembly, structural validation,
export persistence, and simulated exchange submission.
"""

from typing import Dict, Any, Optional
import json
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.interoperability import InteroperabilityExport, DemoInteroperabilityTransaction
from app.models.consent import ConsentPurpose
from app.services.interoperability.fhir_mapper import FHIRMapper
from app.services.interoperability.fhir_validator import fhir_validator
from app.services.consent_service import ConsentService
from app.services.audit_service import audit_service


class FHIRExportService:
    def __init__(self, db: Session):
        self.db = db
        self.mapper = FHIRMapper(db)
        self.consent_svc = ConsentService(db)

    async def export_patient_fhir(self, patient_id: str, intake_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates, validates, and records a FHIR R4 Bundle export for a patient.
        Enforces consent checks and logs compliance audit events.
        """
        # Check if consent was explicitly withdrawn
        patient_consents = self.consent_svc.get_patient_consents(patient_id)
        withdrawn_export_consents = [
            c for c in patient_consents
            if c.purpose in [ConsentPurpose.INTEROPERABILITY_EXPORT.value, ConsentPurpose.CLINICAL_INTAKE.value]
            and c.status == "WITHDRAWN"
        ]
        if withdrawn_export_consents:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Interoperability export denied: Patient has withdrawn consent for data sharing / export.",
            )

        # Assemble FHIR Bundle
        bundle = await self.mapper.build_bundle(patient_id=patient_id, intake_id=intake_id)

        # Validate bundle
        val_result = fhir_validator.validate_bundle(bundle)

        # Record export transaction in database
        export_record = InteroperabilityExport(
            patient_id=patient_id,
            intake_id=intake_id,
            export_type="FHIR_BUNDLE_R4",
            bundle_json=json.dumps(bundle),
            is_valid=val_result.is_valid,
            validation_errors=json.dumps(val_result.errors) if val_result.errors else None,
        )
        self.db.add(export_record)
        self.db.commit()
        self.db.refresh(export_record)

        audit_service.log_event(
            db=self.db,
            event_type="FHIR_EXPORT_CREATED",
            patient_id=patient_id,
            actor_role="CLINICIAN",
            details={
                "export_id": export_record.id,
                "bundle_id": bundle.get("id"),
                "resource_count": len(bundle.get("entry", [])),
                "is_valid": val_result.is_valid,
                "error_count": len(val_result.errors),
            },
        )

        # Return bundle with validation results attached
        return {
            **bundle,
            "validation": {
                "is_valid": val_result.is_valid,
                "errors": val_result.errors,
                "warnings": val_result.warnings,
            },
        }

    def submit_demo_interoperability(self, patient_id: str, bundle: Dict[str, Any], intake_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Simulates submission to an external ABDM / HL7 FHIR health repository.
        Creates a demo transaction record with a synthetic reference ID.
        """
        ref_id = f"DEMO-INT-{uuid.uuid4().hex[:8].upper()}"
        res_count = len(bundle.get("entry", [])) if isinstance(bundle, dict) else 0

        tx = DemoInteroperabilityTransaction(
            reference_id=ref_id,
            patient_id=patient_id,
            intake_id=intake_id,
            status="accepted",
            mode="demo",
            message="Simulated interoperability submission.",
            payload_summary=f"FHIR Bundle R4 with {res_count} resources",
        )
        self.db.add(tx)
        self.db.commit()
        self.db.refresh(tx)

        audit_service.log_event(
            db=self.db,
            event_type="DEMO_INTEROPERABILITY_SUBMITTED",
            patient_id=patient_id,
            actor_role="CLINICIAN",
            details={
                "reference_id": ref_id,
                "transaction_id": tx.id,
                "status": tx.status,
                "mode": tx.mode,
                "resource_count": res_count,
            },
        )

        return {
            "status": "accepted",
            "mode": "demo",
            "reference_id": ref_id,
            "message": "Simulated interoperability submission.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "resource_count": res_count,
        }
