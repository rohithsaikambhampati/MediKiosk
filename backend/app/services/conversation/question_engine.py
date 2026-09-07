"""
Adaptive Clinical Question Selection Engine for MediKiosk.

Responsible for:
1. Pathway-driven clinical interview progression.
2. Preventing repeated or irrelevant questions.
3. Multilingual question generation (English, Hindi, Telugu).
4. Graceful handling of unknown/incomplete answers.
5. Detecting completion criteria so the intake does not endlessly loop.
"""

from typing import Dict, List, Any, Optional, Tuple
from app.services.conversation.clinical_ontology import resolve_pathway, ClinicalPathway, OntologyDomain
from app.services.llm.llm_service import llm_service


class QuestionEngine:
    # Standard sequence of clinical inquiry stages
    CLINICAL_STAGES = [
        "greeting",
        "chief_complaint",
        "onset",
        "duration",
        "location",
        "severity",
        "radiation",
        "associated_symptoms",
        "medical_history",
        "medications",
        "allergies",
        "confirmation",
    ]

    def select_next_step(
        self,
        current_topic: str,
        facts_collected: List[Dict[str, Any]],
        questions_asked: List[str],
        chief_complaint: Optional[str] = None,
        language: str = "en",
        accessibility_mode: str = "STANDARD",
    ) -> Tuple[str, bool]:
        """
        Determines the next topic and whether the interview has completed.
        Returns: (next_topic, is_completed)
        """
        # Identify active pathway
        pathway: ClinicalPathway = resolve_pathway(chief_complaint or "")

        # Collect what fields are already answered
        collected_fields = {f.get("field") for f in facts_collected if f.get("field")}
        collected_categories = {f.get("category") for f in facts_collected if f.get("category")}

        # Determine target topics based on pathway follow-up topics
        target_topics = []
        if "chief_complaint" not in questions_asked and OntologyDomain.CHIEF_COMPLAINT.value not in collected_categories:
            target_topics.append("chief_complaint")

        # Add pathway-specific fields
        for topic in pathway.follow_up_topics:
            if topic not in target_topics:
                target_topics.append(topic)

        # Standard general medical topics
        for standard_topic in ["medical_history", "medications", "allergies"]:
            if standard_topic not in target_topics:
                target_topics.append(standard_topic)

        # Find the first topic in sequence that hasn't been asked and whose field isn't already collected
        for topic in target_topics:
            if topic not in questions_asked and topic not in collected_fields:
                return topic, False

        # If all target topics have been addressed, we are ready for confirmation
        if "confirmation" not in questions_asked:
            return "confirmation", True

        return "confirmation", True

    async def get_question_text(
        self,
        topic: str,
        missing_fields: List[str],
        language: str = "en",
        accessibility_mode: str = "STANDARD",
    ) -> str:
        """Retrieves natural, localized question text via LLMService / MockLLMProvider."""
        return await llm_service.generate_followup_question(
            topic=topic,
            missing_fields=missing_fields,
            language=language,
            accessibility_mode=accessibility_mode,
        )
