# MediKiosk Prototype: Known Limitations & Regulatory Disclosures

**Status**: Smart India Hackathon (SIH) 2026 Innovation Prototype  
**Audience**: Evaluators, Technical Reviewers, and Implementation Partners

---

## 1. Prototype Scope & Regulatory Status

MediKiosk is an engineering demonstration prototype developed to evaluate the feasibility of assistive AI intake in clinical environments.

### Key Regulatory Disclosures:
- **Not a Certified Medical Device**: MediKiosk has **NOT** been certified by CDSCO (Central Drugs Standard Control Organisation), US FDA, or EU CE-MDR as Software as a Medical Device (SaMD).
- **No Autonomous Diagnostic Capability**: The system is programmed strictly to summarize, structure, and categorize patient-reported information and medical documents. It is prohibited from generating autonomous differential diagnoses or predicting clinical prognosis.
- **Clinician Supremacy**: In accordance with international clinical AI safety standards, every fact, medication list, and triage recommendation requires human-in-the-loop review and validation by a registered medical practitioner.

---

## 2. Artificial Intelligence & NLP Limitations

1. **Deterministic Mock vs. Production LLMs**:
   - The default demonstration configuration operates with deterministic local mock providers (`AI_PROVIDER=mock`) to ensure 100% offline reliability during hackathon evaluations.
   - When configured with live LLM endpoints (Ollama, vLLM, OpenAI, Gemini), extraction accuracy is subject to prompt variations, dialectal slang, and contextual ambiguities.
2. **Multilingual Speech & Phonetic Nuances**:
   - The prototype currently supports structured text interactions in English, Hindi, and Telugu. Regional dialects, colloquial medical expressions, and heavily accented audio speech-to-text remain areas for further model fine-tuning.
3. **Complex Polypharmacy & Drug Interactions**:
   - The prototype detects simple contradictions (e.g. reported NKDA vs. documented Penicillin allergy), but does not incorporate a full pharmacopeia drug-drug interaction matrix.

---

## 3. Document OCR & Vision Intelligence Limitations

1. **Handwriting Legibility Variations**:
   - While the OCR pipeline parses printed laboratory reports, standard computer-generated prescriptions, and clear handwritten doctor notes, severely cursive or smudged handwritten prescriptions may exhibit reduced character confidence.
   - Any entity extracted with confidence `< 0.85` is automatically tagged as `NEEDS_VERIFICATION` to force manual clinician confirmation.
2. **Non-Standard Lab Reference Ranges**:
   - Laboratory reference ranges vary across analytical instruments and regional lab protocols. MediKiosk parses the explicit reference range printed on the patient's report rather than applying global assumptions.

---

## 4. Interoperability & Network Integrations

1. **Simulated ABDM Gateway**:
   - The prototype produces syntactically and semantically valid HL7 FHIR R4 Bundles matching National Health Authority (NHA) ABDM StructureDefinitions.
   - However, the external submission endpoint (`POST /api/v1/demo/interoperability/submit`) operates against an internal simulated gateway (`DEMO-INT-XXXX`) rather than a live government ABDM Sandbox bridge.
2. **Storage Subsystem**:
   - MediKiosk supports both cloud-based Supabase Storage and a local file storage fallback (`UPLOAD_DIR`). In offline mode, uploaded medical documents are persisted locally with canonical path traversal sandboxing.

---

## 5. Security & Deployment Posture

- **Demo Credentials**: The prototype includes preconfigured synthetic staff accounts (`admin@medikiosk.org`, `dr.rajesh@medikiosk.org`, `nurse.priya@medikiosk.org`) for demonstration convenience. These credentials must be replaced with an enterprise Identity Provider (IdP) prior to any clinical pilot.
- **PostgreSQL Row Level Security (RLS)**: The comprehensive RLS security migration (`migrations/001_rls_security_policies.sql`) is provided for PostgreSQL staging and production environments. SQLite dev environments rely on application-level FastAPI RBAC enforcement.
