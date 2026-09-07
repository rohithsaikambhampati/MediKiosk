"""
Medication Extractor for MediKiosk.

Extracts medications from clinical documents with separate fields:
- medicine name
- dose (e.g., 5 mg, 500 mg, 850 mg)
- form (Tablet, Capsule, Syrup, Injection)
- frequency (once daily, twice daily, OD, BD, TDS)
- duration (30 days, 5 days)
- instructions (after food, at bedtime)

Crucial rule: Missing attributes are kept as None/UNKNOWN. Never invented.
"""

import re
from typing import List, Optional
from pydantic import BaseModel


class ExtractedMedication(BaseModel):
    name: str
    dose: Optional[str] = None
    form: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    confidence: float = 0.90
    source_text: str
    source_block_id: Optional[str] = None
    source_page: int = 1


class MedicationExtractor:
    KNOWN_DRUGS = [
        "amlodipine", "atorvastatin", "metformin", "aspirin", "lisinopril",
        "losartan", "pantoprazole", "omeprazole", "paracetamol", "acetaminophen",
        "ibuprofen", "azithromycin", "amoxicillin", "clavulanate", "ciprofloxacin",
        "metoprolol", "atenolol", "glimepiride", "insulin", "telmisartan",
        "rosuvastatin", "clopidogrel", "levothyroxine", "cetirizine", "montelukast"
    ]

    FORM_PATTERNS = r"\b(tablet|tab|capsule|cap|syrup|syp|injection|inj|cream|ointment|drops|inhaler)\b"
    DOSE_PATTERNS = r"\b(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|iu|units))\b"
    FREQ_PATTERNS = r"\b(once\s+daily|twice\s+daily|thrice\s+daily|four\s+times\s+daily|od|bd|tds|qid|prn|sos|at\s+bedtime|hs|stat|q\d+h)\b"
    DURATION_PATTERNS = r"\b(\d+\s*(?:days?|weeks?|months?))\b"
    INSTR_PATTERNS = r"\b(after\s+food|before\s+food|with\s+food|empty\s+stomach|at\s+bedtime|in\s+the\s+morning)\b"

    @classmethod
    def extract_medications(cls, text: str, page_number: int = 1, block_id: Optional[str] = None) -> List[ExtractedMedication]:
        results: List[ExtractedMedication] = []
        lines = [line.strip() for line in text.splitlines() if line.strip()]

        for line in lines:
            line_lower = line.lower()
            matched_drug = None

            for drug in cls.KNOWN_DRUGS:
                if re.search(rf"\b{drug}\b", line_lower):
                    matched_drug = drug.capitalize()
                    break

            # Also check generic pattern like "Tab <Word> <Dose>" or "Rx <Word>"
            if not matched_drug:
                generic_match = re.search(rf"(?:rx|tab|tablet|cap|capsule)\s+([A-Z][a-z]{{2,20}})\b", line, flags=re.IGNORECASE)
                if generic_match:
                    candidate = generic_match.group(1).capitalize()
                    if candidate.lower() not in ["patient", "doctor", "date", "hospital", "clinic", "report", "test", "name", "age", "male", "female"]:
                        matched_drug = candidate

            if matched_drug:
                dose_match = re.search(cls.DOSE_PATTERNS, line, flags=re.IGNORECASE)
                form_match = re.search(cls.FORM_PATTERNS, line, flags=re.IGNORECASE)
                freq_match = re.search(cls.FREQ_PATTERNS, line, flags=re.IGNORECASE)
                dur_match = re.search(cls.DURATION_PATTERNS, line, flags=re.IGNORECASE)
                instr_match = re.search(cls.INSTR_PATTERNS, line, flags=re.IGNORECASE)

                dose = dose_match.group(1) if dose_match else None
                form = form_match.group(1).capitalize() if form_match else None
                frequency = freq_match.group(1) if freq_match else None
                duration = dur_match.group(1) if dur_match else None
                instructions = instr_match.group(1) if instr_match else None

                # Normalize frequency terms
                if frequency:
                    freq_norm = frequency.lower()
                    if freq_norm in ["od", "once daily"]:
                        frequency = "once daily"
                    elif freq_norm in ["bd", "twice daily"]:
                        frequency = "twice daily"
                    elif freq_norm in ["tds", "thrice daily"]:
                        frequency = "thrice daily"

                results.append(
                    ExtractedMedication(
                        name=matched_drug,
                        dose=dose,
                        form=form,
                        frequency=frequency,
                        duration=duration,
                        instructions=instructions,
                        confidence=0.94 if dose else 0.82,
                        source_text=line,
                        source_block_id=block_id,
                        source_page=page_number,
                    )
                )

        return results


medication_extractor = MedicationExtractor()

