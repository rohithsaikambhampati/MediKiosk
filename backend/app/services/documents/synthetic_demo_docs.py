"""
SYNTHETIC DEMO DATA FIXTURES for MediKiosk.

DISCLAIMER: All fixtures contained herein are 100% synthetic mock datasets
generated exclusively for automated software verification and hackathon demonstration.
They do NOT represent real hospital, patient, or clinical records.

Fixtures:
1. Synthetic Prescription (Ramesh Kumar - Amlodipine 5mg, Atorvastatin 20mg)
2. Synthetic Lab Report (Ramesh Kumar - Hemoglobin 10.2 g/dL [13-17 g/dL], Fasting Blood Sugar 142 mg/dL [70-99 mg/dL])
3. Synthetic Discharge Summary (Laparoscopic Cholecystectomy, April 2024)
4. Synthetic Medication List (Chronic outpatient medications)
5. Synthetic Conflicting Document (Penicillin Allergy contradiction)
"""

from typing import Dict, Any, List

SYNTHETIC_DEMO_DOCUMENTS: List[Dict[str, Any]] = [
    {
        "id": "demo-doc-rx-01",
        "file_name": "RameshKumar_Prescription_2026_08_15.pdf",
        "document_type": "PRESCRIPTION",
        "mime_type": "application/pdf",
        "document_date": "2026-08-15",
        "content_text": (
            "SYNTHETIC DEMO DATA - NOT A REAL HOSPITAL RECORD\n"
            "City Heart & Multispeciality Clinic\n"
            "Doctor: Dr. S. Rao, MD (Cardiology)\n"
            "Patient: Ramesh Kumar | Age: 58 | Sex: Male\n"
            "Date: 15/08/2026\n"
            "Diagnosis: Essential Hypertension, Dyslipidemia\n"
            "\n"
            "Rx:\n"
            "1. Tab Amlodipine 5 mg once daily in morning - 30 days\n"
            "2. Tab Atorvastatin 20 mg once daily at bedtime - 30 days\n"
            "\n"
            "Advice: Low salt diet, regular BP monitoring. Follow up after 1 month.\n"
            "Dr. S. Rao (Reg: MCI-44281)"
        ),
        "expected_medications": [
            {"name": "Amlodipine", "dose": "5 mg", "frequency": "once daily"},
            {"name": "Atorvastatin", "dose": "20 mg", "frequency": "once daily"},
        ],
    },
    {
        "id": "demo-doc-lab-02",
        "file_name": "RameshKumar_LabReport_2026_08_21.pdf",
        "document_type": "LAB_REPORT",
        "mime_type": "application/pdf",
        "document_date": "2026-08-21",
        "content_text": (
            "SYNTHETIC DEMO DATA - NOT A REAL HOSPITAL RECORD\n"
            "Apex Diagnostic Laboratories & Pathology Center\n"
            "Patient: Ramesh Kumar | Age: 58 | Sex: Male\n"
            "Referred by: Dr. S. Rao, MD\n"
            "Sample Date: 21/08/2026\n"
            "\n"
            "BIOCHEMISTRY & HEMATOLOGY INVESTIGATION REPORT\n"
            "-------------------------------------------------------------------------\n"
            "Test Name                  Observed Value   Unit     Reference Range\n"
            "-------------------------------------------------------------------------\n"
            "Hemoglobin                 10.2             g/dL     13.0 - 17.0\n"
            "Fasting Blood Sugar        142              mg/dL    70 - 99\n"
            "Serum Creatinine           1.1              mg/dL    0.7 - 1.3\n"
            "Total Cholesterol          218              mg/dL    < 200\n"
            "-------------------------------------------------------------------------\n"
            "Verified by: Dr. K. Mehta, Consultant Pathologist"
        ),
        "expected_labs": [
            {"test": "Hemoglobin", "value": "10.2", "flag": "ABNORMAL_LOW", "unit": "g/dL"},
            {"test": "Fasting Blood Sugar", "value": "142", "flag": "ABNORMAL_HIGH", "unit": "mg/dL"},
            {"test": "Serum Creatinine", "value": "1.1", "flag": "NORMAL", "unit": "mg/dL"},
        ],
    },
    {
        "id": "demo-doc-discharge-03",
        "file_name": "RameshKumar_DischargeSummary_2024.pdf",
        "document_type": "DISCHARGE_SUMMARY",
        "mime_type": "application/pdf",
        "document_date": "2024-04-12",
        "content_text": (
            "SYNTHETIC DEMO DATA - NOT A REAL HOSPITAL RECORD\n"
            "Metro General Hospital - Department of Surgery\n"
            "DISCHARGE SUMMARY\n"
            "Patient: Ramesh Kumar | Age: 56\n"
            "Admission Date: 10/04/2024\n"
            "Discharge Date: 12/04/2024\n"
            "\n"
            "Diagnosis on Discharge: Symptomatic Cholelithiasis\n"
            "Procedure Performed: Laparoscopic Cholecystectomy on 10/04/2024\n"
            "Hospital Course: Patient admitted with right upper quadrant pain. Gallbladder removed laparoscopically. Recovery was uneventful.\n"
            "Discharge Advice: Normal diet, suture removal on 19/04/2024."
        ),
        "expected_surgeries": ["Laparoscopic Cholecystectomy"],
    },
    {
        "id": "demo-doc-medlist-04",
        "file_name": "RameshKumar_MedicationList_2026.pdf",
        "document_type": "MEDICATION_LIST",
        "mime_type": "application/pdf",
        "document_date": "2026-07-01",
        "content_text": (
            "SYNTHETIC DEMO DATA - NOT A REAL HOSPITAL RECORD\n"
            "Current Medications List\n"
            "Patient: Ramesh Kumar\n"
            "Date: 01/07/2026\n"
            "Active Medications:\n"
            "1. Tab Amlodipine 5 mg once daily\n"
            "2. Tab Metformin 500 mg twice daily\n"
        ),
    },
    {
        "id": "demo-doc-conflict-05",
        "file_name": "RameshKumar_OldRecord_Allergy.pdf",
        "document_type": "MEDICAL_REPORT",
        "mime_type": "application/pdf",
        "document_date": "2021-06-12",
        "content_text": (
            "SYNTHETIC DEMO DATA - NOT A REAL HOSPITAL RECORD\n"
            "Emergency Care Note - 12/06/2021\n"
            "Patient: Ramesh Kumar\n"
            "Clinical Alert: Drug Allergy: Penicillin.\n"
            "Patient developed severe urticaria and generalized pruritus following Amoxicillin-Clavulanate administration.\n"
            "Advised to avoid all Penicillin group antibiotics strictly."
        ),
        "expected_allergies": ["Penicillin"],
    },
]


def get_demo_document_by_id(doc_id: str) -> Dict[str, Any]:
    for doc in SYNTHETIC_DEMO_DOCUMENTS:
        if doc["id"] == doc_id:
            return doc
    return SYNTHETIC_DEMO_DOCUMENTS[0]

