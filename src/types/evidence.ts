import { ConfidenceLevel, VerificationStatus } from './clinical';

export type EvidenceType = 'conversation-transcript' | 'uploaded-document' | 'patient-self-report' | 'historical-emr';

export interface EvidenceSource {
  id: string;
  type: EvidenceType;
  title: string;
  date: string;
  documentId?: string;
  documentPage?: number;
  snippetText: string;
  confidence: ConfidenceLevel;
}

export interface MedicalFact {
  id: string;
  patientId: string;
  category: 'chief-complaint' | 'symptom' | 'medication' | 'allergy' | 'past-history' | 'lifestyle' | 'family-history';
  title: string;
  detail: string;
  extractedDate: string;
  verificationStatus: VerificationStatus;
  confidence: ConfidenceLevel;
  sources: EvidenceSource[];
  verifiedByDoctorId?: string;
  verifiedAt?: string;
  doctorNotes?: string;
}

export interface VerificationAction {
  factId: string;
  action: 'verify' | 'reject' | 'modify';
  doctorId: string;
  notes?: string;
  modifiedValue?: string;
}
