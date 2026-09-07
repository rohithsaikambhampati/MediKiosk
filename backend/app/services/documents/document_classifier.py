"""
Document Classifier for MediKiosk.

Classifies documents into clinical categories based on keywords, structural patterns, and signals:
- PRESCRIPTION
- LAB_REPORT
- DISCHARGE_SUMMARY
- MEDICAL_REPORT
- IMAGING_REPORT
- MEDICATION_LIST
- OTHER
- UNKNOWN_DOCUMENT (fallback for low confidence)
"""

import re
from typing import Dict, List, Tuple
from app.models.document import DocumentType


class DocumentClassifier:
    CATEGORY_PATTERNS: Dict[str, List[str]] = {
        DocumentType.PRESCRIPTION.value: [
            r"\brx\b",
            r"\bprescription\b",
            r"\btablet\b",
            r"\bcapsule\b",
            r"\bdosage\b",
            r"\bonce daily\b",
            r"\btwice daily\b",
            r"\b[obtd]d\b",
            r"\bdr\.\b",
            r"\brefill\b",
            r"\bpharmacy\b",
        ],
        DocumentType.LAB_REPORT.value: [
            r"\breference range\b",
            r"\blaboratory\b",
            r"\bpathology\b",
            r"\bbiochemistry\b",
            r"\bhemoglobin\b",
            r"\bhba1c\b",
            r"\bwbc\b",
            r"\bplatelet\b",
            r"\bcreatinine\b",
            r"\bserum\b",
            r"\bspecimen\b",
            r"\bmg/dl\b",
            r"\bg/dl\b",
            r"\btest name\b",
            r"\bobserved value\b",
        ],
        DocumentType.DISCHARGE_SUMMARY.value: [
            r"\bdischarge summary\b",
            r"\badmission date\b",
            r"\bdischarge date\b",
            r"\bhospital course\b",
            r"\bdischarge advice\b",
            r"\bdischarge condition\b",
            r"\binpatient\b",
            r"\bdiagnosis on discharge\b",
            r"\bconsultant in charge\b",
        ],
        DocumentType.IMAGING_REPORT.value: [
            r"\bx-ray\b",
            r"\bmri\b",
            r"\bct scan\b",
            r"\bultrasound\b",
            r"\bradiology\b",
            r"\bimpression\b",
            r"\bimaging\b",
            r"\bfindings\b",
            r"\bview\b",
        ],
        DocumentType.MEDICATION_LIST.value: [
            r"\bmedication list\b",
            r"\bcurrent medications\b",
            r"\bdrug history\b",
            r"\bactive medications\b",
            r"\bprescribed medicines\b",
        ],
        DocumentType.MEDICAL_REPORT.value: [
            r"\bclinical summary\b",
            r"\boutpatient note\b",
            r"\bprogress note\b",
            r"\bconsultation report\b",
            r"\bphysician note\b",
            r"\bchief complaint\b",
            r"\bassessment\b",
        ],
    }

    @classmethod
    def classify(cls, text: str, filename: str = "") -> Tuple[str, float, List[str]]:
        """
        Classifies document text and filename.
        Returns: (document_type, confidence, supporting_signals)
        """
        text_lower = (text + " " + filename).lower()
        scores: Dict[str, int] = {}
        signals: Dict[str, List[str]] = {}

        for doc_type, patterns in cls.CATEGORY_PATTERNS.items():
            scores[doc_type] = 0
            signals[doc_type] = []
            for pat in patterns:
                matches = re.findall(pat, text_lower)
                if matches:
                    count = len(matches)
                    scores[doc_type] += count
                    # Record clean keyword signal
                    signal_word = pat.replace(r"\b", "").replace("\\", "")
                    if signal_word not in signals[doc_type]:
                        signals[doc_type].append(signal_word)

        # Check for filename hints
        fn_lower = filename.lower()
        if any(w in fn_lower for w in ["rx", "presc", "prescription"]):
            scores[DocumentType.PRESCRIPTION.value] += 5
            signals[DocumentType.PRESCRIPTION.value].append("filename:prescription")
        if any(w in fn_lower for w in ["lab", "report", "blood", "test", "cbc", "lft", "kft"]):
            scores[DocumentType.LAB_REPORT.value] += 5
            signals[DocumentType.LAB_REPORT.value].append("filename:lab_report")
        if any(w in fn_lower for w in ["discharge", "summary"]):
            scores[DocumentType.DISCHARGE_SUMMARY.value] += 5
            signals[DocumentType.DISCHARGE_SUMMARY.value].append("filename:discharge_summary")
        if any(w in fn_lower for w in ["xray", "x-ray", "mri", "ct", "scan", "usg", "echo"]):
            scores[DocumentType.IMAGING_REPORT.value] += 5
            signals[DocumentType.IMAGING_REPORT.value].append("filename:imaging")

        best_type = max(scores, key=scores.get)
        best_score = scores[best_type]

        if best_score == 0:
            return DocumentType.UNKNOWN_DOCUMENT.value, 0.20, []

        # Calculate confidence from signal strength
        if best_score >= 5:
            confidence = 0.95
        elif best_score >= 3:
            confidence = 0.85
        elif best_score >= 2:
            confidence = 0.72
        else:
            confidence = 0.55

        if confidence < 0.35:
            return DocumentType.UNKNOWN_DOCUMENT.value, round(confidence, 2), []

        return best_type, round(confidence, 2), signals[best_type][:6]


document_classifier = DocumentClassifier()

