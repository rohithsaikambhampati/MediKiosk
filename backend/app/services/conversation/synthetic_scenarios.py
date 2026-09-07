"""
Synthetic Clinical Demo Scenarios for MediKiosk.

Labeled strictly as SYNTHETIC DEMO DATA for SIH 2026 presentation.
Enables offline and end-to-end demonstration of the complete intake engine:
1. Scenario 1: Simple headache (routine pathway)
2. Scenario 2: Chest discomfort with potential red flags (Ramesh Kumar)
3. Scenario 3: Medication allergy (Penicillin)
4. Scenario 4: Conflicting medical history (triggers CONFLICTED state)
5. Scenario 5: Incomplete/unknown information (patient doesn't remember)
"""

from typing import Dict, List, Any
from pydantic import BaseModel


class SyntheticTurn(BaseModel):
    patient_message: str
    expected_topic: str
    expected_extracted_concepts: List[str] = []
    expected_red_flags: List[str] = []
    expected_conflicts: bool = False


class SyntheticScenario(BaseModel):
    scenario_id: str
    title: str
    description: str
    patient_name: str
    patient_age: int
    language: str = "en"
    disclaimer: str = "SYNTHETIC DEMO DATA - NOT A REAL PATIENT"
    turns: List[SyntheticTurn]


# =========================================================================
# 5 Synthetic Scenarios
# =========================================================================

SCENARIO_1_HEADACHE = SyntheticScenario(
    scenario_id="SCENARIO_1",
    title="Simple Headache (Routine Intake)",
    description="Routine presentation with dull headache for 2 days, mild severity, NKDA, no red flags.",
    patient_name="Pooja Sharma",
    patient_age=28,
    language="en",
    turns=[
        SyntheticTurn(
            patient_message="I have had a throbbing headache since 2 days ago.",
            expected_topic="chief_complaint",
            expected_extracted_concepts=["Headache", "2 days duration"],
        ),
        SyntheticTurn(
            patient_message="It started gradually 2 days ago in the evening.",
            expected_topic="onset",
            expected_extracted_concepts=["2 days duration"],
        ),
        SyntheticTurn(
            patient_message="About 4 out of 10. It is mild to moderate.",
            expected_topic="severity",
            expected_extracted_concepts=["Pain score 4/10"],
        ),
        SyntheticTurn(
            patient_message="No, no high blood pressure or diabetes.",
            expected_topic="medical_history",
            expected_extracted_concepts=["No Significant Past Medical History"],
        ),
        SyntheticTurn(
            patient_message="None, I am not taking any tablets.",
            expected_topic="medications",
            expected_extracted_concepts=["No Current Medications"],
        ),
        SyntheticTurn(
            patient_message="No known drug allergies.",
            expected_topic="allergies",
            expected_extracted_concepts=["No Known Drug Allergies (NKDA)"],
        ),
    ]
)

SCENARIO_2_CHEST_PAIN = SyntheticScenario(
    scenario_id="SCENARIO_2",
    title="Chest Discomfort with Potential Red Flags (Ramesh Kumar)",
    description="Severe exertional chest tightness radiating to left arm with dyspnea. Triggers RF001 and RF002 safety signals.",
    patient_name="Ramesh Kumar",
    patient_age=54,
    language="en",
    turns=[
        SyntheticTurn(
            patient_message="I have been having heavy chest pain and breathlessness since yesterday.",
            expected_topic="chief_complaint",
            expected_extracted_concepts=["Chest pain", "Dyspnea", "1 day ago (yesterday)"],
            expected_red_flags=["RF002"],
        ),
        SyntheticTurn(
            patient_message="It started yesterday morning while walking up stairs.",
            expected_topic="onset",
            expected_extracted_concepts=["1 day ago (yesterday)"],
        ),
        SyntheticTurn(
            patient_message="In the center of my chest, right behind the breastbone.",
            expected_topic="location",
            expected_extracted_concepts=["Substernal / Central chest"],
        ),
        SyntheticTurn(
            patient_message="The pain moves toward my left arm and left shoulder.",
            expected_topic="radiation",
            expected_extracted_concepts=["Radiation to left shoulder/arm"],
        ),
        SyntheticTurn(
            patient_message="It is very severe, about 8 out of 10.",
            expected_topic="severity",
            expected_extracted_concepts=["Pain score 8/10"],
            expected_red_flags=["RF001"],
        ),
        SyntheticTurn(
            patient_message="Yes, cold sweating and shortness of breath.",
            expected_topic="associated_symptoms",
            expected_extracted_concepts=["Diaphoresis", "Dyspnea"],
            expected_red_flags=["RF002"],
        ),
        SyntheticTurn(
            patient_message="I have had high blood pressure for 5 years.",
            expected_topic="medical_history",
            expected_extracted_concepts=["Essential Hypertension"],
        ),
        SyntheticTurn(
            patient_message="I take Amlodipine daily.",
            expected_topic="medications",
            expected_extracted_concepts=["Amlodipine"],
        ),
        SyntheticTurn(
            patient_message="I am allergic to Penicillin.",
            expected_topic="allergies",
            expected_extracted_concepts=["Penicillin"],
        ),
    ]
)

