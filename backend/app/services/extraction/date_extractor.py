"""
Date Extractor and Normalizer for MediKiosk.

Extracts dates from medical documents, identifies date context,
and normalizes to standard ISO YYYY-MM-DD.
"""

import re
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ExtractedDate(BaseModel):
    normalized_date: str  # YYYY-MM-DD
    original_text: str
    date_type: str  # DOCUMENT_DATE, PRESCRIPTION_DATE, SAMPLE_DATE, ADMISSION_DATE, DISCHARGE_DATE
    confidence: float = 0.95
    source_block_id: Optional[str] = None


class DateExtractor:
    MONTH_MAP = {
        "jan": 1, "january": 1,
        "feb": 2, "february": 2,
        "mar": 3, "march": 3,
        "apr": 4, "april": 4,
        "may": 5,
        "jun": 6, "june": 6,
        "jul": 7, "july": 7,
        "aug": 8, "august": 8,
        "sep": 9, "september": 9,
        "oct": 10, "october": 10,
        "nov": 11, "november": 11,
        "dec": 12, "december": 12,
    }

    @classmethod
    def extract_dates(cls, text: str, block_id: Optional[str] = None) -> List[ExtractedDate]:
        results: List[ExtractedDate] = []
        seen_dates = set()

        # 1. DD/MM/YYYY or DD-MM-YYYY
        p1 = r"\b(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{4})\b"
        for match in re.finditer(p1, text):
            orig = match.group(0)
            d, m, y = int(match.group(1)), int(match.group(2)), int(match.group(3))
            try:
                dt = datetime(y, m, d)
                iso = dt.strftime("%Y-%m-%d")
                if iso not in seen_dates:
                    seen_dates.add(iso)
                    date_type = cls._infer_date_type(text, match.start())
                    results.append(ExtractedDate(normalized_date=iso, original_text=orig, date_type=date_type, confidence=0.96, source_block_id=block_id))
            except ValueError:
                pass

        # 2. YYYY-MM-DD
        p2 = r"\b(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})\b"
        for match in re.finditer(p2, text):
            orig = match.group(0)
            y, m, d = int(match.group(1)), int(match.group(2)), int(match.group(3))
            try:
                dt = datetime(y, m, d)
                iso = dt.strftime("%Y-%m-%d")
                if iso not in seen_dates:
                    seen_dates.add(iso)
                    date_type = cls._infer_date_type(text, match.start())
                    results.append(ExtractedDate(normalized_date=iso, original_text=orig, date_type=date_type, confidence=0.97, source_block_id=block_id))
            except ValueError:
                pass

        # 3. DD Month YYYY or Month DD, YYYY
        p3 = r"\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})\b"
        for match in re.finditer(p3, text):
            orig = match.group(0)
            d = int(match.group(1))
            m_str = match.group(2).lower()
            y = int(match.group(3))
            if m_str in cls.MONTH_MAP:
                try:
                    dt = datetime(y, cls.MONTH_MAP[m_str], d)
                    iso = dt.strftime("%Y-%m-%d")
                    if iso not in seen_dates:
                        seen_dates.add(iso)
                        date_type = cls._infer_date_type(text, match.start())
                        results.append(ExtractedDate(normalized_date=iso, original_text=orig, date_type=date_type, confidence=0.95, source_block_id=block_id))
                except ValueError:
                    pass

        return results

    @classmethod
    def _infer_date_type(cls, text: str, pos: int) -> str:
        # Inspect 60 chars before pos
        start_idx = max(0, pos - 60)
        prefix = text[start_idx:pos].lower()
        if "admission" in prefix or "admitted" in prefix:
            return "ADMISSION_DATE"
        if "discharge" in prefix:
            return "DISCHARGE_DATE"
        if "sample" in prefix or "collection" in prefix:
            return "SAMPLE_DATE"
        if "presc" in prefix or "rx" in prefix:
            return "PRESCRIPTION_DATE"
        return "DOCUMENT_DATE"


date_extractor = DateExtractor()

