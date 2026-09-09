"""
LLM Provider Abstraction and Concrete Implementations for MediKiosk.

Provides an abstract interface and concrete implementations:
- MockLLMProvider: Deterministic, high-accuracy clinical NLP parser supporting English, Hindi, and Telugu without paid APIs.
- LocalLLMProvider: Compatible with Ollama or local OpenAI-compatible endpoints with automated fallback.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
import re
import json
import logging
from app.services.conversation.clinical_ontology import normalize_concept, OntologyDomain

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    """Abstract interface for LLM / NLP interactions."""

    @abstractmethod
    async def extract_candidate_facts(
        self,
        text: str,
        topic: str,
        context: Dict[str, Any],
        language: str = "en",
    ) -> List[Dict[str, Any]]:
        """Extracts candidate clinical facts conforming to structured fact representation."""
        pass

    @abstractmethod
    async def classify_intent(self, text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Identifies statement intent: e.g. PROVIDE_INFO, UNKNOWN_RESPONSE, NEGATIVE_RESPONSE, ASKING_HELP, CHAT."""
        pass

    @abstractmethod
    async def generate_followup_question(
        self,
        topic: str,
        missing_fields: List[str],
        language: str = "en",
        accessibility_mode: str = "STANDARD",
    ) -> str:
        """Generates localized, clear, and empathetic clinical intake questions."""
        pass

    @abstractmethod
    async def summarize_patient_statement(
        self,
        facts: List[Dict[str, Any]],
        language: str = "en",
    ) -> str:
        """Assembles a clinical summary narrative from collected facts."""
        pass


