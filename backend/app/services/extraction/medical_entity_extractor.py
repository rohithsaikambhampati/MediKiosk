"""
Master Medical Entity Extractor for MediKiosk.

Orchestrates granular extractors across:
- Medications (MedicationExtractor)
- Laboratory results & Abnormal Values (LabExtractor)
- Dates (DateExtractor)
- Allergies & Surgical History (HistoryExtractor)

Preserves block and page provenance for every extracted fact.
"""

from typing import List, Optional
from pydantic import BaseModel
from app.services.extraction.date_extractor import date_extractor, ExtractedDate
from app.services.extraction.medication_extractor import medication_extractor, ExtractedMedication
from app.services.extraction.lab_extractor import lab_extractor, ExtractedLabResult
from app.services.extraction.history_extractor import history_extractor, ExtractedClinicalItem


class StandardEntity(BaseModel):
    entity_type: str  # MEDICATION, LAB_TEST, ALLERGY, SURGERY, HISTORICAL_CONDITION, DATE
    name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    abnormal_flag: Optional[str] = None
    clinician_advisory: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    confidence: float = 0.90
    source_page: int = 1
    source_block_id: Optional[str] = None
    source_text: str = ""
    verification_status: str = "NEEDS_VERIFICATION"


class MedicalEntityExtractor:
    @classmethod
    def extract_all(cls, text: str, page_number: int = 1, block_id: Optional[str] = None) -> List[StandardEntity]:
        entities: List[StandardEntity] = []

        # 1. Medications
        meds = medication_extractor.extract_medications(text, page_number=page_number, block_id=block_id)
        for m in meds:
            val_parts = [m.name]
            if m.dose:
                val_parts.append(m.dose)
            if m.frequency:
                val_parts.append(m.frequency)
            entities.append(
                StandardEntity(
                    entity_type="MEDICATION",
                    name=m.name,
                    value=" ".join(val_parts),
                    dose=m.dose,
                    frequency=m.frequency,
                    duration=m.duration,
                    instructions=m.instructions,
                    confidence=m.confidence,
                    source_page=m.source_page,
                    source_block_id=m.source_block_id,
                    source_text=m.source_text,
                    verification_status="NEEDS_VERIFICATION",
                )
            )

        # 2. Lab Results & Abnormal Value Engine
        labs = lab_extractor.extract_labs(text, page_number=page_number, block_id=block_id)
        for l in labs:
            entities.append(
                StandardEntity(
                    entity_type="LAB_TEST",
                    name=l.test_name,
                    value=l.value,
                    unit=l.unit,
                    reference_range=l.reference_range,
                    abnormal_flag=l.abnormal_flag,
                    clinician_advisory=l.clinician_advisory,
                    confidence=l.confidence,
                    source_page=l.source_page,
                    source_block_id=l.source_block_id,
                    source_text=l.source_text,
                    verification_status="NEEDS_VERIFICATION",
                )
            )

        # 3. Allergies, Surgeries, Conditions
        history_items = history_extractor.extract_history(text, page_number=page_number, block_id=block_id)
        for h in history_items:
            entities.append(
                StandardEntity(
                    entity_type=h.category,
                    name=h.name,
                    value=h.detail,
                    confidence=h.confidence,
                    source_page=h.source_page,
                    source_block_id=h.source_block_id,
                    source_text=h.source_text,
                    verification_status="NEEDS_VERIFICATION",
                )
            )

        # 4. Dates
        dates = date_extractor.extract_dates(text, block_id=block_id)
        for d in dates:
            entities.append(
                StandardEntity(
                    entity_type="DATE",
                    name=d.date_type,
                    value=d.normalized_date,
                    confidence=d.confidence,
                    source_page=page_number,
                    source_block_id=d.source_block_id,
                    source_text=d.original_text,
                    verification_status="DOCUMENT_REPORTED",
                )
            )

        return entities


medical_entity_extractor = MedicalEntityExtractor()

