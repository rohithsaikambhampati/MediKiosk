export type RiskLevel = 'routine' | 'needs-attention' | 'high-priority' | 'immediate';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type VerificationStatus = 'patient-reported' | 'ai-extracted' | 'needs-verification' | 'doctor-verified';

export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin';

export interface AIConfidence {
  level: ConfidenceLevel;
  score: number; // 0 to 1
  rationale?: string;
  lastAssessedAt?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  preferredLanguage: string;
  phone: string;
  photoUrl?: string;
  assignedDepartment: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  triagePriority: RiskLevel;
  intakeStatus: 'not-started' | 'in-progress' | 'ready-for-review' | 'verified' | 'in-consultation' | 'completed';
  intakeProgress: number; // 0-100%
  arrivalTime: string;
  chiefComplaint: string;
  riskFlagsCount: number;
  unverifiedFactsCount: number;
  documentsUploadedCount: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  email: string;
  avatarUrl?: string;
  activePatientsCount: number;
  pendingReviewsCount: number;
  isAvailable: boolean;
}

export interface Nurse {
  id: string;
  name: string;
  department: string;
  shift: string;
  activeTriageCount: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  activeDoctors: number;
  waitingPatients: number;
  averageWaitMinutes: number;
}

export interface RiskAlert {
  id: string;
  patientId: string;
  level: RiskLevel;
  title: string;
  description: string;
  category: 'symptom' | 'vital' | 'allergy' | 'medication-interaction' | 'historical-flag';
  detectedAt: string;
  requiresImmediateAction: boolean;
  acknowledgedByDoctor?: boolean;
}
