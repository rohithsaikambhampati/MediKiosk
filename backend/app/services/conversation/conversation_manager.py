"""
Conversation Manager for MediKiosk.

Coordinates the end-to-end clinical intake conversation turn:
1. Receives patient message.
2. Persists patient message to ConversationMessage.
3. Loads persistent ConversationState.
4. Performs structured fact extraction, concept normalization, deduplication, and conflict detection.
5. Links extracted facts to conversation message evidence.
6. Evaluates deterministic clinical safety rules (Red Flag Engine) and escalates queue priority if necessary.
7. Calls Question Selection Engine for adaptive next step.
8. Persists updated state, assistant response, and audit log entries.
9. Returns structured response with next question, facts collected, red flags, and conflicts.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import json
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.conversation import Conversation, ConversationMessage
from app.models.intake import IntakeSession, IntakeStatus
from app.models.patient import Patient
from app.models.medical_fact import MedicalFact
from app.models.audit import AuditEvent
from app.services.conversation.conversation_state import ConversationState
from app.services.conversation.question_engine import QuestionEngine
from app.services.conversation.fact_extractor import FactExtractor
from app.services.risk.risk_engine import RiskEngine
from app.services.evidence.evidence_service import EvidenceService
from app.services.patient_story.story_generator import PatientStoryGenerator


class ConversationManager:
    def __init__(self, db: Session):
        self.db = db
        self.question_engine = QuestionEngine()
        self.fact_extractor = FactExtractor(db)
        self.risk_engine = RiskEngine(db)
        self.evidence_service = EvidenceService(db)
        self.story_generator = PatientStoryGenerator(db)

    def _log_audit(
        self,
        actor_role: str,
        action: str,
        resource_type: str,
        resource_id: str,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        audit = AuditEvent(
            actor_role=actor_role,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=json.dumps(metadata) if metadata else None,
        )
        self.db.add(audit)
        self.db.commit()

    async def start_conversation(
        self,
        intake_id: str,
        language: str = "en",
        accessibility_mode: str = "STANDARD",
    ) -> Dict[str, Any]:
        """Initializes or resumes an intake conversation and provides the starting greeting."""
        intake = self.db.query(IntakeSession).filter(IntakeSession.id == intake_id).first()
        if not intake:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Intake session not found")

        conv = self.db.query(Conversation).filter(Conversation.intake_session_id == intake_id).first()
        if not conv:
            conv = Conversation(
                intake_session_id=intake_id,
                language=language,
                status="ACTIVE",
            )
            self.db.add(conv)
            self.db.commit()
            self.db.refresh(conv)

        # Initialize or reload state
        if conv.state_json:
            conv_state = ConversationState.from_json(conv.state_json)
            # Update accessibility or language if changed
            conv_state.language = language
            conv_state.accessibility_mode = accessibility_mode
        else:
            conv_state = ConversationState(
                conversation_id=conv.id,
                patient_id=intake.patient_id,
                intake_id=intake.id,
                current_stage="GREETING",
                current_topic="greeting",
                language=language,
                accessibility_mode=accessibility_mode,
            )

        # Generate initial question if none asked yet
        if not conv_state.questions_asked:
            greeting_text = await self.question_engine.get_question_text(
                topic="greeting",
                missing_fields=[],
                language=language,
                accessibility_mode=accessibility_mode,
            )
            conv_state.mark_question_asked("greeting", greeting_text)

            # Save greeting message
            bot_msg = ConversationMessage(
                conversation_id=conv.id,
                role="ASSISTANT",
                content=greeting_text,
                source="AI",
                metadata_json=json.dumps({"topic": "greeting", "stage": "GREETING"}),
            )
            self.db.add(bot_msg)
            conv.state_json = conv_state.to_json()
            self.db.commit()

            self._log_audit(
                actor_role="AI",
                action="CONVERSATION_STARTED",
                resource_type="CONVERSATION",
                resource_id=conv.id,
                metadata={"intake_id": intake_id, "language": language},
            )
            self._log_audit(
                actor_role="AI",
                action="QUESTION_ASKED",
                resource_type="CONVERSATION",
                resource_id=conv.id,
                metadata={"topic": "greeting"},
            )

        return {
            "conversation_id": conv.id,
            "intake_id": intake_id,
            "patient_id": intake.patient_id,
            "status": conv.status,
            "current_topic": conv_state.current_topic,
            "current_question": conv_state.current_question,
            "is_completed": conv_state.is_completed,
            "facts_count": len(conv_state.facts_collected),
            "red_flags": conv_state.red_flags,
            "conflicts": conv_state.conflicts,
        }

    async def process_patient_turn(
        self,
        conversation_id: str,
        patient_message: str,
        language: Optional[str] = None,
        source: str = "TEXT",
    ) -> Dict[str, Any]:
        """
        Executes a complete clinical interview turn:
        Save message -> Extract facts -> Deduplicate & Detect conflicts -> Link evidence ->
        Evaluate red flags -> Select next question -> Persist state.
        """
        conv = self.db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

        intake = self.db.query(IntakeSession).filter(IntakeSession.id == conv.intake_session_id).first()
        if not intake:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Intake not found")

        conv_state = ConversationState.from_json(conv.state_json) if conv.state_json else ConversationState(
            conversation_id=conv.id,
            patient_id=intake.patient_id,
            intake_id=intake.id,
        )

        curr_lang = language or conv_state.language or conv.language or "en"
        conv_state.language = curr_lang

        # 1. Save patient message
        user_msg = ConversationMessage(
            conversation_id=conv.id,
            role="PATIENT",
            content=patient_message,
            source=source,
            metadata_json=json.dumps({"topic": conv_state.current_topic}),
        )
        self.db.add(user_msg)
        self.db.commit()
        self.db.refresh(user_msg)

        self._log_audit(
            actor_role="PATIENT",
            action="PATIENT_RESPONSE_RECEIVED",
            resource_type="CONVERSATION_MESSAGE",
            resource_id=user_msg.id,
            metadata={"topic": conv_state.current_topic, "message_length": len(patient_message)},
        )

        # 2. Extract facts, deduplicate & detect conflicts
        existing_facts = self.db.query(MedicalFact).filter(
            MedicalFact.intake_session_id == intake.id
        ).all()

        new_facts, conflicts = await self.fact_extractor.extract_and_persist_facts(
            patient_id=intake.patient_id,
            intake_id=intake.id,
            conversation_message_id=user_msg.id,
            patient_text=patient_message,
            topic=conv_state.current_topic,
            existing_facts=existing_facts,
            language=curr_lang,
        )

        # 3. Link evidence for each newly extracted fact
        for fact in new_facts:
            self.evidence_service.link_conversation_evidence(
                medical_fact=fact,
                conversation_message_id=user_msg.id,
                source_excerpt=patient_message,
                confidence=fact.confidence,
                turn_number=len(conv_state.questions_asked),
            )
            conv_state.add_fact({
                "id": fact.id,
                "category": fact.category,
                "field": fact.field,
                "value": fact.value,
                "normalized_value": fact.normalized_value,
                "confidence": fact.confidence,
                "verification_status": fact.verification_status,
                "conflict_status": fact.conflict_status,
            })
            self._log_audit(
                actor_role="AI",
                action="FACT_EXTRACTED",
                resource_type="MEDICAL_FACT",
                resource_id=fact.id,
                metadata={"field": fact.field, "normalized_value": fact.normalized_value},
            )

        # Log any conflicts detected
        for conf in conflicts:
            conv_state.add_conflict(conf)
            self._log_audit(
                actor_role="AI",
                action="FACT_CONFLICT_DETECTED",
                resource_type="CONVERSATION",
                resource_id=conv.id,
                metadata=conf,
            )

        # 4. Evaluate Safety Signals (Red Flags)
        all_collected_facts = conv_state.facts_collected
        detected_red_flags = self.risk_engine.evaluate_and_record(
            patient_id=intake.patient_id,
            intake_id=intake.id,
            facts=all_collected_facts,
            patient_message=patient_message,
        )
        for rf in detected_red_flags:
            conv_state.add_red_flag(rf)
            self._log_audit(
                actor_role="AI",
                action="RED_FLAG_DETECTED",
                resource_type="RISK_ASSESSMENT",
                resource_id=conv.id,
                metadata=rf,
            )

        # 5. Question Selection Engine: Adaptive Next Step
        chief_complaint = next(
            (f["normalized_value"] for f in all_collected_facts if f.get("field") == "chief_complaint" or f.get("category") == "CHIEF_COMPLAINT"),
            None
        )

        next_topic, is_completed = self.question_engine.select_next_step(
            current_topic=conv_state.current_topic,
            facts_collected=all_collected_facts,
            questions_asked=conv_state.questions_asked,
            chief_complaint=chief_complaint,
            language=curr_lang,
            accessibility_mode=conv_state.accessibility_mode,
        )

        # Generate next question text
        next_question_text = await self.question_engine.get_question_text(
            topic=next_topic,
            missing_fields=[],
            language=curr_lang,
            accessibility_mode=conv_state.accessibility_mode,
        )

        conv_state.mark_question_asked(next_topic, next_question_text)
        conv_state.is_completed = is_completed

        if is_completed:
            conv_state.completed_at = datetime.now(timezone.utc).isoformat()
            conv.status = "COMPLETED"
            conv.completed_at = datetime.now(timezone.utc)
            intake.status = IntakeStatus.READY_FOR_REVIEW.value
            self.db.add(intake)

        # 6. Save assistant message
        bot_msg = ConversationMessage(
            conversation_id=conv.id,
            role="ASSISTANT",
            content=next_question_text,
            source="AI",
            metadata_json=json.dumps({
                "topic": next_topic,
                "is_completed": is_completed,
                "red_flags_present": len(conv_state.red_flags) > 0,
            }),
        )
        self.db.add(bot_msg)

        # 7. Persist updated conversation state
        conv.state_json = conv_state.to_json()
        self.db.commit()

        self._log_audit(
            actor_role="AI",
            action="QUESTION_ASKED",
            resource_type="CONVERSATION",
            resource_id=conv.id,
            metadata={"topic": next_topic, "is_completed": is_completed},
        )

        return {
            "conversation_id": conv.id,
            "patient_message": {
                "id": user_msg.id,
                "content": user_msg.content,
                "timestamp": user_msg.timestamp.isoformat(),
            },
            "assistant_message": {
                "id": bot_msg.id,
                "content": bot_msg.content,
                "topic": next_topic,
                "timestamp": bot_msg.timestamp.isoformat(),
            },
            "next_topic": next_topic,
            "next_question": next_question_text,
            "is_completed": is_completed,
            "new_facts": [
                {
                    "id": f.id,
                    "category": f.category,
                    "field": f.field,
                    "value": f.value,
                    "normalized_value": f.normalized_value,
                    "confidence": f.confidence,
                    "verification_status": f.verification_status,
                }
                for f in new_facts
            ],
            "total_facts_count": len(conv_state.facts_collected),
            "red_flags": conv_state.red_flags,
            "conflicts": conv_state.conflicts,
        }

    async def confirm_intake_facts(
        self,
        conversation_id: str,
        confirmed_fact_ids: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Patient reviews and confirms extracted facts before doctor consultation."""
        conv = self.db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

        intake = self.db.query(IntakeSession).filter(IntakeSession.id == conv.intake_session_id).first()
        if not intake:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Intake not found")

        query = self.db.query(MedicalFact).filter(MedicalFact.intake_session_id == intake.id)
        if confirmed_fact_ids:
            query = query.filter(MedicalFact.id.in_(confirmed_fact_ids))

        facts = query.all()
        confirmed_count = 0
        for f in facts:
            if f.verification_status != "CONFLICTED":
                f.verification_status = "PATIENT_CONFIRMED"
                self.db.add(f)
                confirmed_count += 1

        self.db.commit()

        self._log_audit(
            actor_role="PATIENT",
            action="PATIENT_CONFIRMED_FACT",
            resource_type="INTAKE_SESSION",
            resource_id=intake.id,
            metadata={"confirmed_count": confirmed_count},
        )

        return {
            "conversation_id": conversation_id,
            "intake_id": intake.id,
            "confirmed_count": confirmed_count,
            "status": "PATIENT_CONFIRMED",
        }

    async def get_patient_story(self, patient_id: str, intake_id: Optional[str] = None) -> Dict[str, Any]:
        """Generates full clinician-ready Patient Story."""
        story = await self.story_generator.generate_story(patient_id, intake_id)
        self._log_audit(
            actor_role="AI",
            action="PATIENT_STORY_GENERATED",
            resource_type="PATIENT_STORY",
            resource_id=patient_id,
            metadata={"total_facts": story["verificationProgress"]["totalFacts"]},
        )
        return story
