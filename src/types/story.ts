import { ConfidenceLevel, RiskLevel, VerificationStatus } from './clinical';
import { MedicalFact } from './evidence';
import { TimelineEvent } from './timeline';
import { MedicalDocument } from './documents';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedDate?: string;
  prescribedBy?: string;
  status: 'active' | 'discontinued' | 'as-needed';
  verificationStatus: VerificationStatus;
  confidence: ConfidenceLevel;
  sourceText?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: RiskLevel;
  verificationStatus: VerificationStatus;
  confidence: ConfidenceLevel;
}

export interface LabResult {
  id: string;
  testName: string;
  resultValue: string;
  referenceRange: string;
  unit: string;
  isAbnormal: boolean;
  date: string;
  verificationStatus: VerificationStatus;
  confidence: ConfidenceLevel;
}

export interface ClinicalConflict {
  id: string;
  title: string;
  description: string;
  itemA: string;
  itemB: string;
  severity: 'low' | 'medium' | 'high';
  requiresDoctorDecision: boolean;
}

export interface PatientStory {
  patientId: string;
  generatedAt: string;
  summaryParagraph: string;
  chiefComplaint: string;
  onsetAndDuration: string;
  severityScore: string;
  reportedSymptoms: MedicalFact[];
  currentMedications: Medication[];
  allergies: Allergy[];
  abnormalLabs: LabResult[];
  medicalTimeline: TimelineEvent[];
  documents: MedicalDocument[];
  detectedConflicts: ClinicalConflict[];
  overallAiConfidence: ConfidenceLevel;
  verificationProgress: {
    totalFacts: number;
    verifiedFacts: number;
    unverifiedFacts: number;
  };
}
