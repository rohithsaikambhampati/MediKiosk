"""
OCR Service Coordinator for MediKiosk.

Coordinates OCR provider execution, text normalization, and structural result assembly.
"""

from typing import Optional
from app.services.ocr.ocr_provider import OCRProvider, OCRResult, get_ocr_provider
from app.services.ocr.text_normalizer import TextNormalizer


class OCRService:
    def __init__(self, provider: Optional[OCRProvider] = None):
        self.provider = provider or get_ocr_provider()

    def process(self, file_bytes: bytes, mime_type: str, language: str = "en") -> OCRResult:
        """Executes OCR extraction, applies normalization, and produces structured result."""
        result = self.provider.extract_document_structure(file_bytes, mime_type, language)

        # Normalize the full text and page texts
        normalized_full = TextNormalizer.normalize(result.full_text)
        result.full_text = normalized_full

        for page in result.pages:
            page.text = TextNormalizer.normalize(page.text)
            for block in page.blocks:
                block.text = TextNormalizer.normalize(block.text)

        return result


ocr_service = OCRService()

