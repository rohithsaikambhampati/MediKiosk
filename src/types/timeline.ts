import { ConfidenceLevel } from './clinical';
import { EvidenceSource } from './evidence';

export type EventType = 'diagnosis' | 'medication' | 'procedure' | 'lab-report' | 'hospital-visit' | 'symptom-onset' | 'surgery';

export interface TimelineEvent {
  id: string;
  patientId: string;
  date: string; // e.g. "2024-03-12" or "March 2024"
  year: string; // e.g. "2024"
  title: string;
  type: EventType;
  description: string;
  source: EvidenceSource;
  confidence: ConfidenceLevel;
  tags: string[];
  isAbnormal?: boolean;
  hospitalOrDoctor?: string;
}
