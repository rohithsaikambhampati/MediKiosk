"""
History, Allergy, and Procedure Extractor for MediKiosk.

Extracts:
- Allergies (drug, food, environmental)
- Past Medical Conditions (e.g. Hypertension, Diabetes)
- Surgeries and Procedures (e.g. Cholecystectomy, Appendectomy)
- Hospitalizations and Past Admissions

Core rule: Extracted diagnoses are always treated as DOCUMENT_REPORTED historical facts.
"""

import re
from typing import List, Optional
from pydantic import BaseModel


class ExtractedClinicalItem(BaseModel):
    category: str  # ALLERGY, HISTORICAL_CONDITION, SURGERY, PROCEDURE, HOSPITALIZATION
    name: str
    detail: str
    confidence: float = 0.90
    source_text: str
    source_block_id: Optional[str] = None
    source_page: int = 1


class HistoryExtractor:
    KNOWN_ALLERGIES = [
        "penicillin", "sulfa", "sulfonamide", "aspirin", "nsaid", "amoxicillin",
        "ciprofloxacin", "peanuts", "eggs", "latex", "iodine", "contrast"
    ]

    KNOWN_CONDITIONS = [
        ("hypertension", "Hypertension"),
        ("htn", "Hypertension"),
        ("high blood pressure", "Hypertension"),
        ("diabetes mellitus", "Type 2 Diabetes Mellitus"),
        ("type 2 diabetes", "Type 2 Diabetes Mellitus"),
        ("t2dm", "Type 2 Diabetes Mellitus"),
        ("asthma", "Bronchial Asthma"),
        ("coronary artery disease", "Coronary Artery Disease"),
        ("cad", "Coronary Artery Disease"),
        ("hypothyroidism", "Hypothyroidism"),
        ("chronic kidney disease", "Chronic Kidney Disease"),
        ("ckd", "Chronic Kidney Disease"),
        ("gerd", "Gastroesophageal Reflux Disease"),
    ]

    KNOWN_SURGERIES = [
        ("cholecystectomy", "Laparoscopic Cholecystectomy"),
        ("gallbladder removal", "Cholecystectomy"),
        ("appendectomy", "Appendectomy"),
        ("appendix removal", "Appendectomy"),
        ("cabg", "Coronary Artery Bypass Graft (CABG)"),
        ("bypass surgery", "Coronary Artery Bypass Graft"),
        ("hernia repair", "Hernia Repair"),
        ("hernioplasty", "Hernioplasty"),
        ("knee replacement", "Total Knee Arthroplasty"),
        ("cataract", "Cataract Surgery"),
        ("angioplasty", "Percutaneous Transluminal Coronary Angioplasty (PTCA)"),
        ("stent", "Coronary Stent Placement"),
    ]

    @classmethod
    def extract_history(cls, text: str, page_number: int = 1, block_id: Optional[str] = None) -> List[ExtractedClinicalItem]:
        results: List[ExtractedClinicalItem] = []
        lines = [line.strip() for line in text.splitlines() if line.strip()]

        for line in lines:
            line_lower = line.lower()

            # 1. Allergies
            # Check if line indicates allergy
            if "allerg" in line_lower or "hypersensitivity" in line_lower:
                for allergen in cls.KNOWN_ALLERGIES:
                    if allergen in line_lower:
                        results.append(
                            ExtractedClinicalItem(
                                category="ALLERGY",
                                name=allergen.capitalize(),
                                detail=f"Allergy to {allergen.capitalize()} documented in record",
                                confidence=0.95,
                                source_text=line,
                                source_block_id=block_id,
                                source_page=page_number,
                            )
                        )
            else:
                # Direct allergen mention with reaction
                for allergen in cls.KNOWN_ALLERGIES:
                    if re.search(rf"\ballergy\s*(?:to|:)?\s*{allergen}\b", line_lower):
                        results.append(
                            ExtractedClinicalItem(
                                category="ALLERGY",
                                name=allergen.capitalize(),
                                detail=f"Allergy to {allergen.capitalize()} documented in record",
                                confidence=0.95,
                                source_text=line,
                                source_block_id=block_id,
                                source_page=page_number,
                            )
                        )

            # 2. Surgeries and Procedures
            for surg_key, surg_name in cls.KNOWN_SURGERIES:
                if surg_key in line_lower:
                    results.append(
                        ExtractedClinicalItem(
                            category="SURGERY",
                            name=surg_name,
                            detail=f"Surgical history: {surg_name}",
                            confidence=0.92,
                            source_text=line,
                            source_block_id=block_id,
                            source_page=page_number,
                        )
                    )
                    break

            # 3. Past Conditions
            for cond_key, cond_name in cls.KNOWN_CONDITIONS:
                if re.search(rf"\b{cond_key}\b", line_lower):
                    results.append(
                        ExtractedClinicalItem(
                            category="HISTORICAL_CONDITION",
                            name=cond_name,
                            detail=f"Documented history of {cond_name}",
                            confidence=0.88,
                            source_text=line,
                            source_block_id=block_id,
                            source_page=page_number,
                        )
                    )
                    break

        return results


history_extractor = HistoryExtractor()

