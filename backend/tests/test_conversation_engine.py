"""
Comprehensive Test Suite for MediKiosk AI Clinical Conversation Engine.

Covers:
- Conversation initialization and multilingual greetings (EN, HI, TE)
- Adaptive question selection and clinical pathways
- Structured fact extraction & normalization
- Deduplication & entity matching
- Contradiction & conflict detection
- Unknown/negative patient response handling
- Deterministic clinical red flag rules & queue priority escalation
- Evidence linking to conversation turns
- Complete Patient Story generation
- Patient confirmation & doctor verification workflows
- Audit logging of AI, patient, and clinician actions
- LLM resilience and failure fallbacks
- State persistence across reloads
- End-to-end execution of all 5 synthetic demo scenarios
"""

import pytest
from datetime import datetime, timezone
import json
from fastapi.testclient import TestClient

from app.models.patient import Patient
from app.models.intake import IntakeSession, IntakeStatus
from app.models.conversation import Conversation, ConversationMessage
from app.models.medical_fact import MedicalFact, VerificationStatus
from app.models.queue import QueueItem, QueueStatus
from app.models.audit import AuditEvent
from app.services.conversation.conversation_manager import ConversationManager
from app.services.conversation.conversation_state import ConversationState
from app.services.conversation.clinical_ontology import resolve_pathway, OntologyDomain
from app.services.conversation.synthetic_scenarios import ALL_SYNTHETIC_SCENARIOS, get_scenario_by_id
from app.services.risk.risk_rules import evaluate_rules


@pytest.fixture
def setup_patient_and_intake(db_session):
    """Sets up a realistic synthetic patient and intake session."""
    patient = Patient(
        hospital_id="HOSP-TEST-01",
        name="Ramesh Kumar",
        age=54,
        gender="MALE",
        phone="9876543210",
        preferred_language="en",
    )
    db_session.add(patient)
    db_session.commit()
    db_session.refresh(patient)

    intake = IntakeSession(
        patient_id=patient.id,
        status=IntakeStatus.IN_PROGRESS.value,
        language="en",
    )
    db_session.add(intake)
    db_session.commit()
    db_session.refresh(intake)

    queue_item = QueueItem(
        patient_id=patient.id,
        intake_session_id=intake.id,
        token_number="#102",
        status=QueueStatus.AWAITING_TRIAGE.value,
        priority="ROUTINE",
    )
    db_session.add(queue_item)
    db_session.commit()
    db_session.refresh(queue_item)

    return patient, intake, queue_item


# =========================================================================
# 1. Initialization and Multilingual Tests
# =========================================================================

@pytest.mark.asyncio
async def test_conversation_initialization(db_session, setup_patient_and_intake):
    patient, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    res = await manager.start_conversation(intake_id=intake.id, language="en")

    assert res["conversation_id"] is not None
    assert res["current_topic"] == "greeting"
    assert "MediKiosk" in res["current_question"]
    assert res["is_completed"] is False


