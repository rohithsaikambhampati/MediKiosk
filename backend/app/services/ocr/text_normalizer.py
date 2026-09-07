"""
OCR Text Normalizer for MediKiosk.

Cleans OCR artifacts, normalizes whitespace, standardizes medical units and notations.
"""

import re
from typing import Dict

class TextNormalizer:
    # Common OCR typo corrections and medical abbreviation expansions
    ABBREVIATIONS: Dict[str, str] = {
        r"\bTab\b\.?": "Tablet",
        r"\bCap\b\.?": "Capsule",
        r"\bSyp\b\.?": "Syrup",
        r"\bInj\b\.?": "Injection",
        r"\bO\.?D\.?\b": "OD",
        r"\bB\.?D\.?\b": "BD",
        r"\bT\.?D\.?S\.?\b": "TDS",
        r"\bQ\.?I\.?D\.?\b": "QID",
        r"\bP\.?R\.?N\.?\b": "PRN",
        r"\bH\.?S\.?\b": "at bedtime",
        r"\bS\.?O\.?S\.?\b": "as needed",
        r"\bmg\s*/\s*d[lL]\b": "mg/dL",
        r"\bg\s*/\s*d[lL]\b": "g/dL",
        r"\bmmol\s*/\s*[lL]\b": "mmol/L",
        r"\bµg\b": "mcg",
        r"\bmcg\s*/\s*d[lL]\b": "mcg/dL",
        r"\bRx\b\.?": "Prescription:",
    }

    @classmethod
    def normalize(cls, raw_text: str) -> str:
        """Cleans and standardizes raw OCR text."""
        if not raw_text:
            return ""

        text = raw_text

        # Replace non-breaking spaces and irregular whitespace
        text = text.replace("\u00a0", " ").replace("\u200b", "")

        # Standardize linebreaks
        text = re.sub(r"\r\n|\r", "\n", text)

        # Standardize units and abbreviations
        for pattern, replacement in cls.ABBREVIATIONS.items():
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

        # Collapse repeated horizontal whitespace
        text = re.sub(r"[ \t]+", " ", text)

        # Collapse more than two consecutive newlines
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

