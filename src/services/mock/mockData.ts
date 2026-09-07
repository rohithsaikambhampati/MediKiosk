import { Patient, Doctor, Nurse, Department, RiskAlert } from '../../types/clinical';
import { MedicalFact, EvidenceSource } from '../../types/evidence';
import { TimelineEvent } from '../../types/timeline';
import { MedicalDocument } from '../../types/documents';
import { PatientStory } from '../../types/story';

export const MOCK_PATIENT: Patient = {
  id: 'patient-ramesh-01',
  mrn: 'MK-2026-8841',
  name: 'Ramesh Kumar',
  age: 65,
  gender: 'male',
  preferredLanguage: 'Hindi',
  phone: '+91 98765 43210',
  photoUrl: '',
  assignedDepartment: 'General Medicine',
  assignedDoctorId: 'doc-ananya-01',
  assignedDoctorName: 'Dr. Ananya Sharma, MD',
  triagePriority: 'immediate',
  intakeStatus: 'ready-for-review',
  intakeProgress: 85,
  arrivalTime: '09:15 AM Today',
  chiefComplaint: 'Chest tightness, progressive shortness of breath, and fatigue for 2 days',
  riskFlagsCount: 3,
  unverifiedFactsCount: 2,
  documentsUploadedCount: 3,
};

export const MOCK_PATIENTS_LIST: Patient[] = [
  MOCK_PATIENT,
  {
    id: 'patient-priya-02',
    mrn: 'MK-2026-9012',
    name: 'Priya Sharma',
    age: 42,
    gender: 'female',
    preferredLanguage: 'English',
    phone: '+91 98123 45678',
    assignedDepartment: 'Cardiology',
    assignedDoctorId: 'doc-ananya-01',
    assignedDoctorName: 'Dr. Ananya Sharma, MD',
    triagePriority: 'high-priority',
    intakeStatus: 'in-progress',
    intakeProgress: 50,
    arrivalTime: '09:40 AM Today',
    chiefComplaint: 'Palpitations following caffeine intake, history of thyroid dysfunction',
    riskFlagsCount: 1,
    unverifiedFactsCount: 3,
    documentsUploadedCount: 1,
  },
  {
    id: 'patient-vijay-03',
    mrn: 'MK-2026-7432',
    name: 'Vijay Deshmukh',
    age: 58,
    gender: 'male',
    preferredLanguage: 'Marathi',
    phone: '+91 97654 32109',
    assignedDepartment: 'Orthopedics',
    assignedDoctorId: 'doc-rajesh-02',
    assignedDoctorName: 'Dr. Rajesh Verma',
    triagePriority: 'routine',
    intakeStatus: 'completed',
    intakeProgress: 100,
    arrivalTime: '10:05 AM Today',
    chiefComplaint: 'Chronic left knee stiffness worsening on stair descent',
    riskFlagsCount: 0,
    unverifiedFactsCount: 0,
    documentsUploadedCount: 2,
  },
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc-ananya-01',
    name: 'Dr. Ananya Sharma',
    specialty: 'Internal Medicine & Cardiology',
    department: 'General Medicine',
    email: 'dr.ananya@medikiosk.hospital.org',
    activePatientsCount: 6,
    pendingReviewsCount: 3,
    isAvailable: true,
  },
  {
    id: 'doc-rajesh-02',
    name: 'Dr. Rajesh Verma',
    specialty: 'Orthopedic Surgery',
    department: 'Orthopedics',
    email: 'dr.rajesh@medikiosk.hospital.org',
    activePatientsCount: 4,
    pendingReviewsCount: 1,
    isAvailable: true,
  },
];

export const MOCK_NURSE: Nurse = {
  id: 'nurse-savita-01',
  name: 'Savita Patel, RN',
  department: 'Emergency & Triage Intake',
  shift: 'Morning Shift (08:00 - 16:00)',
  activeTriageCount: 12,
};

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'dept-gen-med', name: 'General Medicine', code: 'GEN-MED', activeDoctors: 4, waitingPatients: 14, averageWaitMinutes: 18 },
  { id: 'dept-cardio', name: 'Cardiology', code: 'CARDIO', activeDoctors: 3, waitingPatients: 8, averageWaitMinutes: 25 },
  { id: 'dept-ortho', name: 'Orthopedics', code: 'ORTHO', activeDoctors: 2, waitingPatients: 6, averageWaitMinutes: 15 },
  { id: 'dept-emergency', name: 'Emergency Triage', code: 'EMERG', activeDoctors: 5, waitingPatients: 3, averageWaitMinutes: 4 },
];

