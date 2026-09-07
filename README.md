# MediKiosk — Intelligent Clinical Intake & Triage System
### SIH 2026 Problem Statement: Patient Case-Taking Software

> **"AI collects. AI structures. AI highlights. The doctor decides."**
>
> MediKiosk is an assistive pre-consultation intelligence platform for OPDs, district hospitals, and triage kiosks.
> **Medical Notice**: MediKiosk is **NOT** an AI doctor. It does not diagnose diseases, does not prescribe medications, does not recommend treatments, and claims zero clinical certainty where information is ambiguous. All diagnostic decisions remain exclusively with licensed clinicians.

---

## 🏥 Product Overview

In high-volume public healthcare environments, doctors typically spend 60–70% of consultation time manually interrogating patients, deciphering handwritten paper prescriptions, transcribing lab results, and cross-referencing conflicting histories.

MediKiosk bridges this critical gap through a multi-portal clinical intake architecture:
1. **Patient Kiosk**: Multilingual (English, Hindi, Telugu), high-contrast accessibility mode, AI-assisted history intake with adaptive follow-ups, and document capture.
2. **Nurse / Triage Console**: Real-time intake queue with automated red flag detection, priority sorting (`EMERGENCY_ESCALATION`, `HIGH_PRIORITY_REVIEW`, `ROUTINE_QUEUE`), and vitals entry.
3. **Doctor Unified Workspace**: Comprehensive timeline, structured clinical facts with click-to-highlight source evidence provenance, conflict detection, abnormal lab callouts, and 1-click verification.
4. **Admin Portal**: Enterprise RBAC, immutable tamper-evident audit trails, department management, real-time subsystem diagnostics, and demo environment reset/preloading.

---

## 🏛️ System Architecture

MediKiosk operates as 10 coordinated clinical and infrastructure engines:

```
                          ┌────────────────────────┐
                          │   Patient Touch Kiosk  │
                          └───────────┬────────────┘
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │ 1. Consent Management Engine   │
                      │    (ABDM/HL7 Consent Contract) │
                      └───────────────┬────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ 2. Clinical Conversation Engine │       │ 3. Document Intelligence & OCR  │
│    Adaptive Follow-ups & Facts  │       │    Prescriptions, Labs, Reports │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │ 4. Structured Clinical Facts   │
                      │    Ontology Mapping & Norm     │
                      └───────────────┬────────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 ▼                    ▼                    ▼
┌─────────────────────────┐ ┌───────────────────┐ ┌─────────────────────────┐
│ 5. Risk & Red Flag      │ │ 6. Conflict & Dup │ │ 7. Evidence Provenance  │
│    Urgency Engine       │ │    Detection      │ │    Bounding Box / Quote │
└────────────┬────────────┘ └─────────┬─────────┘ └────────────┬────────────┘
             │                        │                        │
             └────────────────────┬───┴────────────────────────┘
                                  │
                                  ▼
                      ┌────────────────────────────────┐
                      │ 8. Chronological Timeline &    │
                      │    Patient Story Generation    │
                      └───────────────┬────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ 9. Nurse Triage & Handoff       │       │ 10. Doctor Workspace &          │
│    Queue Priority Sorting       │       │     1-Click Clinical Verify     │
└─────────────────────────────────┘       └────────────────┬────────────────┘
                                                           │
                                                           ▼
                                          ┌─────────────────────────────────┐
                                          │ ABDM / FHIR R4 Bundle Export    │
                                          │ (Simulated Interop Gateway)     │
                                          └─────────────────────────────────┘
```

---

## 🔒 Security & Data Protection

- **Row Level Security (RLS)**: Full PostgreSQL migration (`backend/migrations/001_rls_security_policies.sql`) covering all 18 clinical tables with role-isolated access predicates (`current_user_role()`, `current_user_id()`).
- **Role-Based Access Control (RBAC)**: Distinct permissions for `PATIENT_KIOSK`, `NURSE`, `DOCTOR`, and `ADMIN`. Unauthorized privilege escalation attempts trigger strict HTTP 403 Forbidden responses.
- **Path Traversal Sandboxing**: File storage engine strictly sanitizes relative storage keys with canonical base directory bounds checks (`os.path.commonpath`).
- **Secret Sanitization**: Zero API keys, passwords, or connection URIs exposed in client-facing bundles, health endpoints, or version control templates (`.env.example` fully sanitized).
- **Audit Logging**: Every authentication attempt, patient record creation, fact verification, and FHIR export is captured in an immutable audit event log with actor metadata and timestamps.

