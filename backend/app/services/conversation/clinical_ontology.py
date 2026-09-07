"""
Clinical Ontology for MediKiosk.

Controlled vocabulary and clinical pathways for the MVP intake conversation engine.
Adheres to the core principle: "AI collects. AI structures. AI highlights. The doctor decides."
"""

from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel


class OntologyDomain(str, Enum):
    DEMOGRAPHICS = "DEMOGRAPHICS"
    CHIEF_COMPLAINT = "CHIEF_COMPLAINT"
    SYMPTOM = "SYMPTOM"
    SYMPTOM_ONSET = "SYMPTOM_ONSET"
    SYMPTOM_DURATION = "SYMPTOM_DURATION"
    SYMPTOM_LOCATION = "SYMPTOM_LOCATION"
    SYMPTOM_SEVERITY = "SYMPTOM_SEVERITY"
    SYMPTOM_PROGRESS = "SYMPTOM_PROGRESS"
    ASSOCIATED_SYMPTOMS = "ASSOCIATED_SYMPTOMS"
    MEDICAL_HISTORY = "MEDICAL_HISTORY"
    MEDICATION = "MEDICATION"
    ALLERGY = "ALLERGY"
    SURGERY = "SURGERY"
    HOSPITALIZATION = "HOSPITALIZATION"
    FAMILY_HISTORY = "FAMILY_HISTORY"
    LIFESTYLE = "LIFESTYLE"
    VITAL_INFORMATION = "VITAL_INFORMATION"
    DOCUMENT_INFORMATION = "DOCUMENT_INFORMATION"
    RED_FLAG = "RED_FLAG"
    PATIENT_PREFERENCE = "PATIENT_PREFERENCE"
    UNKNOWN_INFORMATION = "UNKNOWN_INFORMATION"


class ClinicalConcept(BaseModel):
    code: str
    preferred_label: str
    domain: OntologyDomain
    synonyms: List[str] = []
    parent_concept: Optional[str] = None


class ClinicalPathway(BaseModel):
    name: str
    chief_complaint_triggers: List[str]
    required_fields: List[str]
    optional_fields: List[str]
    follow_up_topics: List[str]
    completion_threshold: int  # Minimum number of required fields answered


# =========================================================================
# Controlled Pathways for MVP
# =========================================================================

CHEST_PAIN_PATHWAY = ClinicalPathway(
    name="CHEST_PAIN_PATHWAY",
    chief_complaint_triggers=["chest pain", "chest tightness", "chest pressure", "chest discomfort", "angina", "heart pain", "chhati me dard", "gunde noppi"],
    required_fields=["onset", "duration", "location", "severity", "radiation"],
    optional_fields=["progression", "relation_to_exertion", "associated_symptoms", "cardiac_history", "current_medications"],
    follow_up_topics=["onset", "location", "radiation", "severity", "associated_symptoms", "medical_history", "medications", "allergies"],
    completion_threshold=4,
)

HEADACHE_PATHWAY = ClinicalPathway(
    name="HEADACHE_PATHWAY",
    chief_complaint_triggers=["headache", "head pain", "migraine", "sir dard", "tala noppi"],
    required_fields=["onset", "duration", "severity", "photo_phonophobia"],
    optional_fields=["location", "visual_changes", "neck_stiffness", "nausea", "previous_episodes"],
    follow_up_topics=["onset", "severity", "visual_changes", "neck_stiffness", "medical_history", "medications", "allergies"],
    completion_threshold=3,
)

RESPIRATORY_PATHWAY = ClinicalPathway(
    name="RESPIRATORY_PATHWAY",
    chief_complaint_triggers=["cough", "shortness of breath", "breathlessness", "difficulty breathing", "wheezing", "khansi", "aasa adadam ledu"],
    required_fields=["onset", "duration", "severity", "cough_nature"],
    optional_fields=["fever", "chest_pain", "sputum", "smoking_history"],
    follow_up_topics=["onset", "duration", "fever", "associated_symptoms", "medical_history", "medications", "allergies"],
    completion_threshold=3,
)

GENERAL_PATHWAY = ClinicalPathway(
    name="GENERAL_PATHWAY",
    chief_complaint_triggers=["fever", "abdominal pain", "body pain", "weakness", "fatigue", "dizziness", "general"],
    required_fields=["onset", "duration", "severity"],
    optional_fields=["location", "associated_symptoms", "medical_history", "medications", "allergies"],
    follow_up_topics=["onset", "duration", "severity", "associated_symptoms", "medical_history", "medications", "allergies"],
    completion_threshold=3,
)

ALL_PATHWAYS: List[ClinicalPathway] = [
    CHEST_PAIN_PATHWAY,
    HEADACHE_PATHWAY,
    RESPIRATORY_PATHWAY,
    GENERAL_PATHWAY,
]


def resolve_pathway(chief_complaint: str) -> ClinicalPathway:
    """Matches chief complaint to the appropriate clinical pathway."""
    normalized = chief_complaint.lower().strip()
    for pathway in ALL_PATHWAYS:
        for trigger in pathway.chief_complaint_triggers:
            if trigger in normalized:
                return pathway
    return GENERAL_PATHWAY


# =========================================================================
# Concept Normalization Maps
# =========================================================================

CONCEPT_SYNONYM_MAP: Dict[str, str] = {
    # Chest Pain & Cardiovascular
    "chest pain": "Chest pain",
    "chest tightness": "Chest tightness",
    "chest pressure": "Chest pressure",
    "heart pain": "Chest discomfort",
    "chhati me dard": "Chest pain",
    "gunde noppi": "Chest pain",
    "left arm": "Left upper extremity",
    "left shoulder": "Left shoulder",
    "jaw": "Jaw",
    "radiating": "Radiating pain",

    # Headache & Neurological
    "headache": "Headache",
    "throbbing headache": "Throbbing headache",
    "migraine": "Migraine",
    "sir dard": "Headache",
    "tala noppi": "Headache",

    # Respiratory
    "shortness of breath": "Dyspnea",
    "breathlessness": "Dyspnea",
    "difficulty breathing": "Dyspnea",
    "khansi": "Cough",
    "cough": "Cough",

    # General
    "fever": "Pyrexia",
    "bukhar": "Pyrexia",
    "sweating": "Diaphoresis",
    "pasiina": "Diaphoresis",

    # Medical History
    "bp": "Hypertension",
    "high blood pressure": "Hypertension",
    "sugar": "Diabetes Mellitus Type 2",
    "diabetes": "Diabetes Mellitus Type 2",
    "asthma": "Bronchial Asthma",

    # Allergies
    "penicillin": "Penicillin",
    "sulfa": "Sulfonamides",
    "aspirin": "Aspirin",
    "no allergies": "No Known Drug Allergies (NKDA)",
    "no known allergies": "No Known Drug Allergies (NKDA)",
    "koyi allergy nahi": "No Known Drug Allergies (NKDA)",
    "emi levu": "No Known Drug Allergies (NKDA)",
}


def normalize_concept(text: str) -> str:
    """Normalizes colloquial terms or multilingual expressions into standard clinical concept labels."""
    normalized = text.lower().strip()
    for key, val in CONCEPT_SYNONYM_MAP.items():
        if key in normalized:
            return val
    return text.strip().capitalize()
