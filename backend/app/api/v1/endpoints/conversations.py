"""
Conversation Endpoints for MediKiosk Clinical Intake.

Supports adaptive AI clinical dialogue, turn-by-turn question selection,
fact extraction, safety signals, and clinician story generation.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, status, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.conversation import (
    ConversationResponse,
    ConversationMessageResponse,
)
from app.schemas.conversation_engine import (
    StartConversationRequest,
    StartConversationResponse,
    ProcessTurnRequest,
    ProcessTurnResponse,
    ConfirmFactsRequest,
    ConfirmFactsResponse,
)
from app.schemas.common import ApiResponse
from app.models.conversation import Conversation
from app.models.intake import IntakeSession
from app.models.medical_fact import MedicalFact
from app.services.conversation.conversation_manager import ConversationManager

router = APIRouter(prefix="/conversations", tags=["Conversations"])


class SendMessageRequest(BaseModel):
    content: str
    language: str = "en"
    source: str = "TEXT"


@router.post("/start", response_model=ApiResponse[StartConversationResponse])
async def start_conversation(req: StartConversationRequest, db: Session = Depends(get_db)):
    """Starts or resumes a clinical intake conversation session."""
    manager = ConversationManager(db)
    result = await manager.start_conversation(
        intake_id=req.intake_id,
        language=req.language,
        accessibility_mode=req.accessibility_mode,
    )
    return ApiResponse(data=StartConversationResponse(**result))


@router.post("/{conversation_id}/message", response_model=ApiResponse[ProcessTurnResponse], status_code=status.HTTP_200_OK)
async def process_turn(conversation_id: str, req: ProcessTurnRequest, db: Session = Depends(get_db)):
    """Processes a patient answer, extracts candidate facts, checks red flags, and selects the next adaptive question."""
    manager = ConversationManager(db)
    result = await manager.process_patient_turn(
        conversation_id=conversation_id,
        patient_message=req.content,
        language=req.language,
        source=req.source,
    )
    return ApiResponse(data=ProcessTurnResponse(**result))


@router.get("/{intake_id}", response_model=ApiResponse[ConversationResponse])
def get_conversation(intake_id: str, db: Session = Depends(get_db)):
    """Retrieves conversation by intake session ID (creates one if missing)."""
    conv = db.query(Conversation).filter(Conversation.intake_session_id == intake_id).first()
    if not conv:
        intake = db.query(IntakeSession).filter(IntakeSession.id == intake_id).first()
        if not intake:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Intake session not found")
        conv = Conversation(
            intake_session_id=intake.id,
            language=intake.language,
            status="ACTIVE",
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
    return ApiResponse(data=ConversationResponse.model_validate(conv))


@router.get("/{intake_id}/messages", response_model=ApiResponse[List[ConversationMessageResponse]])
def get_conversation_messages(intake_id: str, db: Session = Depends(get_db)):
    """Retrieves chronological messages for an intake conversation."""
    conv = db.query(Conversation).filter(Conversation.intake_session_id == intake_id).first()
    if not conv:
        return ApiResponse(data=[])
    return ApiResponse(data=[ConversationMessageResponse.model_validate(m) for m in conv.messages])


@router.post("/{intake_id}/messages", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def send_message_legacy(intake_id: str, msg_in: SendMessageRequest, db: Session = Depends(get_db)):
    """Backward-compatible endpoint routing messages through the clinical conversation manager."""
    manager = ConversationManager(db)
    # Ensure conversation exists
    start_res = await manager.start_conversation(intake_id=intake_id, language=msg_in.language)
    turn_res = await manager.process_patient_turn(
        conversation_id=start_res["conversation_id"],
        patient_message=msg_in.content,
        language=msg_in.language,
        source=msg_in.source,
    )
    turn_res["user_message"] = turn_res["patient_message"]
    return ApiResponse(data=turn_res)


@router.get("/{conversation_id}/state", response_model=ApiResponse[Dict[str, Any]])
def get_conversation_state(conversation_id: str, db: Session = Depends(get_db)):
    """Retrieves active conversation state."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    import json
    state_data = json.loads(conv.state_json) if conv.state_json else {}
    return ApiResponse(data=state_data)


@router.get("/{conversation_id}/facts", response_model=ApiResponse[List[Dict[str, Any]]])
def get_conversation_facts(conversation_id: str, db: Session = Depends(get_db)):
    """Retrieves all clinical facts extracted for this intake session with evidence."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    facts = db.query(MedicalFact).filter(MedicalFact.intake_session_id == conv.intake_session_id).all()
    results = []
    for f in facts:
        results.append({
            "id": f.id,
            "category": f.category,
            "field": f.field,
            "value": f.value,
            "normalized_value": f.normalized_value,
            "confidence": f.confidence,
            "verification_status": f.verification_status,
            "conflict_status": f.conflict_status,
            "patient_response": f.patient_response,
            "evidence_sources": [
                {
                    "id": ev.id,
                    "source_type": ev.source_type,
                    "source_label": ev.source_label,
                    "source_excerpt": ev.source_excerpt,
                    "confidence": ev.confidence,
                }
                for ev in f.evidence_sources
            ],
        })
    return ApiResponse(data=results)


@router.post("/{conversation_id}/confirm", response_model=ApiResponse[ConfirmFactsResponse])
async def confirm_facts(conversation_id: str, req: ConfirmFactsRequest, db: Session = Depends(get_db)):
    """Patient confirms collected facts prior to doctor review."""
    manager = ConversationManager(db)
    result = await manager.confirm_intake_facts(conversation_id, req.confirmed_fact_ids)
    return ApiResponse(data=ConfirmFactsResponse(**result))


@router.get("/{conversation_id}/story", response_model=ApiResponse[Dict[str, Any]])
async def get_intake_story(conversation_id: str, db: Session = Depends(get_db)):
    """Generates the clinician-facing Patient Story from this conversation."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    intake = db.query(IntakeSession).filter(IntakeSession.id == conv.intake_session_id).first()
    if not intake:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Intake not found")

    manager = ConversationManager(db)
    story = await manager.get_patient_story(patient_id=intake.patient_id, intake_id=intake.id)
    return ApiResponse(data=story)
