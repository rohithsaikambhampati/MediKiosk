from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import random
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.intake import IntakeSession, ConsentRecord, IntakeStatus
from app.models.conversation import Conversation
from app.models.queue import QueueItem, QueueStatus
from app.models.risk import RiskAssessment, RiskPriority
from app.repositories.intake_repository import IntakeRepository, ConsentRepository
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.queue_repository import QueueRepository
from app.repositories.risk_repository import RiskRepository
from app.repositories.patient_repository import PatientRepository
from app.repositories.user_repository import DepartmentRepository
from app.schemas.intake import IntakeCreate, ConsentCreate, IntakeStatusUpdate
from app.services.ai_interfaces import MockRiskEngine, MockSummaryEngine


class IntakeService:
    def __init__(self, db: Session):
        self.db = db
        self.intake_repo = IntakeRepository(db)
        self.consent_repo = ConsentRepository(db)
        self.conv_repo = ConversationRepository(db)
        self.queue_repo = QueueRepository(db)
        self.risk_repo = RiskRepository(db)
        self.patient_repo = PatientRepository(db)
        self.dept_repo = DepartmentRepository(db)
        self.risk_engine = MockRiskEngine()
        self.summary_engine = MockSummaryEngine()

    def start_intake_session(self, intake_in: IntakeCreate) -> IntakeSession:
        patient = self.patient_repo.get_by_id(intake_in.patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found for intake session",
            )

        session = IntakeSession(
            patient_id=intake_in.patient_id,
            department_id=intake_in.department_id,
            language=intake_in.language or patient.preferred_language or "en",
            status=IntakeStatus.IN_PROGRESS.value,
            started_at=datetime.now(timezone.utc),
        )
        created_session = self.intake_repo.create(session)

        # Create associated conversation container
        conv = Conversation(
            intake_session_id=created_session.id,
            language=created_session.language,
            status="ACTIVE",
        )
        self.conv_repo.create(conv)

        return created_session

    def get_intake_session(self, intake_id: str) -> IntakeSession:
        session = self.intake_repo.get_by_id(intake_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Intake session not found",
            )
        return session

    def record_consent(self, intake_id: str, patient_id: str, consent_in: ConsentCreate) -> ConsentRecord:
        record = ConsentRecord(
            intake_session_id=intake_id,
            patient_id=patient_id,
            voice_consent=consent_in.voice_consent,
            document_consent=consent_in.document_consent,
            ai_processing_consent=consent_in.ai_processing_consent,
            hospital_sharing_consent=consent_in.hospital_sharing_consent,
            abha_consent=consent_in.abha_consent,
        )
        return self.consent_repo.create(record)

    def update_intake_status(self, intake_id: str, status_val: str) -> IntakeSession:
        session = self.get_intake_session(intake_id)
        return self.intake_repo.update(session, {"status": status_val})

    async def finalize_intake(
        self,
        intake_id: str,
        department_id: Optional[str] = None,
        preferred_doctor_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        session = self.get_intake_session(intake_id)
        patient = self.patient_repo.get_by_id(session.patient_id)

        # Update intake status
        session = self.intake_repo.update(session, {
            "status": IntakeStatus.COMPLETED.value,
            "completed_at": datetime.now(timezone.utc),
            "department_id": department_id or session.department_id,
        })

        # Generate ticket token e.g. #102
        token_number = f"#{random.randint(100, 999)}"

        # Create queue item
        queue_item = QueueItem(
            patient_id=session.patient_id,
            intake_session_id=session.id,
            token_number=token_number,
            department_id=department_id or session.department_id,
            assigned_doctor_id=preferred_doctor_id,
            priority="ROUTINE",
            status=QueueStatus.AWAITING_TRIAGE.value,
        )
        queue_item = self.queue_repo.create(queue_item)

        # Create initial risk record
        risk = RiskAssessment(
            patient_id=session.patient_id,
            intake_session_id=session.id,
            priority=RiskPriority.ROUTINE.value,
            reason="Standard initial intake completed at kiosk.",
            source="Intake Triaging Engine",
        )
        self.risk_repo.create(risk)

        return {
            "intake_session": session,
            "queue_item": queue_item,
            "token_number": token_number,
        }
