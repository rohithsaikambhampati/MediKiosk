from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    intake_session_id = Column(String(36), ForeignKey("intake_sessions.id", ondelete="CASCADE"), unique=True, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False)  # ACTIVE, COMPLETED, PAUSED
    state_json = Column(Text, nullable=True)  # Serialized ConversationState
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    intake_session = relationship("IntakeSession", back_populates="conversation")
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ConversationMessage.timestamp")


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # PATIENT, ASSISTANT, SYSTEM
    content = Column(Text, nullable=False)
    source = Column(String(20), default="VOICE", nullable=False)  # VOICE, TEXT, AI, SYSTEM
    metadata_json = Column(Text, nullable=True)  # JSON encoded confidence, audio length, etc.
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    conversation = relationship("Conversation", back_populates="messages")