export const MOCK_RISK_ALERTS: RiskAlert[] = [
  {
    id: 'alert-01',
    patientId: 'patient-ramesh-01',
    level: 'immediate',
    title: 'Potential Acute Coronary Risk Detected',
    description: 'Patient reports retrosternal chest pressure on mild exertion with radiation to left shoulder.',
    category: 'symptom',
    detectedAt: '09:18 AM Today',
    requiresImmediateAction: true,
    acknowledgedByDoctor: false,
  },
  {
    id: 'alert-02',
    patientId: 'patient-ramesh-01',
    level: 'high-priority',
    title: 'Severe Penicillin Allergy Alert',
    description: 'Patient documented history of anaphylaxis to Amoxicillin/Penicillin derivatives.',
    category: 'allergy',
    detectedAt: '09:20 AM Today',
    requiresImmediateAction: true,
    acknowledgedByDoctor: true,
  },
];

export const MOCK_EVIDENCE_SOURCES: EvidenceSource[] = [
  {
    id: 'src-doc-01',
    type: 'uploaded-document',
    title: 'City Hospital Discharge Summary 2024',
    date: '14 Oct 2024',
    documentId: 'doc-pdf-01',
    documentPage: 2,
    snippetText: 'Patient presented with HbA1c 8.4% and elevated blood pressure 150/94 mmHg. Started on Metformin 500mg BD.',
    confidence: 'high',
  },
  {
    id: 'src-voice-01',
    type: 'conversation-transcript',
    title: 'AI Kiosk Voice Interview (Hindi)',
    date: '09:17 AM Today',
    snippetText: 'मुझे 2 दिन से छाती में भारीपन महसूस हो रहा है और सीढ़ियां चढ़ने पर सांस फूलती है।',
    confidence: 'high',
  },
];

export const MOCK_FACTS: MedicalFact[] = [
  {
    id: 'fact-01',
    patientId: 'patient-ramesh-01',
    category: 'chief-complaint',
    title: 'Retrosternal Chest Tightness',
    detail: 'Pressure-like discomfort aggravated by physical exertion, lasting ~20 minutes per episode.',
    extractedDate: '09:17 AM Today',
    verificationStatus: 'needs-verification',
    confidence: 'high',
    sources: [MOCK_EVIDENCE_SOURCES[1]],
  },
  {
    id: 'fact-02',
    patientId: 'patient-ramesh-01',
    category: 'medication',
    title: 'Metformin 500 mg Twice Daily',
    detail: 'Current oral hypoglycemic regimen for Type 2 Diabetes Mellitus.',
    extractedDate: '09:18 AM Today',
    verificationStatus: 'doctor-verified',
    confidence: 'high',
    sources: [MOCK_EVIDENCE_SOURCES[0]],
  },
];

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-01',
    patientId: 'patient-ramesh-01',
    date: '14 Oct 2024',
    year: '2024',
    title: 'Type 2 Diabetes Mellitus Diagnosed',
    type: 'diagnosis',
    description: 'HbA1c 8.4%, fasting blood glucose 182 mg/dL. Initiated lifestyle modification and Metformin.',
    source: MOCK_EVIDENCE_SOURCES[0],
    confidence: 'high',
    tags: ['diabetes', 'endocrine'],
    hospitalOrDoctor: 'City Hospital OPD',
  },
  {
    id: 'evt-02',
    patientId: 'patient-ramesh-01',
    date: '03 Feb 2025',
    year: '2025',
    title: 'Abnormal Diagnostic ECG',
    type: 'lab-report',
    description: 'Sinus rhythm with ST-segment depression in inferior leads (II, III, aVF).',
    source: {
      id: 'src-ecg-01',
      type: 'uploaded-document',
      title: 'Diagnostic ECG Report',
      date: '03 Feb 2025',
      snippetText: 'T-wave inversions observed in anterolateral leads V4-V6.',
      confidence: 'medium',
    },
    confidence: 'medium',
    tags: ['cardiology', 'ecg'],
    isAbnormal: true,
    hospitalOrDoctor: 'Metropolitan Diagnostics',
  },
];

