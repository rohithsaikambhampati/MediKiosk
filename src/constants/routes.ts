import { UserRole } from '../types/clinical';

export const PATIENT_ROUTES = {
  WELCOME: '/patient/welcome',
  LANGUAGE: '/patient/language',
  ACCESSIBILITY: '/patient/accessibility',
  CONSENT: '/patient/consent',
  IDENTITY: '/patient/identity',
  INTAKE: '/patient/intake',
  CONVERSATION: '/patient/conversation',
  DOCUMENTS: '/patient/documents',
  DOCUMENT_PROCESSING: '/patient/document-processing',
  PATIENT_STORY: '/patient/patient-story',
  REVIEW: '/patient/review',
  COMPLETE: '/patient/complete',
} as const;

export const DOCTOR_ROUTES = {
  LOGIN: '/doctor/login',
  DASHBOARD: '/doctor/dashboard',
  QUEUE: '/doctor/queue',
  PATIENT_DETAIL: '/doctor/patient/:patientId',
  PATIENT_OVERVIEW: '/doctor/patient/:patientId/overview',
  PATIENT_TIMELINE: '/doctor/patient/:patientId/timeline',
  PATIENT_MEDICATIONS: '/doctor/patient/:patientId/medications',
  PATIENT_ALLERGIES: '/doctor/patient/:patientId/allergies',
  PATIENT_REPORTS: '/doctor/patient/:patientId/reports',
  PATIENT_EVIDENCE: '/doctor/patient/:patientId/evidence',
  PATIENT_AI_REVIEW: '/doctor/patient/:patientId/ai-review',
  CONSULTATION: '/doctor/consultation',
} as const;

export const NURSE_ROUTES = {
  LOGIN: '/nurse/login',
  DASHBOARD: '/nurse/dashboard',
  QUEUE: '/nurse/queue',
  TRIAGE: '/nurse/triage',
  ALERTS: '/nurse/alerts',
} as const;

export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin/dashboard',
  PATIENTS: '/admin/patients',
  DOCTORS: '/admin/doctors',
  DEPARTMENTS: '/admin/departments',
  ANALYTICS: '/admin/analytics',
  LANGUAGES: '/admin/languages',
  INTEGRATIONS: '/admin/integrations',
  SECURITY: '/admin/security',
  AUDIT_LOGS: '/admin/audit-logs',
} as const;

export const SHARED_ROUTES = {
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  HELP: '/help',
} as const;

export interface RouteItem {
  path: string;
  name: string;
  role: UserRole;
  group: string;
}