---

## ⚡ Quickstart: Zero-Dependency Local Setup

MediKiosk is designed to run **100% locally and offline** without external cloud API dependencies. By default, both AI conversation and OCR processing use deterministic local mock engines.

### 1. Prerequisites
- **Node.js** 18+ and `npm`
- **Python** 3.11+
- Git

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration
cp .env.example .env

# Verify that DEMO_MODE=True, AI_PROVIDER=mock, OCR_PROVIDER=mock in .env
# Start the FastAPI backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*Backend API Documentation*: `http://localhost:8000/docs`  
*System Health Check*: `http://localhost:8000/api/health`

### 3. Frontend Setup
```bash
# In project root
npm install
npm run dev
```
*Patient Kiosk*: `http://localhost:5173/`  
*Doctor Workspace*: `http://localhost:5173/doctor`  
*Nurse Triage*: `http://localhost:5173/nurse`  
*Admin Portal*: `http://localhost:5173/admin`

---

## 🎯 5 Synthetic Preloaded SIH Demo Cases

To test and present the end-to-end pipeline during judging sessions, MediKiosk provides 5 preconfigured clinical intake profiles via `POST /api/v1/demo/preload`:

| Case | Patient | Key Condition / Presentation | Primary Demonstration |
|---|---|---|---|
| **Case 1 (Primary)** | **Ramesh Kumar (54M)** | Exertional chest pain radiating to left shoulder + dyspnea, Amlodipine 5mg OD, low Hb (10.2 g/dL) | **Complete 14-Stage Flow**: AI Intake → Red Flag → OCR Extraction → Abnormal Lab Advisory → High Priority Triage → Doctor Verification → FHIR Export |
| **Case 2** | **Sita Devi (48F)** | Dysuria, fever, burning micturition (Urinary Tract Infection) | Routine OPD triage path with clean history and lab verification |
| **Case 3** | **Mohan Singh (62M)** | Type 2 Diabetes Mellitus with elevated fasting plasma glucose (210 mg/dL) | Chronic care timeline, glycemic trend recognition, medication adherence check |
| **Case 4** | **Vikram Patel (35M)** | Patient claims "No known drug allergies", but uploaded document shows Penicillin allergy | **Conflict Detection Engine**: System flags discrepancy between patient statement and medical document |
| **Case 5** | **Sunita Sharma (29F)** | Acute asthma exacerbation with severe wheezing | **Emergency Red Flag Escalation**: Immediate triage escalation to top of clinical queue |

To preload or reset synthetic demo data via API:
```bash
# Preload 5 test cases
curl -X POST http://localhost:8000/api/v1/demo/preload

# Reset all synthetic demo records
curl -X POST http://localhost:8000/api/v1/demo/reset
```
*Alternatively, use the Demo Controls card in the Admin Security Portal or click "Ramesh Kumar — Complete SIH Demo Flow" on the Patient Welcome screen.*

---

## 🧪 Automated Testing & Verification

MediKiosk includes a comprehensive automated test suite covering all services, schemas, security barriers, and end-to-end clinical acceptance paths:

```bash
cd backend
pytest tests/ -v
```
**Test Results**: `88 passed` in ~34 seconds across:
- `test_full_system_e2e_integration.py` (Complete 14-stage Ramesh Kumar acceptance path, diagnostics, conflict resolution, path traversal sandboxing, RBAC)
- `test_document_intelligence.py` (OCR extraction, bounding boxes, file uploads, abnormal range parsing)
- `test_patient_story.py` (Chronological timeline aggregation and narrative summarization)
- `test_risk_engine.py` (Red flag keywords, triage escalation scoring)
- `test_conflict_engine.py` (Cross-source allergy and medication contradiction detection)
- `test_auth.py` & `test_rbac.py` (JWT token issuance, role authorization)
- `test_fhir_export.py` & `test_interoperability.py` (FHIR R4 Bundle validation and simulated exchange)

---

## 📜 Regulatory Notice & Limitations

- **Prototype Status**: Developed exclusively as an innovation prototype for the Smart India Hackathon (SIH) 2026.
- **Not a Medical Device**: MediKiosk has not undergone CDSCO, FDA, or CE-MDR clinical trials. It does not replace medical judgement.
- **Simulated ABDM Integration**: MediKiosk produces syntactically valid FHIR R4 Bundles modeled after ABDM specifications, but submissions are processed by a simulated local gateway (`DEMO-INT-XXXX`).