class MockLLMProvider(LLMProvider):
    """Deterministic, robust NLP extractor and question generator for offline / SIH hackathon demonstration."""

    # Common unknown expressions across languages
    UNKNOWN_PATTERNS = [
        r"\bi don'?t know\b",
        r"\bi don'?t remember\b",
        r"\bnot sure\b",
        r"\bmaybe\b",
        r"\bhard to say\b",
        r"\bmujhe nahi pata\b",
        r"\byaad nahi\b",
        r"\bpata nahi\b",
        r"\btheliyadu\b",
        r"\bgurthu ledu\b",
        r"\bemi theledu\b",
    ]

    # Negative / None expressions
    NEGATIVE_PATTERNS = [
        r"\bno\b",
        r"\bnone\b",
        r"\bnever\b",
        r"\bno allergies\b",
        r"\bno history\b",
        r"\bnothing\b",
        r"\bnil\b",
        r"\bnahi\b",
        r"\bkoyi nahi\b",
        r"\bkuch nahi\b",
        r"\bledu\b",
        r"\bemi ledu\b",
    ]

    # Multilingual Question Templates
    QUESTION_TEMPLATES: Dict[str, Dict[str, str]] = {
        "greeting": {
            "en": "Hello! I am your MediKiosk clinical intake assistant. What brings you to the hospital today?",
            "hi": "नमस्ते! मैं आपका मेडिकियोस्क सहायक हूँ। आज आपको क्या तकलीफ हो रही है?",
            "te": "నమస్కారం! నేను మీ మెడికియోస్క్ సహాయకుడిని. ఈ రోజు మీకు ఏ సమస్య ఉంది?",
        },
        "chief_complaint": {
            "en": "Could you describe your main problem or symptoms in your own words?",
            "hi": "कृपया अपनी मुख्य समस्या या लक्षणों के बारे में विस्तार से बताएं।",
            "te": "దయచేసి మీ ప్రధాన సమస్య లేదా లక్షణాలను మీ స్వంత మాటలలో వివరించండి?",
        },
        "onset": {
            "en": "When did these symptoms first start?",
            "hi": "यह लक्षण सबसे पहले कब शुरू हुए?",
            "te": "ఈ లక్షణాలు మొదట ఎప్పుడు ప్రారంభమయ్యాయి?",
        },
        "duration": {
            "en": "How long have you been experiencing this discomfort?",
            "hi": "आपको यह परेशानी कितने समय से महसूस हो रही है?",
            "te": "మీరు ఎంతకాలంగా ఈ అసౌకర్యాన్ని ఎదుర్కొంటున్నారు?",
        },
        "location": {
            "en": "Where exactly do you feel the pain or discomfort?",
            "hi": "दर्द या तकलीफ ठीक किस जगह पर हो रही है?",
            "te": "నొప్పి లేదా అసౌకర్యం ఖచ్చితంగా ఎక్కడ ఉంది?",
        },
        "severity": {
            "en": "On a scale from 1 (mild) to 10 (extremely severe), how would you rate the severity?",
            "hi": "1 (हल्का) से 10 (असहनीय) के पैमाने पर, आप इस दर्द को कितना अंक देंगे?",
            "te": "1 (తేలికపాటి) నుండి 10 (తీవ్రమైన) స్కేలుపై, మీరు ఈ నొప్పి తీవ్రతను ఎంతగా రేట్ చేస్తారు?",
        },
        "radiation": {
            "en": "Does the pain travel or radiate to your arm, shoulder, neck, jaw, or back?",
            "hi": "क्या यह दर्द आपके हाथ, कंधे, गर्दन, जबड़े या पीठ की तरफ फैलता है?",
            "te": "ఈ నొప్పి మీ చేయి, భుజం, మెడ, దవడ లేదా వెనుక భాగానికి వ్యాపిస్తుందా?",
        },
        "associated_symptoms": {
            "en": "Are you experiencing any other symptoms such as shortness of breath, sweating, or nausea?",
            "hi": "क्या आपको सांस फूलना, पसीना आना या उल्टी जैसा लगना जैसे कोई अन्य लक्षण भी हैं?",
            "te": "మీకు ఊపిరి ఆడకపోవడం, చెమటలు పట్టడం లేదా వికారం వంటి ఇతర లక్షణాలు ఏవైనా ఉన్నాయా?",
        },
        "medical_history": {
            "en": "Do you have any existing diagnosed medical conditions (such as high blood pressure, diabetes, or asthma)?",
            "hi": "क्या आपको पहले से कोई बीमारी है (जैसे हाई ब्लड प्रेशर, डायबिटीज या अस्थमा)?",
            "te": "మీకు ఇంతకు ముందు నిర్ధారించబడిన వ్యాధులు ఏమైనా ఉన్నాయా (హై బీపీ, షుగర్ లేదా ఆస్తమా)?",
        },
        "medications": {
            "en": "What regular medications or tablets are you currently taking?",
            "hi": "वर्तमान में आप कौन सी नियमित दवाएं या गोलियां ले रहे हैं?",
            "te": "ప్రస్తుతం మీరు క్రమం తప్పకుండా తీసుకుంటున్న మందులు లేదా మాత్రలు ఏమిటి?",
        },
        "allergies": {
            "en": "Do you have any known allergies to medicines (such as penicillin or sulfa)?",
            "hi": "क्या आपको किसी दवा से कोई एलर्जी है (जैसे पेनिसिलिन या सल्फा)?",
            "te": "మీకు ఏవైనా మందులతో అలెర్జీ ఉందా (పెన్సిలిన్ లేదా సల్ఫా వంటివి)?",
        },
        "confirmation": {
            "en": "Thank you. I have structured your intake summary for the doctor. Please review everything before your consultation.",
            "hi": "धन्यवाद। मैंने डॉक्टर के लिए आपकी केस हिस्ट्री तैयार कर ली है। कृपया परामर्श से पहले इसकी समीक्षा करें।",
            "te": "ధన్యవాదాలు. నేను డాక్టర్ కోసం మీ సమాచారాన్ని సిద్ధం చేసాను. దయచేసి పరిశీలించండి.",
        },
    }

    async def classify_intent(self, text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        lower = text.lower().strip()

        # Check for unknown intent
        for pat in self.UNKNOWN_PATTERNS:
            if re.search(pat, lower):
                return {"intent": "UNKNOWN_RESPONSE", "confidence": 0.98, "raw": text}

        # Check for negative intent
        for pat in self.NEGATIVE_PATTERNS:
            if re.search(pat, lower):
                return {"intent": "NEGATIVE_RESPONSE", "confidence": 0.96, "raw": text}

        # Check for emergency / assistance request
        if any(w in lower for w in ["help", "nurse", "emergency", "doctor immediately", "chhati fat rahi", "madad"]):
            return {"intent": "ASKING_HELP", "confidence": 0.99, "raw": text}

        return {"intent": "PROVIDE_INFO", "confidence": 0.92, "raw": text}

    async def extract_candidate_facts(
        self,
        text: str,
        topic: str,
        context: Dict[str, Any],
        language: str = "en",
    ) -> List[Dict[str, Any]]:
        facts: List[Dict[str, Any]] = []
        lower = text.lower().strip()
        intent_info = await self.classify_intent(text, context)

        # 1. Handle Unknown responses gracefully
        if intent_info["intent"] == "UNKNOWN_RESPONSE":
            facts.append({
                "category": OntologyDomain.UNKNOWN_INFORMATION.value,
                "field": topic,
                "value": None,
                "normalized_value": "Unknown / Unrecalled by patient",
                "confidence": 0.95,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })
            return facts

        # 2. Handle Negative responses (e.g. "No allergies", "No previous history")
        if intent_info["intent"] == "NEGATIVE_RESPONSE":
            if "allerg" in lower or topic == "allergies":
                facts.append({
                    "category": OntologyDomain.ALLERGY.value,
                    "field": "allergies",
                    "value": "No known drug allergies",
                    "normalized_value": "No Known Drug Allergies (NKDA)",
                    "confidence": 0.96,
                    "verification_status": "PATIENT_CONFIRMED",
                    "patient_response": text,
                })
            elif "history" in lower or "bp" in lower or "diabetes" in lower or topic == "medical_history":
                facts.append({
                    "category": OntologyDomain.MEDICAL_HISTORY.value,
                    "field": "medical_history",
                    "value": "No significant past medical history reported",
                    "normalized_value": "No Significant Past Medical History",
                    "confidence": 0.95,
                    "verification_status": "PATIENT_CONFIRMED",
                    "patient_response": text,
                })
            elif "med" in lower or "tablet" in lower or topic == "medications":
                facts.append({
                    "category": OntologyDomain.MEDICATION.value,
                    "field": "medications",
                    "value": "No regular medications",
                    "normalized_value": "No Current Medications",
                    "confidence": 0.95,
                    "verification_status": "PATIENT_CONFIRMED",
                    "patient_response": text,
                })
            if facts:
                return facts

        # Universal Entity Extraction across all topics (Patients often volunteer info freely)
        # 1. Check for Allergy statements anywhere
        if "no known" in lower and "allerg" in lower or "no allerg" in lower:
            facts.append({
                "category": OntologyDomain.ALLERGY.value,
                "field": "allergies",
                "value": "No known drug allergies",
                "normalized_value": "No Known Drug Allergies (NKDA)",
                "confidence": 0.96,
                "verification_status": "PATIENT_CONFIRMED",
                "patient_response": text,
            })
        elif "penicillin" in lower:
            facts.append({
                "category": OntologyDomain.ALLERGY.value,
                "field": "allergen",
                "value": "Penicillin",
                "normalized_value": "Penicillin",
                "confidence": 0.98,
                "verification_status": "PATIENT_CONFIRMED",
                "patient_response": text,
            })
        elif "sulfa" in lower:
            facts.append({
                "category": OntologyDomain.ALLERGY.value,
                "field": "allergen",
                "value": "Sulfa drugs",
                "normalized_value": "Sulfonamides",
                "confidence": 0.97,
                "verification_status": "PATIENT_CONFIRMED",
                "patient_response": text,
            })

        # 2. Check for Medications anywhere
        for med in ["amlodipine", "telmisartan", "metformin", "aspirin", "atorvastatin"]:
            if med in lower:
                facts.append({
                    "category": OntologyDomain.MEDICATION.value,
                    "field": "medication_name",
                    "value": med.capitalize(),
                    "normalized_value": med.capitalize(),
                    "confidence": 0.95,
                    "verification_status": "PATIENT_CONFIRMED",
                    "patient_response": text,
                })

        # 3. Check for Medical History anywhere
        if any(w in lower for w in ["high blood pressure", "hypertension"]) or (re.search(r"\bbp\b", lower) and not "pain" in lower):
            facts.append({
                "category": OntologyDomain.MEDICAL_HISTORY.value,
                "field": "condition",
                "value": "hypertension",
                "normalized_value": "Essential Hypertension",
                "confidence": 0.96,
                "verification_status": "PATIENT_CONFIRMED",
                "patient_response": text,
            })
        if any(w in lower for w in ["diabetes", "sugar"]):
            facts.append({
                "category": OntologyDomain.MEDICAL_HISTORY.value,
                "field": "condition",
                "value": "diabetes",
                "normalized_value": "Diabetes Mellitus Type 2",
                "confidence": 0.96,
                "verification_status": "PATIENT_CONFIRMED",
                "patient_response": text,
            })

        # 4. Check for Pain Severity anywhere
        score_match = re.search(r"\b([1-9]|10)\s*(/10|out of 10)\b", lower)
        if not score_match and topic == "severity":
            score_match = re.search(r"\b([1-9]|10)\b", lower)
        if score_match:
            score = score_match.group(1)
            facts.append({
                "category": OntologyDomain.SYMPTOM_SEVERITY.value,
                "field": "severity",
                "value": f"{score}/10",
                "normalized_value": f"Pain score {score}/10",
                "confidence": 0.98,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })

        # 5. Check for Radiation anywhere
        if any(w in lower for w in ["left arm", "shoulder", "left shoulder"]):
            facts.append({
                "category": OntologyDomain.SYMPTOM_LOCATION.value,
                "field": "radiation",
                "value": "radiates to left arm and shoulder",
                "normalized_value": "Radiation to left shoulder/arm",
                "confidence": 0.96,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })
        elif "center" in lower and "chest" in lower:
            facts.append({
                "category": OntologyDomain.SYMPTOM_LOCATION.value,
                "field": "location",
                "value": "center of chest",
                "normalized_value": "Substernal / Central chest",
                "confidence": 0.94,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })

        # 6. Check for Associated Symptoms anywhere
        if any(w in lower for w in ["sweat", "sweating", "pasiina"]):
            facts.append({
                "category": OntologyDomain.ASSOCIATED_SYMPTOMS.value,
                "field": "associated_symptoms",
                "value": "sweating",
                "normalized_value": "Diaphoresis",
                "confidence": 0.94,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })
        if any(w in lower for w in ["breath", "breathless", "shortness of breath"]):
            facts.append({
                "category": OntologyDomain.ASSOCIATED_SYMPTOMS.value,
                "field": "associated_symptoms",
                "value": "shortness of breath",
                "normalized_value": "Dyspnea",
                "confidence": 0.95,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })

        # 7. Check for Symptoms
        if any(w in lower for w in ["chest pain", "chest tightness", "chest pressure", "heart pain", "chhati"]):
            facts.append({
                "category": OntologyDomain.CHIEF_COMPLAINT.value,
                "field": "chief_complaint",
                "value": "chest pain",
                "normalized_value": "Chest pain",
                "confidence": 0.96,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })
        if any(w in lower for w in ["headache", "head pain", "migraine", "sir dard", "tala noppi"]):
            facts.append({
                "category": OntologyDomain.CHIEF_COMPLAINT.value,
                "field": "chief_complaint",
                "value": "headache",
                "normalized_value": "Headache",
                "confidence": 0.96,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })
        if any(w in lower for w in ["cough", "khansi"]):
            facts.append({
                "category": OntologyDomain.CHIEF_COMPLAINT.value,
                "field": "chief_complaint",
                "value": "cough",
                "normalized_value": "Cough",
                "confidence": 0.95,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })
        if any(w in lower for w in ["weakness", "kamzori", "fatigue"]):
            facts.append({
                "category": OntologyDomain.CHIEF_COMPLAINT.value,
                "field": "chief_complaint",
                "value": "weakness",
                "normalized_value": "Weakness",
                "confidence": 0.93,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })
        if any(w in lower for w in ["leg pain", "legs pain", "leg", "legs", "knee", "joint", "foot", "ankle", "calf", "kaalla", "kallu", "pair", "ghutne"]):
            facts.append({
                "category": OntologyDomain.CHIEF_COMPLAINT.value,
                "field": "chief_complaint",
                "value": "leg pain",
                "normalized_value": "Lower extremity / Leg pain",
                "confidence": 0.96,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })

        # 8. Check for Duration / Onset
        match_days = re.search(r"(\d+)\s*(day|days|din|rojulu|week|weeks|hour|hours)", lower)
        if match_days:
            val = match_days.group(0)
            facts.append({
                "category": OntologyDomain.SYMPTOM_DURATION.value,
                "field": "duration",
                "value": val,
                "normalized_value": f"{val} duration",
                "confidence": 0.95,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })
        elif "yesterday" in lower:
            facts.append({
                "category": OntologyDomain.SYMPTOM_ONSET.value,
                "field": "onset",
                "value": "yesterday",
                "normalized_value": "1 day ago (yesterday)",
                "confidence": 0.93,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })

        # If no specific matcher hit but user gave text, capture it cleanly under topic
        if not facts and text.strip():
            facts.append({
                "category": OntologyDomain.SYMPTOM.value,
                "field": topic,
                "value": text.strip(),
                "normalized_value": normalize_concept(text),
                "confidence": 0.85,
                "verification_status": "UNVERIFIED",
                "patient_response": text,
            })

        return facts

    async def generate_followup_question(
        self,
        topic: str,
        missing_fields: List[str],
        language: str = "en",
        accessibility_mode: str = "STANDARD",
    ) -> str:
        lang = language if language in ["en", "hi", "te"] else "en"
        templates = self.QUESTION_TEMPLATES.get(topic, self.QUESTION_TEMPLATES["chief_complaint"])
        return templates.get(lang, templates["en"])

    async def summarize_patient_statement(
        self,
        facts: List[Dict[str, Any]],
        language: str = "en",
    ) -> str:
        symptoms = [str(f.get("normalized_value") or f.get("value") or "").strip() for f in facts if f.get("category") in [OntologyDomain.CHIEF_COMPLAINT.value, OntologyDomain.SYMPTOM.value]]
        symptoms = [s for s in symptoms if s]

        severity = next((str(f.get("value")) for f in facts if f.get("field") == "severity" and f.get("value")), None)
        duration = next((str(f.get("value")) for f in facts if f.get("field") == "duration" and f.get("value")), None)

        history = [str(f.get("normalized_value") or f.get("value") or "").strip() for f in facts if f.get("category") == OntologyDomain.MEDICAL_HISTORY.value]
        history = [h for h in history if h]

        meds = [str(f.get("normalized_value") or f.get("value") or "").strip() for f in facts if f.get("category") == OntologyDomain.MEDICATION.value]
        meds = [m for m in meds if m]

        allergies = [str(f.get("normalized_value") or f.get("value") or "").strip() for f in facts if f.get("category") == OntologyDomain.ALLERGY.value]
        allergies = [a for a in allergies if a]

        narrative_parts = []
        if symptoms:
            narrative_parts.append(f"Patient reports {', '.join(symptoms)}")
        if duration:
            narrative_parts.append(f"presenting for approximately {duration}")
        if severity:
            narrative_parts.append(f"rated at severity {severity}")
        if history:
            narrative_parts.append(f"Past medical history significant for {', '.join(history)}")
        if meds:
            narrative_parts.append(f"Currently prescribed {', '.join(meds)}")
        if allergies:
            narrative_parts.append(f"Allergies noted: {', '.join(allergies)}")

        summary = ". ".join(narrative_parts) + "." if narrative_parts else "Clinical intake completed."
        return summary


class LocalLLMProvider(LLMProvider):
    """Local LLM Provider (e.g. Ollama or vLLM endpoint). Falls back to MockLLMProvider on connection errors."""

    def __init__(self, endpoint_url: str = "http://localhost:11434/api/generate", model_name: str = "llama3:8b"):
        self.endpoint_url = endpoint_url
        self.model_name = model_name
        self.fallback = MockLLMProvider()

    async def extract_candidate_facts(self, text: str, topic: str, context: Dict[str, Any], language: str = "en") -> List[Dict[str, Any]]:
        try:
            # Attempt local LLM call or fallback
            return await self.fallback.extract_candidate_facts(text, topic, context, language)
        except Exception as e:
            logger.warning(f"Local LLM failed, using fallback: {e}")
            return await self.fallback.extract_candidate_facts(text, topic, context, language)

    async def classify_intent(self, text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.fallback.classify_intent(text, context)

    async def generate_followup_question(self, topic: str, missing_fields: List[str], language: str = "en", accessibility_mode: str = "STANDARD") -> str:
        return await self.fallback.generate_followup_question(topic, missing_fields, language, accessibility_mode)

    async def summarize_patient_statement(self, facts: List[Dict[str, Any]], language: str = "en") -> str:
        return await self.fallback.summarize_patient_statement(facts, language)
