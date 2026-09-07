"""
OCR Provider Abstraction for MediKiosk Document Intelligence.

Provides a pluggable interface for OCR processing:
- OCRProvider: Abstract contract
- MockOCRProvider: 100% offline, deterministic provider with structured blocks, bboxes, and quality assessment
- TesseractProvider: Optional local open-source OCR wrapper with graceful fallback
"""

import os
import re
import uuid
import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class OCRBlockResult(BaseModel):
    block_id: str
    page_number: int = 1
    text: str
    confidence: float = 0.95
    bbox: Optional[Dict[str, float]] = None  # {"x": 100, "y": 200, "width": 300, "height": 40}


class OCRPageResult(BaseModel):
    page_number: int = 1
    text: str = ""
    confidence: float = 0.95
    quality: str = "GOOD"  # GOOD, FAIR, POOR
    blocks: List[OCRBlockResult] = []


class OCRResult(BaseModel):
    pages: List[OCRPageResult] = []
    full_text: str = ""
    average_confidence: float = 0.95
    quality: str = "GOOD"  # GOOD, FAIR, POOR
    quality_message: Optional[str] = None
    language: str = "en"


class OCRProvider(ABC):
    @abstractmethod
    def extract_text(self, file_bytes: bytes, mime_type: str, language: str = "en") -> str:
        """Extract raw text from document bytes."""
        pass

    @abstractmethod
    def extract_blocks(self, file_bytes: bytes, mime_type: str, language: str = "en") -> List[OCRBlockResult]:
        """Extract structured OCR blocks with coordinates and confidences."""
        pass

    @abstractmethod
    def extract_document_structure(self, file_bytes: bytes, mime_type: str, language: str = "en") -> OCRResult:
        """Extract complete document structure including pages, blocks, and quality score."""
        pass


class MockOCRProvider(OCRProvider):
    """
    Deterministic offline OCR provider.
    Inspects embedded text or generates high-fidelity structured blocks for medical documents.
    """

    def __init__(self):
        pass

    def _decode_or_mock_text(self, file_bytes: bytes, mime_type: str) -> str:
        try:
            text = file_bytes.decode('utf-8', errors='ignore')
            clean = re.sub(r'[^\x20-\x7E\n\r\t]', '', text).strip()
            if len(clean) > 20:
                return clean
        except Exception:
            pass
        return "PRESCRIPTION\nPatient: Ramesh Kumar\nDate: 21/08/2026\nRx:\nTab Amlodipine 5 mg once daily - 30 days\nTab Atorvastatin 20 mg once daily at bedtime - 30 days\nDoctor: Dr. S. Rao, MD (Cardiology)"

    def extract_text(self, file_bytes: bytes, mime_type: str, language: str = "en") -> str:
        res = self.extract_document_structure(file_bytes, mime_type, language)
        return res.full_text

    def extract_blocks(self, file_bytes: bytes, mime_type: str, language: str = "en") -> List[OCRBlockResult]:
        res = self.extract_document_structure(file_bytes, mime_type, language)
        blocks = []
        for p in res.pages:
            blocks.extend(p.blocks)
        return blocks

    def extract_document_structure(self, file_bytes: bytes, mime_type: str, language: str = "en") -> OCRResult:
        text = self._decode_or_mock_text(file_bytes, mime_type)
        lines = [line.strip() for line in text.splitlines() if line.strip()]

        # Check for simulated poor quality or handwritten tags
        is_poor_quality = "poor_quality" in text.lower() or "blurry" in text.lower() or "faded" in text.lower()
        is_handwritten = "handwritten" in text.lower() or "cursive" in text.lower()

        if is_poor_quality:
            quality = "POOR"
            base_conf = 0.58
            quality_message = "Low image resolution or faded text detected. Manual clinician verification required for all fields."
        elif is_handwritten:
            quality = "FAIR"
            base_conf = 0.72
            quality_message = "Handwritten document detected. Some medication names or dosages may be uncertain."
        else:
            quality = "GOOD"
            base_conf = 0.94
            quality_message = None

        blocks: List[OCRBlockResult] = []
        y_offset = 50.0

        for idx, line in enumerate(lines):
            block_id = f"b{idx + 1}"
            conf = round(max(0.40, min(0.99, base_conf + (0.03 if len(line) > 15 else -0.04))), 2)
            blocks.append(
                OCRBlockResult(
                    block_id=block_id,
                    page_number=1,
                    text=line,
                    confidence=conf,
                    bbox={
                        "x": 40.0,
                        "y": y_offset,
                        "width": min(500.0, max(120.0, float(len(line) * 9))),
                        "height": 24.0,
                    },
                )
            )
            y_offset += 32.0

        page = OCRPageResult(
            page_number=1,
            text=text,
            confidence=base_conf,
            quality=quality,
            blocks=blocks,
        )

        return OCRResult(
            pages=[page],
            full_text=text,
            average_confidence=base_conf,
            quality=quality,
            quality_message=quality_message,
            language=language,
        )


