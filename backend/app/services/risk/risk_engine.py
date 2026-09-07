"""
Clinical Risk Engine for MediKiosk.

Evaluates safety signals and integrates with QueueItem priorities and Nurse/Triage alert queues.
Never diagnoses diseases; only flags potential safety concerns for clinician review.
"""

from typing import Dict, List, Any
import json
from sqlalchemy.orm import Session
from app.models.risk import RiskAssessment, RiskPriority
from app.models.queue import QueueItem, QueueStatus
from app.services.risk.risk_rules import evaluate_rules


class RiskEngine:
    def __init__(self, db: Session):
        self.db = db

    def evaluate_and_record(
        self,
        patient_id: str,
        intake_id: str,
        facts: List[Dict[str, Any]],
        patient_message: str = "",
    ) -> List[Dict[str, Any]]:
        """Evaluates clinical facts, creates RiskAssessment records, and escalates Queue priority if warranted."""
        detected_flags = evaluate_rules(facts, patient_message)
        if not detected_flags:
            return []

        # Determine overall priority
        is_immediate = any(f.get("severity") == "IMMEDIATE" for f in detected_flags)
        priority = RiskPriority.IMMEDIATE.value if is_immediate else RiskPriority.HIGH_PRIORITY.value

        reasons = [f["message"] for f in detected_flags]

        # Record in RiskAssessment table
        assessment = RiskAssessment(
            patient_id=patient_id,
            intake_session_id=intake_id,
            priority=priority,
            reason=" | ".join(reasons),
            signals_json=json.dumps(detected_flags),
            source="Clinical Safety Rule Engine (Deterministic)",
        )
        self.db.add(assessment)

        # Escalate QueueItem if present so Nurse/Triage Console displays priority badge
        queue_item = self.db.query(QueueItem).filter(
            QueueItem.intake_session_id == intake_id
        ).first()
        if queue_item:
            queue_item.priority = priority
            self.db.add(queue_item)

        self.db.commit()
        return detected_flags
