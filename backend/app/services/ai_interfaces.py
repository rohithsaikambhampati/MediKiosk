"""
AI Service Interfaces and Mock Implementations for MediKiosk.

These interfaces define the contracts for AI subsystems (LLM, OCR, NLP, Risk, Timeline, Summary).
They allow the backend to operate standalone with deterministic mock behaviors now,
and swap in production AI providers later without altering business logic or database schemas.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ConversationInput(BaseModel):
    session_id: str
    patient_id: str
    message: str
    language: str = "en"
    audio_present: bool = False
    context: Dict[str, Any] = {}


class ConversationOutput(BaseModel):
    reply_text: str
    reply_audio_url: Optional[str] = None
    language: str
    detected_intent: Optional[str] = None
    extracted_entities: List[Dict[str, Any]] = []
    suggested_followups: List[str] = []
    confidence: float = 0.95


class DocumentProcessingResult(BaseModel):
    extracted_text: str
    document_type: str
    language: str = "en"
    confidence: float = 0.90
    extracted_entities: List[Dict[str, Any]] = []
    raw_ocr_metadata: Dict[str, Any] = {}


class ClinicalSummaryResult(BaseModel):
    chief_complaint: str
    hpi: str
    vital_summary: Optional[str] = None
    key_findings: List[str] = []
    suggested_diagnoses: List[str] = []
    suggested_plan: List[str] = []
    confidence: float = 0.90


class RiskEvaluationResult(BaseModel):
    overall_risk: str  # LOW, MODERATE, HIGH, CRITICAL
    risk_score: float  # 0.0 - 1.0
    flags: List[Dict[str, Any]] = []
    reasons: List[str] = []
    recommended_action: str


# ==========================================
# Abstract Interfaces
# ==========================================

class IConversationEngine(ABC):
    """Contract for conversational intake dialogue engine."""
    @abstractmethod
    async def process_turn(self, input_data: ConversationInput) -> ConversationOutput:
        pass


class IDocumentProcessor(ABC):
    """Contract for medical document OCR and entity parsing."""
    @abstractmethod
    async def process_document(self, file_bytes: bytes, file_name: str, content_type: str) -> DocumentProcessingResult:
        pass


class IMedicalNLPEngine(ABC):
    """Contract for extracting structured medical facts from unstructured text."""
    @abstractmethod
    async def extract_facts(self, text: str, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        pass


class ITimelineEngine(ABC):
    """Contract for assembling clinical chronology from multi-modal inputs."""
    @abstractmethod
    async def generate_timeline(self, patient_history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass


class IRiskEngine(ABC):
    """Contract for clinical risk scoring and emergency triage flag identification."""
    @abstractmethod
    async def evaluate_risk(self, clinical_context: Dict[str, Any]) -> RiskEvaluationResult:
        pass


class ISummaryEngine(ABC):
    """Contract for generating structured doctor-facing clinical summaries."""
    @abstractmethod
    async def generate_summary(self, patient_data: Dict[str, Any]) -> ClinicalSummaryResult:
        pass


class IConfidenceEngine(ABC):
    """Contract for calculating composite evidence confidence scores."""
    @abstractmethod
    def calculate_confidence(self, sources: List[Dict[str, Any]]) -> float:
        pass


# ==========================================
# Mock Implementations (Deterministic Stubs)
# ==========================================

class MockConversationEngine(IConversationEngine):
    async def process_turn(self, input_data: ConversationInput) -> ConversationOutput:
        # Default mock response acknowledging the patient's statement
        return ConversationOutput(
            reply_text=f"I understand your concern regarding: '{input_data.message}'. Could you tell me when this started?",
            language=input_data.language,
            detected_intent="symptom_inquiry",
            suggested_followups=["It started today", "A few days ago", "More than a week ago"],
            confidence=0.92,
        )


class MockDocumentProcessor(IDocumentProcessor):
    async def process_document(self, file_bytes: bytes, file_name: str, content_type: str) -> DocumentProcessingResult:
        return DocumentProcessingResult(
            extracted_text=f"Processed medical document: {file_name}. Contains lab report / prescription data.",
            document_type="PRESCRIPTION" if "rx" in file_name.lower() or "presc" in file_name.lower() else "LAB_REPORT",
            confidence=0.88,
            extracted_entities=[
                {"name": "Metformin", "category": "medication", "confidence": 0.95},
                {"name": "Type 2 Diabetes", "category": "condition", "confidence": 0.90}
            ]
        )


class MockMedicalNLPEngine(IMedicalNLPEngine):
    async def extract_facts(self, text: str, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        return [
            {
                "category": "SYMPTOM",
                "name": "Chest discomfort" if "chest" in text.lower() else "Reported symptom",
                "value": "Mild to moderate",
                "confidence": 0.88,
                "status": "SUGGESTED"
            }
        ]


class MockTimelineEngine(ITimelineEngine):
    async def generate_timeline(self, patient_history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return patient_history


class MockRiskEngine(IRiskEngine):
    async def evaluate_risk(self, clinical_context: Dict[str, Any]) -> RiskEvaluationResult:
        complaint = str(clinical_context.get("chief_complaint", "")).lower()
        if "chest pain" in complaint or "unconscious" in complaint or "severe bleeding" in complaint:
            return RiskEvaluationResult(
                overall_risk="CRITICAL",
                risk_score=0.95,
                flags=[{"flag": "CARDIAC_RED_FLAG", "severity": "CRITICAL", "description": "Acute chest pain reported"}],
                reasons=["Acute chest pain requires immediate triage and ECG"],
                recommended_action="Emergency cardiology triage immediately"
            )
        elif "fever" in complaint or "shortness of breath" in complaint:
            return RiskEvaluationResult(
                overall_risk="MODERATE",
                risk_score=0.55,
                flags=[{"flag": "RESPIRATORY_SYMPTOM", "severity": "MODERATE", "description": "Fever or breathing discomfort"}],
                reasons=["Moderate symptom onset noted"],
                recommended_action="Priority triage assessment"
            )
        return RiskEvaluationResult(
            overall_risk="LOW",
            risk_score=0.15,
            flags=[],
            reasons=["Routine presentation without acute red flags"],
            recommended_action="Standard queue routing"
        )


class MockSummaryEngine(ISummaryEngine):
    async def generate_summary(self, patient_data: Dict[str, Any]) -> ClinicalSummaryResult:
        return ClinicalSummaryResult(
            chief_complaint=patient_data.get("chief_complaint", "General consultation"),
            hpi="Patient presented to kiosk for initial intake. Structured intake completed.",
            vital_summary="Vitals within acceptable range.",
            key_findings=["Structured intake completed", "Previous records attached"],
            suggested_diagnoses=["Under clinical evaluation"],
            suggested_plan=["Doctor review", "Physical examination"],
            confidence=0.90
        )


class MockConfidenceEngine(IConfidenceEngine):
    def calculate_confidence(self, sources: List[Dict[str, Any]]) -> float:
        if not sources:
            return 0.50
        confidences = [s.get("confidence", 0.70) for s in sources]
        return round(sum(confidences) / len(confidences), 2)
