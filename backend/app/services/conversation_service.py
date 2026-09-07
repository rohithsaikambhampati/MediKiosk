from typing import Optional, List, Dict, Any
import json
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.conversation import Conversation, ConversationMessage
from app.repositories.conversation_repository import ConversationRepository, ConversationMessageRepository
from app.repositories.intake_repository import IntakeRepository
from app.services.ai_interfaces import MockConversationEngine, ConversationInput


class ConversationService:
    def __init__(self, db: Session):
        self.db = db
        self.conv_repo = ConversationRepository(db)
        self.msg_repo = ConversationMessageRepository(db)
        self.intake_repo = IntakeRepository(db)
        self.ai_engine = MockConversationEngine()

    def get_conversation_by_intake(self, intake_id: str) -> Conversation:
        conv = self.conv_repo.get_by_intake_session_id(intake_id)
        if not conv:
            intake = self.intake_repo.get_by_id(intake_id)
            if not intake:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Intake session not found",
                )
            conv = Conversation(
                intake_session_id=intake.id,
                language=intake.language,
                status="ACTIVE",
            )
            conv = self.conv_repo.create(conv)
        return conv

    def get_messages(self, conversation_id: str) -> List[ConversationMessage]:
        return self.msg_repo.get_messages_by_conversation(conversation_id)

    async def add_user_message(
        self,
        intake_id: str,
        content: str,
        language: str = "en",
        source: str = "VOICE",
    ) -> Dict[str, Any]:
        conv = self.get_conversation_by_intake(intake_id)

        # 1. Save patient message
        user_msg = ConversationMessage(
            conversation_id=conv.id,
            role="PATIENT",
            content=content,
            source=source,
        )
        saved_user_msg = self.msg_repo.create(user_msg)

        # 2. Process via AI conversation engine
        conv_input = ConversationInput(
            session_id=conv.intake_session_id,
            patient_id="",
            message=content,
            language=language,
        )
        ai_reply = await self.ai_engine.process_turn(conv_input)

        # 3. Save assistant message
        bot_msg = ConversationMessage(
            conversation_id=conv.id,
            role="ASSISTANT",
            content=ai_reply.reply_text,
            source="AI",
            metadata_json=json.dumps({
                "detected_intent": ai_reply.detected_intent,
                "suggested_followups": ai_reply.suggested_followups,
                "confidence": ai_reply.confidence,
            }),
        )
        saved_bot_msg = self.msg_repo.create(bot_msg)

        return {
            "user_message": saved_user_msg,
            "assistant_message": saved_bot_msg,
            "suggested_followups": ai_reply.suggested_followups,
        }
