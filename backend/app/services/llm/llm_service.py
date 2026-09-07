"""
LLM Service Wrapper for MediKiosk.

Handles provider selection, resilience, timeouts, and safe execution.
Never allows LLM failure to crash the patient intake workflow.
"""

import logging
from typing import Dict, List, Any, Optional
from app.core.config import settings
from app.services.llm.llm_provider import LLMProvider, MockLLMProvider, LocalLLMProvider

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        provider_name = getattr(settings, "LLM_PROVIDER", "mock").lower()
        if provider_name in ["ollama", "local"]:
            logger.info("Initializing LocalLLMProvider")
            self.provider: LLMProvider = LocalLLMProvider()
        else:
            logger.info("Initializing MockLLMProvider (Default, Offline-Ready)")
            self.provider = MockLLMProvider()

    async def extract_candidate_facts(
        self,
        text: str,
        topic: str,
        context: Dict[str, Any],
        language: str = "en",
    ) -> List[Dict[str, Any]]:
        try:
            return await self.provider.extract_candidate_facts(text, topic, context, language)
        except Exception as exc:
            logger.error(f"LLM extraction error: {exc}. Falling back to default mock extraction.")
            fallback = MockLLMProvider()
            return await fallback.extract_candidate_facts(text, topic, context, language)

    async def classify_intent(self, text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        try:
            return await self.provider.classify_intent(text, context)
        except Exception as exc:
            logger.error(f"LLM intent error: {exc}. Falling back to default intent.")
            return {"intent": "PROVIDE_INFO", "confidence": 0.85, "raw": text}

    async def generate_followup_question(
        self,
        topic: str,
        missing_fields: List[str],
        language: str = "en",
        accessibility_mode: str = "STANDARD",
    ) -> str:
        try:
            return await self.provider.generate_followup_question(topic, missing_fields, language, accessibility_mode)
        except Exception as exc:
            logger.error(f"LLM question error: {exc}. Falling back to default question.")
            fallback = MockLLMProvider()
            return await fallback.generate_followup_question(topic, missing_fields, language, accessibility_mode)

    async def summarize_patient_statement(
        self,
        facts: List[Dict[str, Any]],
        language: str = "en",
    ) -> str:
        try:
            return await self.provider.summarize_patient_statement(facts, language)
        except Exception as exc:
            logger.error(f"LLM summary error: {exc}. Falling back to rule summary.")
            fallback = MockLLMProvider()
            return await fallback.summarize_patient_statement(facts, language)


# Global singleton instance
llm_service = LLMService()