@pytest.mark.asyncio
async def test_multilingual_greeting_hindi(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    res = await manager.start_conversation(intake_id=intake.id, language="hi")

    assert "नमस्ते" in res["current_question"]


@pytest.mark.asyncio
async def test_multilingual_greeting_telugu(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    res = await manager.start_conversation(intake_id=intake.id, language="te")

    assert "నమస్కారం" in res["current_question"]


# =========================================================================
# 2. Fact Extraction & Adaptive Questioning Tests
# =========================================================================

@pytest.mark.asyncio
async def test_adaptive_questioning_chest_pain(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    turn_res = await manager.process_patient_turn(
        conversation_id=conv_id,
        patient_message="I have severe chest pain since yesterday.",
        language="en",
    )

    assert len(turn_res["new_facts"]) >= 1
    # Check that chest pain fact is recorded
    symptom_facts = [f for f in turn_res["new_facts"] if "Chest" in f["normalized_value"]]
    assert len(symptom_facts) >= 1
    # Next question should adaptively follow the symptom pathway (e.g. onset, duration, location, radiation)
    assert turn_res["next_topic"] in ["onset", "duration", "location", "severity", "radiation"]


@pytest.mark.asyncio
async def test_structured_fact_format(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    turn_res = await manager.process_patient_turn(
        conversation_id=conv_id,
        patient_message="I have had chest pain since yesterday morning.",
        language="en",
    )

    fact = turn_res["new_facts"][0]
    assert "id" in fact
    assert "category" in fact
    assert "field" in fact
    assert "normalized_value" in fact
    assert "confidence" in fact
    assert fact["confidence"] >= 0.8
    assert fact["verification_status"] in ["UNVERIFIED", "PATIENT_CONFIRMED"]


# =========================================================================
# 3. Deduplication & Semantic Normalization
# =========================================================================

@pytest.mark.asyncio
async def test_duplicate_fact_deduplication(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    # First statement
    await manager.process_patient_turn(conv_id, "Chest pain started yesterday.")
    initial_count = db_session.query(MedicalFact).filter(MedicalFact.intake_session_id == intake.id).count()

    # Second statement conveying identical concept
    await manager.process_patient_turn(conv_id, "Yes, chest pain is what I have.")
    second_count = db_session.query(MedicalFact).filter(MedicalFact.intake_session_id == intake.id).count()

    # Deduplication should prevent duplicate rows for the same normalized chief complaint
    assert second_count == initial_count


# =========================================================================
# 4. Unknown & Negative Response Handling
# =========================================================================

@pytest.mark.asyncio
async def test_unknown_response_handling(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    turn_res = await manager.process_patient_turn(
        conversation_id=conv_id,
        patient_message="I don't remember when it started.",
    )

    # Engine must preserve unknown response without failing or looping
    unknown_facts = [f for f in turn_res["new_facts"] if f["category"] == OntologyDomain.UNKNOWN_INFORMATION.value]
    assert len(unknown_facts) == 1
    assert "Unknown" in unknown_facts[0]["normalized_value"]


@pytest.mark.asyncio
async def test_negative_response_handling(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    # Set topic to allergies
    conv = db_session.query(Conversation).filter(Conversation.id == conv_id).first()
    state = ConversationState.from_json(conv.state_json)
    state.current_topic = "allergies"
    conv.state_json = state.to_json()
    db_session.commit()

    turn_res = await manager.process_patient_turn(
        conversation_id=conv_id,
        patient_message="No allergies, none.",
    )

    allergy_facts = [f for f in turn_res["new_facts"] if "No Known Drug Allergies" in f["normalized_value"]]
    assert len(allergy_facts) == 1
    assert allergy_facts[0]["verification_status"] == "PATIENT_CONFIRMED"


# =========================================================================
# 5. Conflict Detection
# =========================================================================

@pytest.mark.asyncio
async def test_conflict_detection_allergy(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    # 1. Patient first reports penicillin allergy
    await manager.process_patient_turn(conv_id, "I have a severe penicillin allergy.")

    # 2. Later, patient claims no known allergies
    turn_res = await manager.process_patient_turn(conv_id, "Actually, I have no known drug allergies at all.")

    # A conflict must be flagged and facts marked as CONFLICTED
    assert len(turn_res["conflicts"]) >= 1
    conflicted_facts = db_session.query(MedicalFact).filter(
        MedicalFact.intake_session_id == intake.id,
        MedicalFact.verification_status == VerificationStatus.CONFLICTED.value,
    ).all()
    assert len(conflicted_facts) >= 2


# =========================================================================
# 6. Red Flag Rules & Queue Priority Escalation
# =========================================================================

@pytest.mark.asyncio
async def test_red_flag_detection_severe_chest_pain(db_session, setup_patient_and_intake):
    _, intake, queue_item = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    # Patient reports high severity chest pain with radiation
    turn_res = await manager.process_patient_turn(
        conversation_id=conv_id,
        patient_message="I have severe crushing chest pain, rating it 8/10, radiating to my left arm.",
    )

    # Red flag RF001 must trigger
    assert any(rf["rule_id"] == "RF001" for rf in turn_res["red_flags"])

    # Queue item must be automatically escalated to HIGH_PRIORITY or IMMEDIATE
    db_session.refresh(queue_item)
    assert queue_item.priority in ["HIGH_PRIORITY", "IMMEDIATE"]


@pytest.mark.asyncio
async def test_red_flag_detection_acute_dyspnea(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    turn_res = await manager.process_patient_turn(
        conversation_id=conv_id,
        patient_message="I am having severe shortness of breath and breathlessness at rest.",
    )

    assert any(rf["rule_id"] == "RF002" for rf in turn_res["red_flags"])


# =========================================================================
# 7. Evidence Linking & Patient Story Assembly
# =========================================================================

@pytest.mark.asyncio
async def test_evidence_linking(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    turn_res = await manager.process_patient_turn(
        conversation_id=conv_id,
        patient_message="I take Amlodipine every day.",
    )

    fact = turn_res["new_facts"][0]
    db_fact = db_session.query(MedicalFact).filter(MedicalFact.id == fact["id"]).first()
    assert len(db_fact.evidence_sources) >= 1
    assert db_fact.evidence_sources[0].source_type == "CONVERSATION"
    assert "Amlodipine" in db_fact.evidence_sources[0].source_excerpt


@pytest.mark.asyncio
async def test_patient_story_generation(db_session, setup_patient_and_intake):
    patient, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    await manager.process_patient_turn(conv_id, "I have chest pain since yesterday.")
    await manager.process_patient_turn(conv_id, "Severity is 8/10.")
    await manager.process_patient_turn(conv_id, "I take Amlodipine.")

    story = await manager.get_patient_story(patient_id=patient.id, intake_id=intake.id)
    assert story["patientId"] == patient.id
    assert "Chest pain" in story["chiefComplaint"]
    assert len(story["reportedSymptoms"]) >= 1
    assert len(story["currentMedications"]) >= 1
    assert story["summaryParagraph"] is not None
    assert story["verificationProgress"]["totalFacts"] >= 2


# =========================================================================
# 8. Confirmation, Verification, and Audit Logging
# =========================================================================

@pytest.mark.asyncio
async def test_patient_fact_confirmation(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    await manager.process_patient_turn(conv_id, "I have chest pain since yesterday.")
    confirm_res = await manager.confirm_intake_facts(conv_id)

    assert confirm_res["confirmed_count"] >= 1
    assert confirm_res["status"] == "PATIENT_CONFIRMED"


@pytest.mark.asyncio
async def test_audit_logging_events(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    await manager.process_patient_turn(conv_id, "Severe chest pain 8/10.")

    audits = db_session.query(AuditEvent).all()
    action_types = {a.action for a in audits}
    assert "CONVERSATION_STARTED" in action_types
    assert "PATIENT_RESPONSE_RECEIVED" in action_types
    assert "FACT_EXTRACTED" in action_types
    assert "RED_FLAG_DETECTED" in action_types


# =========================================================================
# 9. LLM Failure Resilience & State Persistence
# =========================================================================

@pytest.mark.asyncio
async def test_llm_failure_fallback(db_session, setup_patient_and_intake, monkeypatch):
    """Verifies that an exception inside the LLM provider falls back safely without crashing."""
    from app.services.llm.llm_service import llm_service
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    async def raise_simulated_error(*args, **kwargs):
        raise ConnectionError("Ollama local connection refused")

    monkeypatch.setattr(llm_service.provider, "extract_candidate_facts", raise_simulated_error)

    # Should safely catch error and return fallback extraction
    turn_res = await manager.process_patient_turn(conv_id, "I have chest pain.")
    assert turn_res["next_question"] is not None


@pytest.mark.asyncio
async def test_state_persistence_across_reloads(db_session, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake
    manager1 = ConversationManager(db_session)
    start_res = await manager1.start_conversation(intake_id=intake.id, language="en")
    conv_id = start_res["conversation_id"]

    await manager1.process_patient_turn(conv_id, "I have severe chest pain.")

    # Simulate fresh manager reading state from DB
    manager2 = ConversationManager(db_session)
    conv_fresh = db_session.query(Conversation).filter(Conversation.id == conv_id).first()
    reloaded_state = ConversationState.from_json(conv_fresh.state_json)

    assert len(reloaded_state.facts_collected) >= 1
    assert "chief_complaint" in reloaded_state.questions_asked or "greeting" in reloaded_state.questions_asked


# =========================================================================
# 10. End-to-End Synthetic Scenarios 1 to 5
# =========================================================================

@pytest.mark.asyncio
async def test_synthetic_scenario_1_headache(db_session, setup_patient_and_intake):
    scenario = get_scenario_by_id("SCENARIO_1")
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language=scenario.language)
    conv_id = start_res["conversation_id"]

    for turn in scenario.turns:
        turn_res = await manager.process_patient_turn(conv_id, turn.patient_message, language=scenario.language)
        assert turn_res["assistant_message"]["content"] is not None

    # Scenario 1 is routine: no red flags should be triggered
    assert len(turn_res["red_flags"]) == 0


@pytest.mark.asyncio
async def test_synthetic_scenario_2_ramesh_cardiac(db_session, setup_patient_and_intake):
    scenario = get_scenario_by_id("SCENARIO_2")
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language=scenario.language)
    conv_id = start_res["conversation_id"]

    red_flags_seen = []
    for turn in scenario.turns:
        turn_res = await manager.process_patient_turn(conv_id, turn.patient_message, language=scenario.language)
        for rf in turn_res["red_flags"]:
            red_flags_seen.append(rf["rule_id"])

    # High severity chest pain + dyspnea must trigger safety flags
    assert "RF001" in red_flags_seen or "RF002" in red_flags_seen


@pytest.mark.asyncio
async def test_synthetic_scenario_3_allergy(db_session, setup_patient_and_intake):
    scenario = get_scenario_by_id("SCENARIO_3")
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language=scenario.language)
    conv_id = start_res["conversation_id"]

    for turn in scenario.turns:
        turn_res = await manager.process_patient_turn(conv_id, turn.patient_message, language=scenario.language)

    penicillin_facts = db_session.query(MedicalFact).filter(
        MedicalFact.intake_session_id == intake.id,
        MedicalFact.category == OntologyDomain.ALLERGY.value,
    ).all()
    assert len(penicillin_facts) >= 1
    assert "Penicillin" in penicillin_facts[0].normalized_value


@pytest.mark.asyncio
async def test_synthetic_scenario_4_conflicting_history(db_session, setup_patient_and_intake):
    scenario = get_scenario_by_id("SCENARIO_4")
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language=scenario.language)
    conv_id = start_res["conversation_id"]

    conflicts_found = False
    for turn in scenario.turns:
        turn_res = await manager.process_patient_turn(conv_id, turn.patient_message, language=scenario.language)
        if turn_res["conflicts"]:
            conflicts_found = True

    assert conflicts_found is True


@pytest.mark.asyncio
async def test_synthetic_scenario_5_incomplete_unknown(db_session, setup_patient_and_intake):
    scenario = get_scenario_by_id("SCENARIO_5")
    _, intake, _ = setup_patient_and_intake
    manager = ConversationManager(db_session)
    start_res = await manager.start_conversation(intake_id=intake.id, language=scenario.language)
    conv_id = start_res["conversation_id"]

    for turn in scenario.turns:
        turn_res = await manager.process_patient_turn(conv_id, turn.patient_message, language=scenario.language)
        assert turn_res["next_question"] is not None

    unknown_facts = db_session.query(MedicalFact).filter(
        MedicalFact.intake_session_id == intake.id,
        MedicalFact.category == OntologyDomain.UNKNOWN_INFORMATION.value,
    ).all()
    assert len(unknown_facts) >= 1


# =========================================================================
# 11. REST API Endpoints Integration Test
# =========================================================================

def test_api_conversations_flow(client: TestClient, setup_patient_and_intake):
    _, intake, _ = setup_patient_and_intake

    # 1. Start conversation via API
    start_resp = client.post("/api/v1/conversations/start", json={
        "intake_id": intake.id,
        "language": "en",
        "accessibility_mode": "STANDARD",
    })
    assert start_resp.status_code == 200
    conv_data = start_resp.json()["data"]
    conv_id = conv_data["conversation_id"]
    assert conv_data["current_question"] != ""

    # 2. Process turn via API
    turn_resp = client.post(f"/api/v1/conversations/{conv_id}/message", json={
        "content": "I have chest pain since yesterday.",
        "language": "en",
        "source": "TEXT",
    })
    assert turn_resp.status_code == 200
    turn_data = turn_resp.json()["data"]
    assert len(turn_data["new_facts"]) >= 1
    assert turn_data["next_question"] != ""

    # 3. Fetch facts via API
    facts_resp = client.get(f"/api/v1/conversations/{conv_id}/facts")
    assert facts_resp.status_code == 200
    assert len(facts_resp.json()["data"]) >= 1

    # 4. Generate story via API
    story_resp = client.get(f"/api/v1/conversations/{conv_id}/story")
    assert story_resp.status_code == 200
    story_data = story_resp.json()["data"]
    assert "chiefComplaint" in story_data
