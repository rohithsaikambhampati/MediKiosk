import { RiskLevel } from './clinical';

export type TriagePriority = 'immediate' | 'high-priority' | 'needs-attention' | 'routine';

export type TriageStatus =
  | 'awaiting-triage'
  | 'under-review'
  | 'escalated'
  | 'ready-for-doctor'
  | 'in-consultation'
  | 'completed';

export interface TriagePatient {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  department: string;
  chiefComplaint: string;
  priority: TriagePriority;
  riskLevel: RiskLevel;
  whyFlagged: string[];
  status: TriageStatus;
  intakeStatus: 'complete' | 'in-progress' | 'pending';
  waitTime: string;
  arrivalTime: string;
  riskFlagsCount: number;
  unverifiedFactsCount: number;
  documentsCount: number;
  historyHighlights: string[];
  medications: { name: string; dose: string }[];
  allergies: string[];
}

export interface TriageAlert {
  id: string;
  patientId: string;
  token: string;
  patientName: string;
  severity: TriagePriority;
  triggerTitle: string;
  signals: string[];
  receivedTime: string;
  status: 'new' | 'acknowledged' | 'escalated';
  acknowledgedBy?: string;
  acknowledgedTime?: string;
}
