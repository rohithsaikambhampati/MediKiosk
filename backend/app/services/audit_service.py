from typing import Optional, List, Dict, Any
import json
from sqlalchemy.orm import Session

from app.models.audit import AuditEvent
from app.repositories.audit_repository import AuditRepository


class AuditService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_repo = AuditRepository(db)

    def log(
        self,
        action: str,
        actor_user_id: Optional[str] = None,
        actor_role: str = "SYSTEM",
        resource_type: str = "SYSTEM",
        resource_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AuditEvent:
        return self.audit_repo.log_event(
            action=action,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=json.dumps(metadata) if metadata else None,
        )

    def get_audit_trail(
        self,
        actor_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> List[AuditEvent]:
        return self.audit_repo.get_events(
            actor_user_id=actor_id,
            resource_type=resource_type,
            resource_id=resource_id,
            limit=limit,
            skip=skip,
        )

    def log_event(
        self,
        db: Optional[Session] = None,
        event_type: str = "SYSTEM_EVENT",
        patient_id: Optional[str] = None,
        actor_role: str = "SYSTEM",
        details: Optional[Dict[str, Any]] = None,
    ) -> AuditEvent:
        target_db = db or self.db
        audit = AuditEvent(
            actor_role=actor_role,
            action=event_type,
            resource_type="PATIENT",
            resource_id=patient_id,
            metadata_json=json.dumps(details) if details else None,
        )
        if target_db:
            target_db.add(audit)
            target_db.commit()
            target_db.refresh(audit)
        return audit


audit_service = AuditService(None)