export const MOCK_DOCUMENTS: MedicalDocument[] = [
  {
    id: 'doc-pdf-01',
    patientId: 'patient-ramesh-01',
    fileName: 'CityHospital_DischargeSummary_2024.pdf',
    fileSize: '2.4 MB',
    fileType: 'application/pdf',
    documentType: 'discharge-summary',
    uploadDate: '09:16 AM Today',
    documentDate: '14 Oct 2024',
    status: 'completed',
    extractedFactsCount: 5,
    confidence: 'high',
  },
  {
    id: 'doc-img-02',
    patientId: 'patient-ramesh-01',
    fileName: 'Prescription_Feb2025.jpg',
    fileSize: '1.1 MB',
    fileType: 'image/jpeg',
    documentType: 'prescription',
    uploadDate: '09:18 AM Today',
    documentDate: '03 Feb 2025',
    status: 'completed',
    extractedFactsCount: 3,
    confidence: 'high',
  },
];

export const MOCK_PATIENT_STORY: PatientStory = {
  patientId: 'patient-ramesh-01',
  generatedAt: '09:20 AM Today',
  summaryParagraph:
    'Ramesh Kumar, a 65-year-old male with known Type 2 Diabetes (2024) and prior abnormal ECG (Feb 2025), presents with a 2-day history of progressive chest tightness radiating to the left shoulder and dyspnea on mild exertion. Currently on Metformin 500mg BD. Documented severe Penicillin allergy.',
  chiefComplaint: 'Chest tightness & shortness of breath',
  onsetAndDuration: '2 days (worsening since yesterday)',
  severityScore: '7 / 10 Pain Scale',
  reportedSymptoms: MOCK_FACTS,
  currentMedications: [
    {
      id: 'med-01',
      name: 'Metformin',
      dosage: '500 mg',
      frequency: 'Twice daily after meals',
      prescribedDate: '14 Oct 2024',
      status: 'active',
      verificationStatus: 'doctor-verified',
      confidence: 'high',
    },
    {
      id: 'med-02',
      name: 'Amlodipine',
      dosage: '5 mg',
      frequency: 'Once daily morning',
      prescribedDate: '03 Feb 2025',
      status: 'active',
      verificationStatus: 'needs-verification',
      confidence: 'medium',
    },
  ],
  allergies: [
    {
      id: 'alg-01',
      allergen: 'Penicillin / Amoxicillin',
      reaction: 'Anaphylaxis, severe bronchospasm',
      severity: 'immediate',
      verificationStatus: 'doctor-verified',
      confidence: 'high',
    },
  ],
  abnormalLabs: [
    {
      id: 'lab-01',
      testName: 'HbA1c',
      resultValue: '8.4',
      referenceRange: '4.0 - 5.6',
      unit: '%',
      isAbnormal: true,
      date: '14 Oct 2024',
      verificationStatus: 'doctor-verified',
      confidence: 'high',
    },
  ],
  medicalTimeline: MOCK_TIMELINE_EVENTS,
  documents: MOCK_DOCUMENTS,
  detectedConflicts: [
    {
      id: 'conf-01',
      title: 'Medication Dosage Discrepancy',
      description: 'Patient voice transcript mentions taking Amlodipine 10mg daily, while uploaded prescription specifies 5mg daily.',
      itemA: 'Voice Intake: 10mg daily',
      itemB: 'Uploaded Record: 5mg daily',
      severity: 'medium',
      requiresDoctorDecision: true,
    },
  ],
  overallAiConfidence: 'high',
  verificationProgress: {
    totalFacts: 6,
    verifiedFacts: 4,
    unverifiedFacts: 2,
  },
};
