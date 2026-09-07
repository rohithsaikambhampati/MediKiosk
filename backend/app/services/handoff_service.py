"""
Clinical Handoff Service for MediKiosk.

Coordinates the transition from Kiosk Intake through Nurse Triage to Doctor Consultation.
Evaluates deterministic safety signals to assign workflow priorities without making clinical diagnoses.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.handoff import ClinicalHandoff, HandoffStatus, WorkflowPriority
from app.models.risk import RiskAssessment, RiskPriority
from app.models.medical_fact import MedicalFact
from app.schemas.handoff import HandoffCreate, HandoffAssign, HandoffReview, HandoffResponse
from app.services.audit_service import audit_service


class HandoffService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_workflow_priority(self, patient_id: str, intake_id: str) -> str:
        """
        Determines workflow priority based on deterministic safety signals.
        Principle: Workflow priority based on detected safety signals, NEVER an automated diagnosis.
        """
        risks = (
            self.db.query(RiskAssessment)
            .filter(RiskAssessment.patient_id == patient_id)
            .all()
        )

        has_high_risk = any(
            (getattr(r, "priority", None) or getattr(r, "severity", None)) in [
                RiskPriority.IMMEDIATE.value,
                getattr(RiskPriority, "HIGH_PRIORITY", None) and RiskPriority.HIGH_PRIORITY.value,
                "IMMEDIATE",
                "HIGH",
                "HIGH_PRIORITY",
            ]
            for r in risks
        )
        if has_high_risk:
            return WorkflowPriority.HIGH_PRIORITY_REVIEW.value

        # Check for severe facts
        facts = (
            self.db.query(MedicalFact)
            .filter(MedicalFact.patient_id == patient_id)
            .all()
        )
        has_severe_symptom = any(
            "severe" in (getattr(f, "value", "") or getattr(f, "value_text", "") or "").lower()
            or "acute" in (getattr(f, "value", "") or getattr(f, "value_text", "") or "").lower()
            or "chest pressure" in (getattr(f, "value", "") or getattr(f, "value_text", "") or "").lower()
            for f in facts
        )
        if has_severe_symptom:
            return WorkflowPriority.HIGH_PRIORITY_REVIEW.value

        has_moderate_risk = any(
            (getattr(r, "priority", None) or getattr(r, "severity", None)) in [
                RiskPriority.NEEDS_ATTENTION.value if hasattr(RiskPriority, "NEEDS_ATTENTION") else "NEEDS_ATTENTION",
                "MODERATE",
                "NEEDS_ATTENTION",
            ]
            for r in risks
        )
        if has_moderate_risk:
            return WorkflowPriority.REVIEW_REQUIRED.value

        return WorkflowPriority.ROUTINE.value

    def create_handoff(self, handoff_in: HandoffCreate) -> ClinicalHandoff:
        """Creates a clinical handoff record for an intake session."""
        existing = (
            self.db.query(ClinicalHandoff)
            .filter(ClinicalHandoff.intake_id == handoff_in.intake_id)
            .first()
        )
        if existing:
            return existing

        # Compute deterministic priority if default
        priority = handoff_in.priority
        if not priority or priority == WorkflowPriority.ROUTINE.value:
            priority = self.calculate_workflow_priority(handoff_in.patient_id, handoff_in.intake_id)

        initial_status = handoff_in.status or (
            HandoffStatus.TRIAGE_REQUIRED.value
            if priority == WorkflowPriority.HIGH_PRIORITY_REVIEW.value
            else HandoffStatus.READY.value
        )

        handoff = ClinicalHandoff(
            patient_id=handoff_in.patient_id,
            intake_id=handoff_in.intake_id,
            priority=priority,
            status=initial_status,
            assigned_to=handoff_in.assigned_to,
            review_notes=handoff_in.review_notes or "Workflow priority based on detected safety signals.",
        )
        self.db.add(handoff)
        self.db.commit()
        self.db.refresh(handoff)

        audit_service.log_event(
            db=self.db,
            event_type="HANDOFF_CREATED",
            patient_id=handoff.patient_id,
            actor_role="SYSTEM",
            details={
                "handoff_id": handoff.id,
                "intake_id": handoff.intake_id,
                "priority": handoff.priority,
                "status": handoff.status,
                "assigned_to": handoff.assigned_to,
            },
        )

        return handoff

    def get_handoff(self, handoff_id: str) -> ClinicalHandoff:
        """Retrieves handoff by ID."""
        handoff = self.db.query(ClinicalHandoff).filter(ClinicalHandoff.id == handoff_id).first()
        if not handoff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Clinical handoff {handoff_id} not found",
            )
        return handoff

    def get_handoff_by_intake(self, intake_id: str) -> ClinicalHandoff:
        """Retrieves handoff by intake ID."""
        handoff = self.db.query(ClinicalHandoff).filter(ClinicalHandoff.intake_id == intake_id).first()
        if not handoff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Clinical handoff for intake {intake_id} not found",
            )
        return handoff

    def assign_doctor(self, handoff_id: str, assign_in: HandoffAssign) -> ClinicalHandoff:
        """Assigns a clinician to the handoff."""
        handoff = self.get_handoff(handoff_id)
        handoff.assigned_to = assign_in.assigned_to
        handoff.status = HandoffStatus.ASSIGNED.value
        if assign_in.notes:
            handoff.review_notes = (handoff.review_notes or "") + f"\nAssignment Note: {assign_in.notes}"

        self.db.commit()
        self.db.refresh(handoff)

        audit_service.log_event(
            db=self.db,
            event_type="HANDOFF_ASSIGNED",
            patient_id=handoff.patient_id,
            actor_role="STAFF",
            details={
                "handoff_id": handoff.id,
                "assigned_to": assign_in.assigned_to,
                "status": handoff.status,
            },
        )

        return handoff

    def review_handoff(self, handoff_id: str, review_in: HandoffReview) -> ClinicalHandoff:
        """Updates handoff status and notes after nurse/doctor review."""
        handoff = self.get_handoff(handoff_id)
        handoff.status = review_in.status
        if review_in.priority:
            handoff.priority = review_in.priority

        if review_in.review_notes:
            timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
            actor = review_in.reviewer_id or "Clinician"
            note_entry = f"[{timestamp} - {actor}]: {review_in.review_notes}"
            handoff.review_notes = (
                f"{handoff.review_notes}\n{note_entry}" if handoff.review_notes else note_entry
            )

        if review_in.status == HandoffStatus.COMPLETED.value:
            handoff.completed_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(handoff)

        audit_service.log_event(
            db=self.db,
            event_type="HANDOFF_REVIEWED",
            patient_id=handoff.patient_id,
            actor_role="CLINICIAN",
            details={
                "handoff_id": handoff.id,
                "status": handoff.status,
                "priority": handoff.priority,
                "reviewer": review_in.reviewer_id,
            },
        )

        return handoff
