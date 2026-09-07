# SIH 2026 Judge Demonstration Guide & Script

**Duration**: 3–5 Minutes  
**Target Audience**: Smart India Hackathon Evaluators / Medical Jury  
**Key Principle to Reinforce**: *"AI collects. AI structures. AI highlights. The doctor decides."*

---

## 🎬 Pre-Demo Quick Check (30 Seconds Before Presentation)

1. **Verify Backend**: Open `http://localhost:8000/api/health` in a browser tab.
   - Confirm: `{"status": "ok", "database": "ok", "storage": "ok", "ai_provider": "mock", "environment": "demo"}`
2. **Open Frontends**:
   - Tab 1: `http://localhost:5173/` (Patient Kiosk)
   - Tab 2: `http://localhost:5173/nurse` (Nurse / Triage Console)
   - Tab 3: `http://localhost:5173/doctor` (Doctor Unified Workspace)
   - Tab 4: `http://localhost:5173/admin` (Admin Security & Diagnostics)
3. **Reset State (Optional)**: If previous test data exists, click **"Reset Demo Data"** on the Admin Security page (`/admin/security`) to start from a pristine baseline.

---

## ⏱️ Minute-by-Minute Pitch Script

### Minute 0:00 – 1:00 | The Problem & The Patient Kiosk (Tab 1)

> *"Respected judges, in Indian government OPDs, doctors see 80 to 120 patients every morning. They spend more than half their consultation time interrogating basic medical history, deciphering illegible handwritten prescriptions, and re-typing lab values.*
> 
> *Here is MediKiosk: a multilingual pre-consultation intake kiosk that prepares structured, evidence-linked clinical summaries before the patient enters the consultation room."*

**Action**:
1. On `http://localhost:5173/`, point out the top banner: **"SYNTHETIC DEMO ENVIRONMENT — Assistive Intake Tool — Clinician Retains Final Decision Authority"**.
2. Click **"Ramesh Kumar — Complete SIH Demo Flow"** button (or proceed through Registration with English/Hindi/Telugu).
3. Show the **Informed Consent Screen**: Point out specific opt-in for clinical intake and document processing.
4. Show the **AI Intake Conversation**:
   - Point out how the AI asks targeted follow-ups regarding symptom duration, radiation, and severity (8/10 chest discomfort).
5. Show the **Document Processing**:
   - Point out the uploaded CityClinic prescription and MetroLabs CBC report.
   - Show OCR bounding box extraction of Amlodipine 5mg and Hemoglobin (10.2 g/dL).
6. Click **"Submit & Complete Intake"** to finalize the handoff.

---

### Minute 1:00 – 2:00 | Nurse Triage & Automated Red Flag Escalation (Tab 2)

> *"Immediately upon completion, the system executes clinical risk rules and routes the intake to the Nurse Triage Console."*

**Action**:
1. Switch to Tab 2 (`/nurse`).
2. Point out **Ramesh Kumar (Token #102)** appearing at the top of the queue:
   - Priority: **HIGH_PRIORITY_REVIEW** (flagged due to acute chest pain + radiation).
   - Show how emergency cases are visually highlighted in amber/red to prevent waiting room deterioration.
3. Demonstrate entering triage vitals (e.g. Blood Pressure: 145/95 mmHg, SpO2: 97%, Heart Rate: 84 bpm).
4. Click **"Handoff to Doctor Workspace"**.

---

### Minute 2:00 – 3:30 | The Doctor Unified Workspace & 1-Click Verification (Tab 3)

> *"Now let's switch to the doctor's perspective. When Dr. Sharma opens Ramesh Kumar's case, he is not greeted with a raw chatbot transcript. He gets an intelligent, structured clinical dossier with complete source provenance."*

**Action**:
1. Switch to Tab 3 (`/doctor`) and select **Ramesh Kumar**.
2. **Synthesized Patient Story**: Show the concise chronological narrative summarizing symptoms, onset, past history, and medications.
3. **Interactive Evidence Provenance**:
   - Click on the fact **"Exertional Angina with Dyspnea"** → the UI instantly highlights the exact chat message from the patient.
   - Click on **"Amlodipine 5mg OD"** → the UI highlights the exact bounding box in the uploaded prescription document.
4. **Abnormal Lab Advisory**:
   - Point out the **Hemoglobin 10.2 g/dL** callout with the clinical advisory *"Lab value outside reference range (13.0–17.0 g/dL) — clinician review recommended"*.
5. **Doctor Decision & 1-Click Verification**:
   - Emphasize: *"The AI does not diagnose. It leaves the decision to the doctor."*
   - Click **"Verify Fact"** to convert the status from `AI_EXTRACTED` to `DOCTOR_VERIFIED`.
   - Add a brief clinician note: *"Confirmed exertional nature during bedside examination."*

---

### Minute 3:30 – 4:30 | ABDM / FHIR Interoperability & Admin Security (Tabs 3 & 4)

> *"Once the doctor completes the consultation, MediKiosk integrates seamlessly with national digital health standards (ABDM) and enterprise security requirements."*

**Action**:
1. In the Doctor Workspace, click **"Export FHIR R4 Bundle"**:
   - Show the validated FHIR R4 JSON bundle containing `Patient`, `Condition`, `MedicationStatement`, `Observation`, and `Composition` resources.
   - Click **"Simulate ABDM Submission"** → display the mock exchange confirmation with reference `DEMO-INT-XXXX`.
2. Switch to Tab 4 (`/admin/security`):
   - Show the **Live Subsystem Diagnostics card** (all 10 engines: Database, Storage, Auth, Conversation, Document, Evidence, Risk, Consent, Handoff, FHIR Export showing `READY`).
   - Show the **Immutable Audit Trail**: demonstrate how the entire Ramesh Kumar intake, triage vitals, fact verification, and FHIR export was logged with tamper-evident timestamps and actor IDs.

---

### Minute 4:30 – 5:00 | Conclusion & Q&A

> *"To summarize: MediKiosk turns 15 minutes of chaotic manual OPD intake into a 90-second structured, evidence-grounded review. It preserves full clinician autonomy, maintains strict data provenance, and is 100% interoperable with ABDM FHIR standards.
> 
> Thank you, judges. We are now open for questions."*
