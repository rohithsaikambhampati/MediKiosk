"""
Clinical Red Flag Rules for MediKiosk.

Explicit, deterministic rules for patient safety signaling.
Adheres strictly to the product principle:
"AI collects. AI structures. AI highlights. The doctor decides."
These rules identify safety signals and prioritize clinician review. They NEVER diagnose diseases.
"""

from typing import Dict, List, Any
from pydantic import BaseModel


class ClinicalRiskRule(BaseModel):
    rule_id: str
    category: str
    trigger: str
    severity: str  # HIGH_PRIORITY, IMMEDIATE
    message: str
    requires_clinician_review: bool = True


# =========================================================================
# Deterministic Clinical Safety Rules
# =========================================================================

RED_FLAG_RULES: List[ClinicalRiskRule] = [
    ClinicalRiskRule(
        rule_id="RF001",
        category="severe_symptom_report",
        trigger="Chest pain or discomfort reported with high severity (>= 7/10) or radiation to left arm/jaw",
        severity="HIGH_PRIORITY",
        message="Potential clinical red flag: High-severity chest discomfort reported with possible radiation. Prompt clinician evaluation recommended.",
        requires_clinician_review=True,
    ),
    ClinicalRiskRule(
        rule_id="RF002",
        category="severe_breathing_difficulty",
        trigger="Shortness of breath, acute dyspnea, or breathlessness at rest reported",
        severity="HIGH_PRIORITY",
        message="Potential clinical red flag: Patient reports breathing difficulty. Clinician review recommended.",
        requires_clinician_review=True,
    ),
    ClinicalRiskRule(
        rule_id="RF003",
        category="sudden_onset_concerning_symptom",
        trigger="Sudden severe headache ('worst headache of life') or sudden neurological changes reported",
        severity="HIGH_PRIORITY",
        message="Potential clinical red flag: Sudden severe headache reported. Clinician evaluation recommended.",
        requires_clinician_review=True,
    ),
    ClinicalRiskRule(
        rule_id="RF004",
        category="severe_allergic_reaction",
        trigger="Facial swelling, lip swelling, throat tightness, or acute hives after medication",
        severity="IMMEDIATE",
        message="Potential clinical red flag: Acute allergic reaction indicators reported. Immediate clinician evaluation recommended.",
        requires_clinician_review=True,
    ),
    ClinicalRiskRule(
        rule_id="RF005",
        category="loss_of_consciousness",
        trigger="Fainting, syncope, blacking out, or sudden loss of consciousness reported",
        severity="HIGH_PRIORITY",
        message="Potential clinical red flag: Episode of syncope or altered consciousness reported. Clinician review recommended.",
        requires_clinician_review=True,
    ),
    ClinicalRiskRule(
        rule_id="RF006",
        category="significant_bleeding",
        trigger="Active or significant bleeding reported",
        severity="HIGH_PRIORITY",
        message="Potential clinical red flag: Significant bleeding reported. Clinical examination recommended.",
        requires_clinician_review=True,
    ),
]


def evaluate_rules(facts: List[Dict[str, Any]], patient_message: str = "") -> List[Dict[str, Any]]:
    """Evaluates collected clinical facts and natural language against deterministic safety rules."""
    detected_flags: List[Dict[str, Any]] = []
    combined_text = (
        patient_message.lower() + " " +
        " ".join(str(f.get("value", "")).lower() for f in facts) + " " +
        " ".join(str(f.get("normalized_value", "")).lower() for f in facts)
    )

    # Check RF001: Chest Pain + High Severity or Radiation
    has_chest_pain = any(
        "chest" in str(f.get("value", "")).lower() or "angina" in str(f.get("normalized_value", "")).lower()
        for f in facts
    ) or "chest" in patient_message.lower()

    has_high_severity = any(
        f.get("field") == "severity" and any(s in str(f.get("value", "")) for s in ["7", "8", "9", "10"])
        for f in facts
    ) or any(s in patient_message.lower() for s in ["7/10", "8/10", "9/10", "10/10", "severe"])

    has_radiation = any(
        f.get("field") == "radiation" or "radiat" in str(f.get("value", "")).lower() or "left arm" in str(f.get("value", "")).lower()
        for f in facts
    ) or "left arm" in patient_message.lower() or "radiat" in patient_message.lower()

    if has_chest_pain and (has_high_severity or has_radiation):
        rule = next(r for r in RED_FLAG_RULES if r.rule_id == "RF001")
        detected_flags.append(rule.model_dump())

    # Check RF002: Severe Breathing Difficulty / Dyspnea
    has_dyspnea = any(
        "dyspnea" in str(f.get("normalized_value", "")).lower() or
        "shortness of breath" in str(f.get("value", "")).lower() or
        "breathlessness" in str(f.get("value", "")).lower()
        for f in facts
    ) or any(w in patient_message.lower() for w in ["shortness of breath", "breathless", "difficulty breathing", "saans"])

    if has_dyspnea:
        rule = next(r for r in RED_FLAG_RULES if r.rule_id == "RF002")
        detected_flags.append(rule.model_dump())

    # Check RF003: Sudden Severe Headache
    has_headache = any("headache" in str(f.get("value", "")).lower() for f in facts) or "headache" in patient_message.lower()
    is_explosive = any(w in combined_text for w in ["worst headache", "sudden", "thunderclap", "explosive"])
    if has_headache and is_explosive:
        rule = next(r for r in RED_FLAG_RULES if r.rule_id == "RF003")
        detected_flags.append(rule.model_dump())

    # Check RF004: Severe Allergic Reaction Indicators
    if any(w in combined_text for w in ["swelling in face", "facial swelling", "throat closing", "throat tightness", "anaphylaxis"]):
        rule = next(r for r in RED_FLAG_RULES if r.rule_id == "RF004")
        detected_flags.append(rule.model_dump())

    # Check RF005: Loss of Consciousness / Syncope
    if any(w in combined_text for w in ["fainted", "fainting", "passed out", "blacked out", "lost consciousness", "behoshi"]):
        rule = next(r for r in RED_FLAG_RULES if r.rule_id == "RF005")
        detected_flags.append(rule.model_dump())

    # Check RF006: Significant Bleeding
    if any(w in combined_text for w in ["heavy bleeding", "vomiting blood", "coughing blood", "खून"]):
        rule = next(r for r in RED_FLAG_RULES if r.rule_id == "RF006")
        detected_flags.append(rule.model_dump())

    return detected_flags