export const ALL_APP_ROUTES: RouteItem[] = [
  // Patient
  { path: PATIENT_ROUTES.WELCOME, name: 'Welcome Screen', role: 'patient', group: 'Patient Workflow' },
  { path: PATIENT_ROUTES.LANGUAGE, name: 'Language Selector', role: 'patient', group: 'Patient Workflow' },
  { path: PATIENT_ROUTES.ACCESSIBILITY, name: 'Accessibility Options', role: 'patient', group: 'Patient Workflow' },
  { path: PATIENT_ROUTES.CONSENT, name: 'Clinical Consent', role: 'patient', group: 'Patient Workflow' },
  { path: PATIENT_ROUTES.IDENTITY, name: 'Patient Identity Verification', role: 'patient', group: 'Patient Workflow' },
  { path: PATIENT_ROUTES.INTAKE, name: 'Intake Questionnaire', role: 'patient', group: 'Patient Workflow' },
  { path: PATIENT_ROUTES.CONVERSATION, name: 'AI Voice/Text Interview', role: 'patient', group: 'Patient Workflow' },
  { path: PATIENT_ROUTES.DOCUMENTS, name: 'Upload Medical Records', role: 'patient', group: 'Patient Workflow' },
  { path: PATIENT_ROUTES.DOCUMENT_PROCESSING, name: 'Document Intelligence Status', role: 'patient', group: 'Patient Workflow' },
  { path: PATIENT_ROUTES.PATIENT_STORY, name: 'Interactive Patient Story Preview', role: 'patient', group: 'Patient Workflow' },
  { path: PATIENT_ROUTES.REVIEW, name: 'Final Patient Summary Review', role: 'patient', group: 'Patient Workflow' },
  { path: PATIENT_ROUTES.COMPLETE, name: 'Intake Complete', role: 'patient', group: 'Patient Workflow' },

  // Doctor
  { path: DOCTOR_ROUTES.LOGIN, name: 'Doctor Login', role: 'doctor', group: 'Doctor Workspace' },
  { path: DOCTOR_ROUTES.DASHBOARD, name: 'Doctor Dashboard', role: 'doctor', group: 'Doctor Workspace' },
  { path: DOCTOR_ROUTES.QUEUE, name: 'Patient Consultation Queue', role: 'doctor', group: 'Doctor Workspace' },
  { path: DOCTOR_ROUTES.PATIENT_OVERVIEW, name: 'Patient Workspace Overview', role: 'doctor', group: 'Doctor Workspace' },
  { path: DOCTOR_ROUTES.PATIENT_TIMELINE, name: 'Medical History Timeline', role: 'doctor', group: 'Doctor Workspace' },
  { path: DOCTOR_ROUTES.PATIENT_MEDICATIONS, name: 'Medications & Prescriptions', role: 'doctor', group: 'Doctor Workspace' },
  { path: DOCTOR_ROUTES.PATIENT_ALLERGIES, name: 'Allergies & Risk Flags', role: 'doctor', group: 'Doctor Workspace' },
  { path: DOCTOR_ROUTES.PATIENT_REPORTS, name: 'Diagnostic Lab Reports', role: 'doctor', group: 'Doctor Workspace' },
  { path: DOCTOR_ROUTES.PATIENT_EVIDENCE, name: 'Evidence Traceability Drawer', role: 'doctor', group: 'Doctor Workspace' },
  { path: DOCTOR_ROUTES.PATIENT_AI_REVIEW, name: 'AI Review & Verification Center', role: 'doctor', group: 'Doctor Workspace' },
  { path: DOCTOR_ROUTES.CONSULTATION, name: 'Active Live Consultation Workspace', role: 'doctor', group: 'Doctor Workspace' },

  // Nurse
  { path: NURSE_ROUTES.LOGIN, name: 'Triage Nurse Login', role: 'nurse', group: 'Nurse / Triage' },
  { path: NURSE_ROUTES.DASHBOARD, name: 'Triage Center Dashboard', role: 'nurse', group: 'Nurse / Triage' },
  { path: NURSE_ROUTES.QUEUE, name: 'Urgency & Queue Monitor', role: 'nurse', group: 'Nurse / Triage' },
  { path: NURSE_ROUTES.TRIAGE, name: 'Rapid Assessment Console', role: 'nurse', group: 'Nurse / Triage' },
  { path: NURSE_ROUTES.ALERTS, name: 'Critical Risk Alerts Feed', role: 'nurse', group: 'Nurse / Triage' },

  // Admin
  { path: ADMIN_ROUTES.LOGIN, name: 'Administrator Portal Login', role: 'admin', group: 'System Administration' },
  { path: ADMIN_ROUTES.DASHBOARD, name: 'Executive Operations Dashboard', role: 'admin', group: 'System Administration' },
  { path: ADMIN_ROUTES.PATIENTS, name: 'Hospital Intake Directory', role: 'admin', group: 'System Administration' },
  { path: ADMIN_ROUTES.DOCTORS, name: 'Physicians Roster Management', role: 'admin', group: 'System Administration' },
  { path: ADMIN_ROUTES.DEPARTMENTS, name: 'Departmental Clinical Queues', role: 'admin', group: 'System Administration' },
  { path: ADMIN_ROUTES.ANALYTICS, name: 'Intake Throughput Analytics', role: 'admin', group: 'System Administration' },
  { path: ADMIN_ROUTES.LANGUAGES, name: 'Multilingual AI Models Config', role: 'admin', group: 'System Administration' },
  { path: ADMIN_ROUTES.INTEGRATIONS, name: 'EMR & ABDM FHIR Connectors', role: 'admin', group: 'System Administration' },
  { path: ADMIN_ROUTES.SECURITY, name: 'HIPAA & Role-Based Access Controls', role: 'admin', group: 'System Administration' },
  { path: ADMIN_ROUTES.AUDIT_LOGS, name: 'Clinical Verification Audit Trail', role: 'admin', group: 'System Administration' },

  // Shared
  { path: SHARED_ROUTES.NOTIFICATIONS, name: 'Clinical Alerts & Notifications', role: 'doctor', group: 'Shared Utilities' },
  { path: SHARED_ROUTES.SETTINGS, name: 'Preferences & System Settings', role: 'doctor', group: 'Shared Utilities' },
  { path: SHARED_ROUTES.PROFILE, name: 'User Profile', role: 'doctor', group: 'Shared Utilities' },
  { path: SHARED_ROUTES.HELP, name: 'System Help & Documentation', role: 'patient', group: 'Shared Utilities' },
];
