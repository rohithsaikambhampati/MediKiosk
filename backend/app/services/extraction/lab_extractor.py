"""
Laboratory Result Extractor and Deterministic Abnormal Value Engine for MediKiosk.

Core Clinical Rule:
- Compares lab value strictly against the reference range displayed in the source document.
- Output states:
  * ABNORMAL_LOW
  * ABNORMAL_HIGH
  * NORMAL
  * REFERENCE_RANGE_NOT_AVAILABLE
- Advisory note: "Lab value outside displayed reference range — clinician review recommended."
- NEVER diagnoses diseases (e.g. NEVER diagnoses "Anemia" or "Diabetes").
"""

import re
from typing import List, Optional, Tuple
from pydantic import BaseModel


class ExtractedLabResult(BaseModel):
    test_name: str
    value: str  # numeric or text string
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    ref_low: Optional[float] = None
    ref_high: Optional[float] = None
    abnormal_flag: str  # ABNORMAL_LOW, ABNORMAL_HIGH, NORMAL, REFERENCE_RANGE_NOT_AVAILABLE
    clinician_advisory: Optional[str] = None
    confidence: float = 0.95
    source_text: str
    source_block_id: Optional[str] = None
    source_page: int = 1


class LabExtractor:
    COMMON_TESTS = [
        ("hemoglobin", "g/dL"),
        ("hba1c", "%"),
        ("fasting blood sugar", "mg/dL"),
        ("fbs", "mg/dL"),
        ("postprandial blood sugar", "mg/dL"),
        ("ppbs", "mg/dL"),
        ("random blood sugar", "mg/dL"),
        ("serum creatinine", "mg/dL"),
        ("creatinine", "mg/dL"),
        ("blood urea nitrogen", "mg/dL"),
        ("bun", "mg/dL"),
        ("total cholesterol", "mg/dL"),
        ("triglycerides", "mg/dL"),
        ("hdl cholesterol", "mg/dL"),
        ("ldl cholesterol", "mg/dL"),
        ("total bilirubin", "mg/dL"),
        ("sgot", "U/L"),
        ("sgpt", "U/L"),
        ("alt", "U/L"),
        ("ast", "U/L"),
        ("wbc count", "/mcL"),
        ("platelet count", "/mcL"),
        ("esr", "mm/hr"),
        ("thyroid stimulating hormone", "mIU/L"),
        ("tsh", "mIU/L"),
        ("serum potassium", "mmol/L"),
        ("serum sodium", "mmol/L"),
    ]

    @classmethod
    def _parse_reference_range(cls, text: str) -> Tuple[Optional[str], Optional[float], Optional[float]]:
        """Parses reference ranges like '13.0 - 17.0', '70–99', '< 200', '>= 60'."""
        # Range: X - Y or X to Y
        range_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)", text)
        if range_match:
            try:
                low = float(range_match.group(1))
                high = float(range_match.group(2))
                return f"{low} - {high}", low, high
            except ValueError:
                pass

        # Upper limit: < X or <= X
        less_match = re.search(r"[<≤]\s*(\d+(?:\.\d+)?)", text)
        if less_match:
            try:
                high = float(less_match.group(1))
                return f"< {high}", None, high
            except ValueError:
                pass

        # Lower limit: > X or >= X
        greater_match = re.search(r"[>≥]\s*(\d+(?:\.\d+)?)", text)
        if greater_match:
            try:
                low = float(greater_match.group(1))
                return f"> {low}", low, None
            except ValueError:
                pass

        return None, None, None

    @classmethod
    def evaluate_abnormal(cls, val: float, low: Optional[float], high: Optional[float]) -> Tuple[str, Optional[str]]:
        """Deterministic comparison against displayed reference range."""
        if low is None and high is None:
            return "REFERENCE_RANGE_NOT_AVAILABLE", None

        if low is not None and val < low:
            return "ABNORMAL_LOW", "Lab value outside displayed reference range — clinician review recommended."
        if high is not None and val > high:
            return "ABNORMAL_HIGH", "Lab value outside displayed reference range — clinician review recommended."

        return "NORMAL", None

    @classmethod
    def extract_labs(cls, text: str, page_number: int = 1, block_id: Optional[str] = None) -> List[ExtractedLabResult]:
        results: List[ExtractedLabResult] = []
        lines = [line.strip() for line in text.splitlines() if line.strip()]

        for line in lines:
            line_lower = line.lower()

            for test_key, default_unit in cls.COMMON_TESTS:
                if test_key in line_lower:
                    test_display_name = test_key.title()
                    # Find numerical value in the line
                    # Look for number near the test or in the line
                    # Pattern: match value, unit, and optional reference range
                    # Example: Hemoglobin 10.2 g/dL (Reference 13.0 - 17.0)
                    # Example: Fasting Blood Sugar: 142 mg/dL [70 - 99]

                    # Extract reference range if present
                    ref_str, ref_low, ref_high = cls._parse_reference_range(line)

                    # Extract the test value (digits possibly with decimal)
                    # We avoid numbers that are part of the reference range
                    numbers = list(re.finditer(r"\b(\d+(?:\.\d+)?)\b", line))
                    if not numbers:
                        continue

                    # Select the value number (typically the first number before reference indicators)
                    val_float = None
                    val_str = ""
                    for num_match in numbers:
                        candidate = float(num_match.group(1))
                        # If reference range exists, ensure we didn't pick the ref boundary
                        if (ref_low is not None and candidate == ref_low) or (ref_high is not None and candidate == ref_high):
                            continue
                        val_float = candidate
                        val_str = num_match.group(1)
                        break

                    if val_float is None:
                        val_float = float(numbers[0].group(1))
                        val_str = numbers[0].group(1)

                    # Extract unit
                    unit_match = re.search(r"\b(g/dL|mg/dL|mmol/L|mIU/L|U/L|%|/mcL|mm/hr|pg/mL|ng/mL)\b", line, flags=re.IGNORECASE)
                    unit = unit_match.group(1) if unit_match else default_unit

                    # Evaluate abnormal flag
                    flag, advisory = cls.evaluate_abnormal(val_float, ref_low, ref_high)

                    # Also detect explicit words in text like "High", "Low", "Critical"
                    if "high" in line_lower and flag == "REFERENCE_RANGE_NOT_AVAILABLE":
                        flag = "ABNORMAL_HIGH"
                        advisory = "Document marked value as High — clinician review recommended."
                    elif "low" in line_lower and flag == "REFERENCE_RANGE_NOT_AVAILABLE":
                        flag = "ABNORMAL_LOW"
                        advisory = "Document marked value as Low — clinician review recommended."

                    results.append(
                        ExtractedLabResult(
                            test_name=test_display_name,
                            value=val_str,
                            numeric_value=val_float,
                            unit=unit,
                            reference_range=ref_str,
                            ref_low=ref_low,
                            ref_high=ref_high,
                            abnormal_flag=flag,
                            clinician_advisory=advisory,
                            confidence=0.95,
                            source_text=line,
                            source_block_id=block_id,
                            source_page=page_number,
                        )
                    )
                    break

        return results


lab_extractor = LabExtractor()

