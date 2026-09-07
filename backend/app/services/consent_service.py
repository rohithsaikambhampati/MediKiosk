"""
Consent Management Service for MediKiosk.

Handles explicit, purpose-based consent with granular scopes, non-destructive withdrawal,
audit preservation, and access boundary checks.
"""

from typing import List, Optional, Dict, Any
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.consent import Consent, ConsentStatus, ConsentPurpose
from app.schemas.consent import ConsentCreate, ConsentResponse
from app.services.audit_service import audit_service


class ConsentService:
    def __init__(self, db: Session):
        self.db = db

    def create_consent(self, consent_in: ConsentCreate) -> Consent:
        """Records explicit purpose-based patient consent."""
        scope_json = json.dumps(consent_in.scope if consent_in.scope else ["history", "uploaded_documents", "structured_facts"])
        metadata_json = json.dumps(consent_in.metadata) if consent_in.metadata else None

        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=365)  # Default 1 year validity

        consent = Consent(
            patient_id=consent_in.patient_id,
            intake_id=consent_in.intake_id,
            purpose=consent_in.purpose,
            scope=scope_json,
            status=ConsentStatus.GRANTED.value,
            granted_at=now,
            expires_at=expires_at,
            language=consent_in.language,
            consent_method=consent_in.consent_method,
            consent_text_version=consent_in.consent_text_version,
            metadata_json=metadata_json,
        )
        self.db.add(consent)
        self.db.commit()
        self.db.refresh(consent)

        audit_service.log_event(
            db=self.db,
            event_type="CONSENT_GRANTED",
            patient_id=consent.patient_id,
            actor_role="PATIENT",
            details={
                "consent_id": consent.id,
                "intake_id": consent.intake_id,
                "purpose": consent.purpose,
                "scope": consent_in.scope,
                "version": consent.consent_text_version,
                "method": consent.consent_method,
            },
        )

        return consent

    def get_consent(self, consent_id: str) -> Consent:
        """Retrieves a consent record by ID."""
        consent = self.db.query(Consent).filter(Consent.id == consent_id).first()
        if not consent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Consent record {consent_id} not found",
            )
        return consent

    def get_patient_consents(self, patient_id: str) -> List[Consent]:
        """Retrieves all historical and active consents for a patient."""
        return (
            self.db.query(Consent)
            .filter(Consent.patient_id == patient_id)
            .order_by(Consent.created_at.desc())
            .all()
        )

    def withdraw_consent(self, consent_id: str, reason: Optional[str] = None) -> Consent:
        """
        Non-destructively marks consent as WITHDRAWN.
        Preserves audit history and prevents unauthorized downstream processing/sharing.
        """
        consent = self.get_consent(consent_id)

        if consent.status == ConsentStatus.WITHDRAWN.value:
            return consent  # Already withdrawn

        now = datetime.now(timezone.utc)
        consent.status = ConsentStatus.WITHDRAWN.value
        consent.withdrawn_at = now

        reason_text = getattr(reason, "reason", None) or (reason if isinstance(reason, str) else "Patient requested withdrawal")
        meta = json.loads(consent.metadata_json) if consent.metadata_json else {}
        meta["withdrawal_reason"] = reason_text
        consent.metadata_json = json.dumps(meta)

        self.db.commit()
        self.db.refresh(consent)

        audit_service.log_event(
            db=self.db,
            event_type="CONSENT_WITHDRAWN",
            patient_id=consent.patient_id,
            actor_role="PATIENT",
            details={
                "consent_id": consent.id,
                "intake_id": consent.intake_id,
                "purpose": consent.purpose,
                "reason": reason_text,
                "withdrawn_at": now.isoformat(),
            },
        )

        return consent

    def check_consent(self, patient_id: str, purpose: str, required_scope: Optional[str] = None) -> bool:
        """
        Validates if patient has an active GRANTED, non-expired consent
        covering the requested purpose and scope.
        """
        now = datetime.now(timezone.utc)
        consents = (
            self.db.query(Consent)
            .filter(
                Consent.patient_id == patient_id,
                Consent.purpose == purpose,
                Consent.status == ConsentStatus.GRANTED.value,
            )
            .all()
        )

        for c in consents:
            expires = c.expires_at
            if expires and expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)

            if expires and expires < now:
                # Mark expired
                c.status = ConsentStatus.EXPIRED.value
                self.db.commit()
                continue

            if required_scope:
                scopes = json.loads(c.scope) if c.scope else []
                if required_scope in scopes:
                    return True
            else:
                return True

        return False

    def to_response_dto(self, consent: Consent) -> ConsentResponse:
        """Formats SQLAlchemy model into Pydantic response DTO."""
        scope_list = json.loads(consent.scope) if consent.scope else []
        meta_dict = json.loads(consent.metadata_json) if consent.metadata_json else None

        return ConsentResponse(
            id=consent.id,
            patient_id=consent.patient_id,
            intake_id=consent.intake_id,
            purpose=consent.purpose,
            scope=scope_list,
            status=consent.status,
            granted_at=consent.granted_at,
            withdrawn_at=consent.withdrawn_at,
            expires_at=consent.expires_at,
            language=consent.language,
            consent_method=consent.consent_method,
            consent_text_version=consent.consent_text_version,
            metadata=meta_dict,
        )
