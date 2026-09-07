export type OperationalLoad = 'low' | 'moderate' | 'high' | 'critical';

export type DoctorStatus = 'active' | 'on-break' | 'offline' | 'unavailable';

export interface DepartmentMetric {
  id: string;
  name: string;
  code: string;
  activeDoctors: number;
  patientsToday: number;
  completedIntakePercent: number;
  awaitingTriage: number;
  readyForDoctor: number;
  highPriorityCases: number;
  avgIntakeTime: string;
  avgTriageTime: string;
  avgDoctorTime: string;
  load: OperationalLoad;
}

export interface DoctorMetric {
  id: string;
  name: string;
  specialty: string;
  department: string;
  status: DoctorStatus;
  currentQueue: number;
  completedToday: number;
  avgReviewTime: string;
}

export interface SystemServiceStatus {
  id: string;
  name: string;
  category: 'core' | 'ai' | 'integration' | 'security';
  status: 'operational' | 'degraded' | 'maintenance' | 'offline';
  latency: string;
  uptime: string;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  type: string;
  status: 'demo-connected' | 'prototype-ready' | 'not-connected';
  fhirExchange: string;
  lastSync: string;
  details: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: 'Doctor' | 'Nurse' | 'Admin' | 'Patient Kiosk' | 'System Engine';
  action: string;
  resource: string;
  status: 'Success' | 'Warning' | 'Failed';
  details?: string;
}

export interface LanguageMetric {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  sessionsToday: number;
  completionRatePercent: number;
  voiceUsagePercent: number;
  avgIntakeTime: string;
  isEnabled: boolean;
}

export interface WorkflowFunnelStage {
  stage: string;
  count: number;
  conversionPercent: number;
}
