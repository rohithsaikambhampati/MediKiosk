import { SymptomCategory } from "../../constants/translations";
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

export const getLocalizedMockStory = (
  lang: string,
  identity?: { name?: string; age?: number; gender?: string; mrn?: string },
  category: SymptomCategory = 'fever'
): PatientStory => {
  const patientName = identity?.name || (lang === 'te' ? 'రమేష్ కుమార్' : lang === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar');
  const age = identity?.age || 65;
  const mrn = identity?.mrn || 'patient-ramesh-01';
  const genderStr = identity?.gender === 'female' ? (lang === 'te' ? 'మహిళ' : lang === 'hi' ? 'महिला' : 'female') : (lang === 'te' ? 'పురుషుడు' : lang === 'hi' ? 'पुरुष' : 'male');

  // Category specific summaries and symptoms
  let complaint = 'High fever, chills, and weakness';
  let duration = '2 days (rises in the evening)';
  let summary = `${patientName}, a ${age}-year-old ${genderStr}, presents with high fever, chills, and severe weakness for the past 2 days.`;
  let factTitle = 'High fever & chills';
  let factDetail = 'Fever starting 2 days ago, rising in evenings with body ache.';
  let factSnippet = 'I have high fever, chills, and weakness since yesterday.';

  if (category === 'chest_pain') {
    complaint = 'Chest tightness & difficulty breathing';
    duration = '2 days (exertional onset)';
    summary = `${patientName}, a ${age}-year-old ${genderStr}, presents with a 2-day history of progressive chest tightness radiating to the left shoulder and shortness of breath.`;
    factTitle = 'Retrosternal chest tightness';
    factDetail = 'Pressure-like chest discomfort exacerbated by exertion.';
    factSnippet = 'I have chest tightness and pressure since yesterday morning.';
  } else if (category === 'headache') {
    complaint = 'Severe throbbing headache & dizziness';
    duration = 'Since yesterday afternoon';
    summary = `${patientName}, a ${age}-year-old ${genderStr}, presents with severe throbbing headache, dizziness, and light sensitivity.`;
    factTitle = 'Severe headache & dizziness';
    factDetail = 'Persistent unilateral throbbing pain with dizziness.';
    factSnippet = 'I have a severe headache and dizziness.';
  } else if (category === 'stomach_pain') {
    complaint = 'Severe abdominal pain & nausea';
    duration = 'Started 4 hours ago';
    summary = `${patientName}, a ${age}-year-old ${genderStr}, presents with acute epigastric burning pain and nausea after meals.`;
    factTitle = 'Epigastric stomach pain';
    factDetail = 'Burning pain in upper stomach with nausea and acidity.';
    factSnippet = 'I have severe stomach pain and nausea.';
  } else if (category === 'breathlessness') {
    complaint = 'Shortness of breath & wheezing';
    duration = 'Since last night';
    summary = `${patientName}, a ${age}-year-old ${genderStr}, presents with exertional dyspnea and nighttime shortness of breath.`;
    factTitle = 'Dyspnea & respiratory discomfort';
    factDetail = 'Breathlessness worsening on walking or lying flat.';
    factSnippet = 'I have shortness of breath and difficulty breathing.';
  } else if (category === 'leg_pain') {
    complaint = 'Severe leg pain, knee stiffness & difficulty walking';
    duration = '2 days (worsened by walking)';
    summary = `${patientName}, a ${age}-year-old ${genderStr}, presents with bilateral leg and knee pain, joint stiffness, and difficulty walking for the past 2 days.`;
    factTitle = 'Bilateral leg and knee pain';
    factDetail = 'Severe pain and stiffness in legs/knees with restricted mobility and difficulty bearing weight.';
    factSnippet = 'I have severe leg pain, knee stiffness, and difficulty walking.';
  } else if (category === 'cough_cold') {
    complaint = 'Persistent cough, cold & sore throat';
    duration = '3 days (dry cough & runny nose)';
    summary = `${patientName}, a ${age}-year-old ${genderStr}, presents with persistent irritating cough, sore throat, and nasal congestion for 3 days.`;
    factTitle = 'Persistent cough & pharyngeal irritation';
    factDetail = 'Dry irritating cough with throat soreness and mild nasal congestion.';
    factSnippet = 'I have a persistent cough, cold, and sore throat.';
  } else if (category === 'general_pain') {
    complaint = 'Generalized body pain & severe fatigue';
    duration = 'Started yesterday';
    summary = `${patientName}, a ${age}-year-old ${genderStr}, presents with generalized muscle aches, fatigue, and weakness.`;
    factTitle = 'Generalized body ache';
    factDetail = 'Diffuse body pain and exhaustion following exertion.';
    factSnippet = 'I have severe body pain, fatigue, and general malaise.';
  }

  if (lang === 'te') {
    let teComplaint = 'అధిక జ్వరం, చలి మరియు బలహీనత';
    let teDuration = '2 రోజులు (సాయంత్రం పెరుగుతోంది)';
    let teSummary = `${patientName}, ${age} సంవత్సరాల ${genderStr}, గత 2 రోజులుగా అధిక జ్వరం, చలి మరియు తీవ్రమైన నీరసంతో బాధపడుతున్నారు. సంప్రదింపుల కోసం కియోస్క్ ఇంటర్వ్యూ పూర్తి చేశారు.`;
    let teFactTitle = 'అధిక శరీర ఉష్ణోగ్రత & చలి';
    let teFactDetail = 'సాయంత్రం వేళల్లో తీవ్రమయ్యే అధిక జ్వరం, శరీర నొప్పులు మరియు అలసట.';
    let teSnippet = 'నిన్నటి నుండి నాకు అధిక జ్వరం, చలి మరియు నీరసంగా ఉంది.';

    if (category === 'chest_pain') {
      teComplaint = 'ఛాతీ బిగుతు & శ్వాస తీసుకోవడంలో ఇబ్బంది';
      teDuration = '2 రోజులు (నిన్నటి నుండి ఎక్కువైంది)';
      teSummary = `${patientName}, ${age} సంవత్సరాల ${genderStr}, గత 2 రోజులుగా ఎడమ భుజానికి వ్యాపించే ఛాతీ బిగుతు మరియు ఆయాసంతో బాధపడుతున్నారు.`;
      teFactTitle = 'రెట్రోస్టెర్నల్ ఛాతీ బిగుతు';
      teFactDetail = 'శారీరక శ్రమ వల్ల పెరిగే ఒత్తిడి వంటి అసౌకర్యం, ప్రతి ఎపిసోడ్ ~20 నిమిషాలు ఉంటుంది.';
      teSnippet = 'ఛాతీ మధ్యలో బరువు మరియు నొక్కుతున్నట్లు అనిపిస్తోంది.';
    } else if (category === 'headache') {
      teComplaint = 'తీవ్రమైన తలనొప్పి మరియు మైకం';
      teDuration = 'నిన్న మధ్యాహ్నం నుండి';
      teSummary = `${patientName}, ${age} సంవత్సరాల ${genderStr}, నిన్న మధ్యాహ్నం నుండి తీవ్రమైన తలనొప్పి, మైకం మరియు కాంతి చూస్తే కళ్ళ నొప్పి లక్షణాలతో వచ్చారు.`;
      teFactTitle = 'తీవ్రమైన తలనొప్పి & మైకం';
      teFactDetail = 'తలకు ఒక వైపు వచ్చే తీవ్రమైన పోటు, కాంతి చూస్తే ఇబ్బంది.';
      teSnippet = 'నిన్నటి నుండి నాకు తీవ్రమైన తలనొప్పి మరియు మైకంగా ఉంది.';
    } else if (category === 'stomach_pain') {
      teComplaint = 'కడుపులో తీవ్రమైన నొప్పి లేదా వికారం';
      teDuration = '4 గంటల క్రితం నుండి';
      teSummary = `${patientName}, ${age} సంవత్సరాల ${genderStr}, భోజనం చేసిన తర్వాత కడుపులో తీవ్రమైన మంట, నొప్పి మరియు వికారంతో బాధపడుతున్నారు.`;
      teFactTitle = 'కడుపు నొప్పి & వికారం';
      teFactDetail = 'పై కడుపులో తీవ్రమైన మంట, ఎసిడిటీ మరియు వికారం.';
      teSnippet = 'నాకు కడుపులో తీవ్రమైన నొప్పి మరియు వికారంగా ఉంది.';
    } else if (category === 'breathlessness') {
      teComplaint = 'శ్వాస తీసుకోవడంలో ఇబ్బంది / ఆయాసం';
      teDuration = 'నిన్న రాత్రి నుండి';
      teSummary = `${patientName}, ${age} సంవత్సరాల ${genderStr}, నిన్న రాత్రి నుండి శ్వాస తీసుకోవడంలో ఇబ్బంది మరియు ఆయాసంతో బాధపడుతున్నారు.`;
      teFactTitle = 'శ్వాసకోశ ఇబ్బంది & ఆయాసం';
      teFactDetail = 'నడుస్తున్నప్పుడు లేదా పడుకున్నప్పుడు ఎక్కువయ్యే శ్వాస ఇబ్బంది.';
      teSnippet = 'నాకు శ్వాస తీసుకోవడంలో ఇబ్బంది మరియు ఆయాసంగా ఉంది.';
    } else if (category === 'leg_pain') {
      teComplaint = 'కాళ్ళ నొప్పులు, మోకాళ్ళ బిగుతు మరియు నడవడంలో ఇబ్బంది';
      teDuration = '2 రోజులు (నడుస్తుంటే ఎక్కువవుతోంది)';
      teSummary = `${patientName}, ${age} సంవత్సరాల ${genderStr}, గత 2 రోజులుగా కాళ్ళ నొప్పులు, మోకాళ్ళ బిగుతు మరియు నడవడంలో తీవ్రమైన ఇబ్బందితో బాధపడుతున్నారు.`;
      teFactTitle = 'కాళ్ళ నొప్పులు & నడవడంలో అసౌకర్యం';
      teFactDetail = 'రెండు కాళ్ళలో వాపు, మోకాళ్ళ బిగుతు మరియు నడుస్తున్నప్పుడు లేదా నిలబడినప్పుడు తీవ్రమయ్యే నొప్పి.';
      teSnippet = 'నాకు కాళ్ళ నొప్పులు, మోకాళ్ళ బిగుతు మరియు నడవడంలో ఇబ్బందిగా ఉంది.';
    } else if (category === 'cough_cold') {
      teComplaint = 'తీవ్రమైన దగ్గు, జలుబు మరియు గొంతు నొప్పి';
      teDuration = '3 రోజులు (పొడి దగ్గు మరియు తుమ్ములు)';
      teSummary = `${patientName}, ${age} సంవత్సరాల ${genderStr}, గత 3 రోజులుగా తీవ్రమైన దగ్గు, జలుబు మరియు గొంతు నొప్పితో బాధపడుతున్నారు.`;
      teFactTitle = 'తీవ్రమైన దగ్గు & గొంతు మంట';
      teFactDetail = 'గొంతులో తీవ్రమైన గరగర, పొడి దగ్గు మరియు జలుబు లక్షణాలు.';
      teSnippet = 'నాకు తీవ్రమైన దగ్గు, జలుబు మరియు గొంతు నొప్పి ఉన్నాయి.';
    } else if (category === 'general_pain') {
      teComplaint = 'తీవ్రమైన ఒళ్ళు నొప్పులు మరియు విపరీతమైన అలసట';
      teDuration = 'నిన్నటి నుండి';
      teSummary = `${patientName}, ${age} సంవత్సరాల ${genderStr}, నిన్నటి నుండి తీవ్రమైన ఒళ్ళు నొప్పులు మరియు బలహీనతతో బాధపడుతున్నారు.`;
      teFactTitle = 'తీవ్రమైన ఒళ్ళు నొప్పులు & అలసట';
      teFactDetail = 'శరీరం అంతటా నొప్పులు మరియు కండరాల బలహీనత.';
      teSnippet = 'నాకు విపరీతమైన ఒళ్ళు నొప్పులు మరియు తీవ్ర అలసటగా ఉంది.';
    }

    return {
      patientId: mrn,
      generatedAt: 'ఈరోజు ఉదయం 09:20',
      summaryParagraph: teSummary,
      chiefComplaint: teComplaint,
      onsetAndDuration: teDuration,
      severityScore: '7 / 10 స్థాయి',
      reportedSymptoms: [
        {
          id: 'fact-01',
          patientId: mrn,
          category: 'symptom',
          title: teFactTitle,
          detail: teFactDetail,
          extractedDate: 'ఈరోజు',
          verificationStatus: 'needs-verification',
          confidence: 'high',
          sources: [
            {
              id: 'src-01',
              type: 'conversation-transcript',
              title: 'ఏఐ కియోస్క్ వాయిస్ ఇంటర్వ్యూ - ఈరోజు 09:17 AM',
              date: 'ఈరోజు',
              snippetText: teSnippet,
              confidence: 'high',
            },
          ],
        },
        {
          id: 'fact-02',
          patientId: mrn,
          category: 'medication',
          title: 'మెట్‌ఫార్మిన్ 500 mg రోజుకు రెండుసార్లు',
          detail: 'డయాబెటిస్ కోసం ప్రస్తుత ఓరల్ ఔషధం.',
          extractedDate: '14 అక్టోబర్ 2024',
          verificationStatus: 'doctor-verified',
          confidence: 'high',
          sources: [
            {
              id: 'src-02',
              type: 'uploaded-document',
              title: 'సిటీ హాస్పిటల్ రికార్డు 2024',
              date: '14 అక్టోబర్ 2024',
              snippetText: 'డిశ్చార్జ్ మందులు: మెట్‌ఫార్మిన్ 500mg రోజుకు రెండుసార్లు.',
              confidence: 'high',
            },
          ],
        },
      ],
      currentMedications: [
        {
          id: 'med-01',
          name: 'మెట్‌ఫార్మిన్',
          dosage: '500 mg',
          frequency: 'భోజనం తర్వాత రోజుకు రెండుసార్లు',
          prescribedDate: '14 అక్టోబర్ 2024',
          status: 'active',
          verificationStatus: 'doctor-verified',
          confidence: 'high',
        },
      ],
      allergies: [
        {
          id: 'alg-01',
          allergen: 'పెన్సిలిన్ / అమోక్సిసిలిన్',
          reaction: 'తీవ్రమైన శ్వాసకోశ ఇబ్బంది లేదా దద్దుర్లు',
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
          date: '14 అక్టోబర్ 2024',
          verificationStatus: 'doctor-verified',
          confidence: 'high',
        },
      ],
      medicalTimeline: [
        {
          id: 'time-01',
          patientId: mrn,
          date: 'ఈరోజు',
          year: '2026',
          title: 'కియోస్క్ ఇంటర్వ్యూ పూర్తయింది',
          type: 'symptom-onset',
          description: `${teComplaint} కోసం రోగి గైడెడ్ ఇంటర్వ్యూ పూర్తి చేశారు.`,
          source: {
            id: 'src-time-01',
            type: 'patient-self-report',
            title: 'కియోస్క్ వాయిస్ ఇన్‌టేక్',
            date: 'ఈరోజు',
            snippetText: `ఇంటర్వ్యూ: ${teComplaint}`,
            confidence: 'high',
          },
          confidence: 'high',
          tags: ['ఇంటర్వ్యూ', 'ఇన్‌టేక్'],
        },
      ],
      documents: MOCK_DOCUMENTS,
      detectedConflicts: [],
      overallAiConfidence: 'high',
      verificationProgress: {
        totalFacts: 3,
        verifiedFacts: 2,
        unverifiedFacts: 1,
      },
    };
  }

  if (lang === 'hi') {
    let hiComplaint = 'तेज बुखार, ठंड लगना और कमजोरी';
    let hiDuration = '2 दिन (शाम को बढ़ता है)';
    let hiSummary = `${patientName}, ${age} वर्षीय ${genderStr}, पिछले 2 दिनों से तेज बुखार, ठंड और भारी कमजोरी की शिकायत के साथ परामर्श हेतु आए हैं।`;
    let hiFactTitle = 'तेज बुखार और ठंड';
    let hiFactDetail = 'शाम को बढ़ने वाला तेज बुखार, शरीर में दर्द और कमजोरी।';
    let hiSnippet = 'मुझे कल से तेज बुखार, ठंड लगना और कमजोरी महसूस हो रही है।';

    if (category === 'chest_pain') {
      hiComplaint = 'सीने में जकड़न और सांस फूलना';
      hiDuration = '2 दिन (कल से बढ़ा हुआ)';
      hiSummary = `${patientName}, ${age} वर्षीय ${genderStr}, 2 दिनों से सीने में जकड़न और सांस फूलने की समस्या के साथ आए हैं।`;
      hiFactTitle = 'रेट्रोस्टर्नल सीने में जकड़न';
      hiFactDetail = 'शारीरिक परिश्रम से बढ़ने वाला दबाव, प्रति एपिसोड ~20 मिनट रहता है।';
      hiSnippet = 'सीने के बीच में भारीपन और दबाव महसूस होता है।';
    } else if (category === 'headache') {
      hiComplaint = 'तेज सिरदर्द और चक्कर आना';
      hiDuration = 'कल दोपहर से';
      hiSummary = `${patientName}, ${age} वर्षीय ${genderStr}, कल दोपहर से लगातार तेज सिरदर्द और चक्कर आने की शिकायत के साथ आए हैं।`;
      hiFactTitle = 'तेज सिरदर्द और चक्कर';
      hiFactDetail = 'दाहिनी तरफ तेज टीस मारने वाला दर्द और रोशनी से परेशानी।';
      hiSnippet = 'मुझे तेज सिरदर्द और चक्कर आ रहे हैं।';
    } else if (category === 'stomach_pain') {
      hiComplaint = 'पेट में तेज दर्द और जी मिचलाना';
      hiDuration = '4 घंटे पहले से';
      hiSummary = `${patientName}, ${age} वर्षीय ${genderStr}, दोपहर के भोजन के बाद पेट के ऊपरी हिस्से में तेज दर्द और एसिडिटी की शिकायत के साथ आए हैं।`;
      hiFactTitle = 'पेट दर्द और एसिडिटी';
      hiFactDetail = 'पेट के ऊपरी हिस्से में तेज जलन और दो बार उल्टी।';
      hiSnippet = 'मुझे पेट में तेज दर्द और उल्टी जैसा लग रहा है।';
    } else if (category === 'breathlessness') {
      hiComplaint = 'सांस लेने में तकलीफ और सांस फूलना';
      hiDuration = 'कल रात से';
      hiSummary = `${patientName}, ${age} वर्षीय ${genderStr}, कल रात से सांस फूलने और भारी बेचैनी की शिकायत के साथ आए हैं।`;
      hiFactTitle = 'सांस लेने में तकलीफ';
      hiFactDetail = 'सीढ़ियाँ चढ़ने पर या लेटने पर सांस बहुत ज्यादा फूलती है।';
      hiSnippet = 'मुझे सांस लेने में तकलीफ और सांस फूलने की समस्या है।';
    } else if (category === 'leg_pain') {
      hiComplaint = 'पैरों में तेज दर्द, घुटनों में अकड़न और चलने में परेशानी';
      hiDuration = '2 दिन (चलने पर बढ़ता है)';
      hiSummary = `${patientName}, ${age} वर्षीय ${genderStr}, पिछले 2 दिनों से दोनों पैरों में दर्द, घुटनों में अकड़न और चलने में असमर्थता की शिकायत के साथ आए हैं।`;
      hiFactTitle = 'पैरों और घुटनों में दर्द & सूजन';
      hiFactDetail = 'पैरों में भारी दर्द, जोड़ों में अकड़न और वजन उठाने या चलने में परेशानी।';
      hiSnippet = 'मुझे पैरों में तेज दर्द, घुटनों में अकड़न और चलने में तकलीफ हो रही है।';
    } else if (category === 'cough_cold') {
      hiComplaint = 'तेज खांसी, जुकाम और गले में खराश';
      hiDuration = '3 दिन (सूखी खांसी और छींकें)';
      hiSummary = `${patientName}, ${age} वर्षीय ${genderStr}, पिछले 3 दिनों से लगातार खांसी, जुकाम और गले में खराश की शिकायत के साथ आए हैं।`;
      hiFactTitle = 'तेज खांसी और गले में खराश';
      hiFactDetail = 'गले में भारी खराश, सूखी खांसी और सर्दी के लक्षण।';
      hiSnippet = 'मुझे तेज खांसी, जुकाम और गले में खराश है।';
    } else if (category === 'general_pain') {
      hiComplaint = 'पूरे शरीर में तेज दर्द और भारी थकान';
      hiDuration = 'कल से';
      hiSummary = `${patientName}, ${age} वर्षीय ${genderStr}, कल से पूरे शरीर में दर्द, मांसपेशियों में खिंचाव और कमजोरी की शिकायत के साथ आए हैं।`;
      hiFactTitle = 'पूरे शरीर में दर्द और कमजोरी';
      hiFactDetail = 'मांसपेशियों में भारी दर्द और अत्यधिक थकान।';
      hiSnippet = 'मुझे पूरे शरीर में तेज दर्द और थकान महसूस हो रही है।';
    }

    return {
      patientId: mrn,
      generatedAt: 'आज सुबह 09:20',
      summaryParagraph: hiSummary,
      chiefComplaint: hiComplaint,
      onsetAndDuration: hiDuration,
      severityScore: '7 / 10 पैमाना',
      reportedSymptoms: [
        {
          id: 'fact-01',
          patientId: mrn,
          category: 'symptom',
          title: hiFactTitle,
          detail: hiFactDetail,
          extractedDate: 'आज',
          verificationStatus: 'needs-verification',
          confidence: 'high',
          sources: [
            {
              id: 'src-01',
              type: 'conversation-transcript',
              title: 'एआई कियोस्क वॉयस साक्षात्कार - 09:17 AM आज',
              date: 'आज',
              snippetText: hiSnippet,
              confidence: 'high',
            },
          ],
        },
      ],
      currentMedications: [
        {
          id: 'med-01',
          name: 'मेटफ़ॉर्मिन',
          dosage: '500 mg',
          frequency: 'भोजन के बाद दिन में दो बार',
          prescribedDate: '14 अक्टूबर 2024',
          status: 'active',
          verificationStatus: 'doctor-verified',
          confidence: 'high',
        },
      ],
      allergies: [
        {
          id: 'alg-01',
          allergen: 'पेनिसिलिन',
          reaction: 'गंभीर सांस फूलना या चकत्ते',
          severity: 'immediate',
          verificationStatus: 'doctor-verified',
          confidence: 'high',
        },
      ],
      abnormalLabs: [],
      medicalTimeline: [
        {
          id: 'time-01',
          patientId: mrn,
          date: 'आज',
          year: '2026',
          title: 'कियोस्क इनटेक पूरा हुआ',
          type: 'symptom-onset',
          description: `${hiComplaint} के लिए साक्षात्कार पूर्ण।`,
          source: {
            id: 'src-time-01',
            type: 'patient-self-report',
            title: 'कियोस्क वॉयस इनटेक',
            date: 'आज',
            snippetText: `इनटेक: ${hiComplaint}`,
            confidence: 'high',
          },
          confidence: 'high',
          tags: ['साक्षात्कार'],
        },
      ],
      documents: MOCK_DOCUMENTS,
      detectedConflicts: [],
      overallAiConfidence: 'high',
      verificationProgress: {
        totalFacts: 3,
        verifiedFacts: 2,
        unverifiedFacts: 1,
      },
    };
  }

  // Default English
  return {
    ...MOCK_PATIENT_STORY,
    patientId: mrn,
    chiefComplaint: complaint,
    onsetAndDuration: duration,
    summaryParagraph: summary,
    reportedSymptoms: [
      {
        id: 'fact-01',
        patientId: mrn,
        category: 'symptom',
        title: factTitle,
        detail: factDetail,
        extractedDate: 'Today',
        verificationStatus: 'needs-verification',
        confidence: 'high',
        sources: [
          {
            id: 'src-01',
            type: 'conversation-transcript',
            title: 'AI Kiosk Voice Intake - Today 09:17 AM',
            date: 'Today',
            snippetText: factSnippet,
            confidence: 'high',
          },
        ],
      },
    ],
  };
};