SCENARIO_3_MEDICATION_ALLERGY = SyntheticScenario(
    scenario_id="SCENARIO_3",
    title="Medication Allergy Documentation",
    description="Patient presents with cough and emphasizes severe Penicillin allergy causing facial rash.",
    patient_name="Anil Verma",
    patient_age=42,
    language="en",
    turns=[
        SyntheticTurn(
            patient_message="I have a dry cough since 3 days.",
            expected_topic="chief_complaint",
            expected_extracted_concepts=["Cough", "3 days duration"],
        ),
        SyntheticTurn(
            patient_message="It started 3 days ago.",
            expected_topic="onset",
            expected_extracted_concepts=["3 days duration"],
        ),
        SyntheticTurn(
            patient_message="About 3/10, not very severe.",
            expected_topic="severity",
            expected_extracted_concepts=["Pain score 3/10"],
        ),
        SyntheticTurn(
            patient_message="No other conditions.",
            expected_topic="medical_history",
            expected_extracted_concepts=["No Significant Past Medical History"],
        ),
        SyntheticTurn(
            patient_message="No regular medicines.",
            expected_topic="medications",
            expected_extracted_concepts=["No Current Medications"],
        ),
        SyntheticTurn(
            patient_message="Yes! I am strongly allergic to Penicillin. I got hives and rash once.",
            expected_topic="allergies",
            expected_extracted_concepts=["Penicillin"],
        ),
    ]
)

SCENARIO_4_CONFLICTING_HISTORY = SyntheticScenario(
    scenario_id="SCENARIO_4",
    title="Contradictory / Conflicting Clinical Statements",
    description="Patient initially reports Penicillin allergy, but later states 'No known allergies'. Engine flags CONFLICTED status for clinician resolution.",
    patient_name="Sita Devi",
    patient_age=61,
    language="en",
    turns=[
        SyntheticTurn(
            patient_message="I have knee pain for 1 week and I have a penicillin allergy.",
            expected_topic="chief_complaint",
            expected_extracted_concepts=["Penicillin"],
        ),
        SyntheticTurn(
            patient_message="Started 1 week ago.",
            expected_topic="onset",
            expected_extracted_concepts=["1 week duration"],
        ),
        SyntheticTurn(
            patient_message="Severity is about 5/10.",
            expected_topic="severity",
            expected_extracted_concepts=["Pain score 5/10"],
        ),
        SyntheticTurn(
            patient_message="Actually, I have no known drug allergies, never had an issue.",
            expected_topic="allergies",
            expected_extracted_concepts=["No Known Drug Allergies (NKDA)"],
            expected_conflicts=True,
        ),
    ]
)

SCENARIO_5_INCOMPLETE_UNKNOWN = SyntheticScenario(
    scenario_id="SCENARIO_5",
    title="Incomplete / Unknown Patient Information",
    description="Patient cannot remember duration or onset ('I don't remember', 'not sure'). System preserves unknown status without loop or error.",
    patient_name="Mohan Singh",
    patient_age=70,
    language="en",
    turns=[
        SyntheticTurn(
            patient_message="I feel general weakness and fatigue.",
            expected_topic="chief_complaint",
            expected_extracted_concepts=["Weakness"],
        ),
        SyntheticTurn(
            patient_message="I don't remember exactly when it started, maybe last week.",
            expected_topic="onset",
            expected_extracted_concepts=["Unknown / Unrecalled by patient"],
        ),
        SyntheticTurn(
            patient_message="Not sure, hard to rate severity.",
            expected_topic="severity",
            expected_extracted_concepts=["Unknown / Unrecalled by patient"],
        ),
        SyntheticTurn(
            patient_message="I think I have BP, but I don't know the tablet name.",
            expected_topic="medical_history",
            expected_extracted_concepts=["Essential Hypertension"],
        ),
        SyntheticTurn(
            patient_message="I don't know the medicines.",
            expected_topic="medications",
            expected_extracted_concepts=["Unknown / Unrecalled by patient"],
        ),
        SyntheticTurn(
            patient_message="None that I know of.",
            expected_topic="allergies",
            expected_extracted_concepts=["No Known Drug Allergies (NKDA)"],
        ),
    ]
)

ALL_SYNTHETIC_SCENARIOS = [
    SCENARIO_1_HEADACHE,
    SCENARIO_2_CHEST_PAIN,
    SCENARIO_3_MEDICATION_ALLERGY,
    SCENARIO_4_CONFLICTING_HISTORY,
    SCENARIO_5_INCOMPLETE_UNKNOWN,
]


def get_scenario_by_id(scenario_id: str) -> SyntheticScenario:
    for sc in ALL_SYNTHETIC_SCENARIOS:
        if sc.scenario_id == scenario_id:
            return sc
    return SCENARIO_2_CHEST_PAIN
