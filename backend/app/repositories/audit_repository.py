from typing import Optional, List
import json
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent
from app.repositories.base import BaseRepository


class AuditRepository(BaseRepository[AuditEvent]):
    def __init__(self, db: Session):
        super().__init__(AuditEvent, db)

    def log_event(
        self,
        action: str,
        actor_user_id: Optional[str] = None,
        actor_role: str = "SYSTEM",
        resource_type: str = "SYSTEM",
        resource_id: Optional[str] = None,
        metadata_json: Optional[str] = None,
    ) -> AuditEvent:
        event = AuditEvent(
            action=action,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=metadata_json,
        )
        return self.create(event)

    def get_events(
        self,
        actor_user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> List[AuditEvent]:
        stmt = select(AuditEvent)
        if actor_user_id:
            stmt = stmt.where(AuditEvent.actor_user_id == actor_user_id)
        if resource_type:
            stmt = stmt.where(AuditEvent.resource_type == resource_type)
        if resource_id:
            stmt = stmt.where(AuditEvent.resource_id == resource_id)

        stmt = stmt.order_by(desc(AuditEvent.created_at)).offset(skip).limit(limit)
        return list(self.db.execute(stmt).scalars().all())