class TesseractProvider(OCRProvider):
    """
    Local open-source Tesseract OCR provider.
    Requires pytesseract and local Tesseract engine.
    Gracefully falls back to MockOCRProvider if unavailable.
    """

    def __init__(self):
        self._mock_fallback = MockOCRProvider()
        self._available = False
        try:
            import pytesseract
            self.pytesseract = pytesseract
            pytesseract.get_tesseract_version()
            self._available = True
            logger.info("Tesseract OCR is available on this system.")
        except Exception as e:
            logger.info(f"Tesseract OCR unavailable ({e}). Using MockOCRProvider fallback.")

    def extract_text(self, file_bytes: bytes, mime_type: str, language: str = "en") -> str:
        if not self._available:
            return self._mock_fallback.extract_text(file_bytes, mime_type, language)
        try:
            import io
            from PIL import Image
            image = Image.open(io.BytesIO(file_bytes))
            lang_map = {"en": "eng", "hi": "hin", "te": "tel"}
            tess_lang = lang_map.get(language, "eng")
            return self.pytesseract.image_to_string(image, lang=tess_lang)
        except Exception as e:
            logger.error(f"Tesseract execution error: {e}. Falling back to mock.")
            return self._mock_fallback.extract_text(file_bytes, mime_type, language)

    def extract_blocks(self, file_bytes: bytes, mime_type: str, language: str = "en") -> List[OCRBlockResult]:
        return self._mock_fallback.extract_blocks(file_bytes, mime_type, language)

    def extract_document_structure(self, file_bytes: bytes, mime_type: str, language: str = "en") -> OCRResult:
        if not self._available:
            return self._mock_fallback.extract_document_structure(file_bytes, mime_type, language)
        try:
            import io
            from PIL import Image
            image = Image.open(io.BytesIO(file_bytes))
            lang_map = {"en": "eng", "hi": "hin", "te": "tel"}
            tess_lang = lang_map.get(language, "eng")
            data = self.pytesseract.image_to_data(image, lang=tess_lang, output_type=self.pytesseract.Output.DICT)
            
            blocks = []
            full_lines = []
            current_line = []
            
            n_boxes = len(data['text'])
            for i in range(n_boxes):
                word = data['text'][i].strip()
                if not word:
                    continue
                conf = float(data['conf'][i]) / 100.0 if data['conf'][i] != -1 else 0.8
                current_line.append(word)
                if i == n_boxes - 1 or data['line_num'][i] != data['line_num'][i+1]:
                    line_text = ' '.join(current_line)
                    full_lines.append(line_text)
                    blocks.append(OCRBlockResult(
                        block_id=f'b{len(blocks)+1}',
                        page_number=1,
                        text=line_text,
                        confidence=conf,
                        bbox={'x': float(data['left'][i]), 'y': float(data['top'][i]), 'width': float(data['width'][i]), 'height': float(data['height'][i])}
                    ))
                    current_line = []

            full_text = '\n'.join(full_lines)
            return OCRResult(
                pages=[OCRPageResult(page_number=1, text=full_text, confidence=0.90, quality='GOOD', blocks=blocks)],
                full_text=full_text,
                average_confidence=0.90,
                quality='GOOD',
                language=language
            )
        except Exception as e:
            logger.error(f"Tesseract structure error: {e}. Falling back to mock.")
            return self._mock_fallback.extract_document_structure(file_bytes, mime_type, language)


def get_ocr_provider(provider_type: Optional[str] = None) -> OCRProvider:
    choice = (provider_type or os.getenv("OCR_PROVIDER", "mock")).lower()
    if choice == "tesseract":
        return TesseractProvider()
    return MockOCRProvider()

