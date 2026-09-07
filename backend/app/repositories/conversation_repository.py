from typing import Optional, List
from sqlalchemy import select, asc
from sqlalchemy.orm import Session
from app.models.conversation import Conversation, ConversationMessage
from app.repositories.base import BaseRepository


class ConversationRepository(BaseRepository[Conversation]):
    def __init__(self, db: Session):
        super().__init__(Conversation, db)

    def get_by_intake_session_id(self, intake_session_id: str) -> Optional[Conversation]:
        stmt = select(Conversation).where(Conversation.intake_session_id == intake_session_id)
        return self.db.execute(stmt).scalars().first()


class ConversationMessageRepository(BaseRepository[ConversationMessage]):
    def __init__(self, db: Session):
        super().__init__(ConversationMessage, db)

    def get_messages_by_conversation(self, conversation_id: str) -> List[ConversationMessage]:
        stmt = select(ConversationMessage).where(
            ConversationMessage.conversation_id == conversation_id
        ).order_by(asc(ConversationMessage.timestamp))
        return list(self.db.execute(stmt).scalars().all())
