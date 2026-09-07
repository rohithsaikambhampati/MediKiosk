import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  DepartmentMetric,
  DoctorMetric,
  SystemServiceStatus,
  IntegrationStatus,
  AuditEvent,
  LanguageMetric,
  DoctorStatus,
} from '../types/admin';

export const INITIAL_DEPARTMENTS: DepartmentMetric[] = [
  {
    id: 'dept-gen-med',
    name: 'General Medicine',
    code: 'GEN-MED',
    activeDoctors: 12,
    patientsToday: 420,
    completedIntakePercent: 92,
    awaitingTriage: 18,
    readyForDoctor: 54,
    highPriorityCases: 14,
    avgIntakeTime: '4m 08s',
    avgTriageTime: '48s',
    avgDoctorTime: '35s',
    load: 'high',
  },
  {
    id: 'dept-cardio',
    name: 'Cardiology',
    code: 'CARD',
    activeDoctors: 6,
    patientsToday: 180,
    completedIntakePercent: 88,
    awaitingTriage: 12,
    readyForDoctor: 26,
    highPriorityCases: 12,
    avgIntakeTime: '4m 30s',
    avgTriageTime: '54s',
    avgDoctorTime: '42s',
    load: 'high',
  },
  {
    id: 'dept-peds',
    name: 'Pediatrics',
    code: 'PED',
    activeDoctors: 8,
    patientsToday: 240,
    completedIntakePercent: 94,
    awaitingTriage: 8,
    readyForDoctor: 22,
    highPriorityCases: 5,
    avgIntakeTime: '3m 52s',
    avgTriageTime: '45s',
    avgDoctorTime: '30s',
    load: 'moderate',
  },
  {
    id: 'dept-ortho',
    name: 'Orthopedics',
    code: 'ORTH',
    activeDoctors: 5,
    patientsToday: 164,
    completedIntakePercent: 90,
    awaitingTriage: 5,
    readyForDoctor: 18,
    highPriorityCases: 3,
    avgIntakeTime: '4m 15s',
    avgTriageTime: '50s',
    avgDoctorTime: '36s',
    load: 'moderate',
  },
  {
    id: 'dept-ent',
    name: 'ENT & Head Neck',
    code: 'ENT',
    activeDoctors: 4,
    patientsToday: 140,
    completedIntakePercent: 95,
    awaitingTriage: 4,
    readyForDoctor: 16,
    highPriorityCases: 1,
    avgIntakeTime: '3m 40s',
    avgTriageTime: '40s',
    avgDoctorTime: '28s',
    load: 'low',
  },
];

export const INITIAL_DOCTORS: DoctorMetric[] = [
  {
    id: 'doc-ananya-01',
    name: 'Dr. Ananya Sharma',
    specialty: 'Senior General Physician',
    department: 'General Medicine',
    status: 'active',
    currentQueue: 8,
    completedToday: 24,
    avgReviewTime: '42 sec avg',
  },
  {
    id: 'doc-vikram-02',
    name: 'Dr. Vikram Seth',
    specialty: 'Cardiologist',
    department: 'Cardiology',
    status: 'active',
    currentQueue: 5,
    completedToday: 18,
    avgReviewTime: '54 sec avg',
  },
  {
    id: 'doc-meera-03',
    name: 'Dr. Meera Iyer',
    specialty: 'Pediatric Specialist',
    department: 'Pediatrics',
    status: 'on-break',
    currentQueue: 3,
    completedToday: 21,
    avgReviewTime: '38 sec avg',
  },
  {
    id: 'doc-rajesh-04',
    name: 'Dr. Rajesh Gupta',
    specialty: 'Orthopedic Surgeon',
    department: 'Orthopedics',
    status: 'active',
    currentQueue: 6,
    completedToday: 15,
    avgReviewTime: '46 sec avg',
  },
  {
    id: 'doc-sneha-05',
    name: 'Dr. Sneha Reddy',
    specialty: 'ENT Specialist',
    department: 'ENT & Head Neck',
    status: 'offline',
    currentQueue: 0,
    completedToday: 19,
    avgReviewTime: '32 sec avg',
  },
];

export const INITIAL_SYSTEM_SERVICES: SystemServiceStatus[] = [
  { id: 'srv-01', name: 'Frontend Kiosk Portal', category: 'core', status: 'operational', latency: '12ms', uptime: '99.98%' },
  { id: 'srv-02', name: 'API Gateway Router', category: 'core', status: 'operational', latency: '18ms', uptime: '99.99%' },
  { id: 'srv-03', name: 'Identity & Authentication', category: 'security', status: 'operational', latency: '24ms', uptime: '100%' },
  { id: 'srv-04', name: 'AI Conversation Engine', category: 'ai', status: 'operational', latency: '180ms', uptime: '99.92%' },
  { id: 'srv-05', name: 'Document Ingestion Service', category: 'ai', status: 'operational', latency: '210ms', uptime: '99.88%' },
  { id: 'srv-06', name: 'OCR Text Extractor', category: 'ai', status: 'operational', latency: '140ms', uptime: '99.90%' },
  { id: 'srv-07', name: 'Medical Timeline Engine', category: 'ai', status: 'operational', latency: '95ms', uptime: '99.95%' },
  { id: 'srv-08', name: 'Clinical Risk Stratifier', category: 'ai', status: 'operational', latency: '65ms', uptime: '99.97%' },
  { id: 'srv-09', name: 'Doctor Summary Generator', category: 'ai', status: 'operational', latency: '110ms', uptime: '99.94%' },
];

export const INITIAL_INTEGRATIONS: IntegrationStatus[] = [
  {
    id: 'int-abdm',
    name: 'ABDM Health ID Service',
    type: 'National Digital Health Ecosystem',
    status: 'demo-connected',
    fhirExchange: 'Prototype Ready',
    lastSync: '10:42 AM',
    details: 'Demonstration connector for Ayushman Bharat Digital Mission Health Account (ABHA) resolution.',
  },
  {
    id: 'int-fhir',
    name: 'HL7 FHIR R4 Core Server',
    type: 'Interoperability Protocol',
    status: 'demo-connected',
    fhirExchange: 'HL7 FHIR R4 Bundle Standard',
    lastSync: '10:44 AM',
    details: 'Synthetic FHIR R4 Patient and Encounter resource transformer for hospital EHR integration.',
  },
  {
    id: 'int-his',
    name: 'Hospital HIS Queue Gateway',
    type: 'OPD Queue Engine',
    status: 'demo-connected',
    fhirExchange: 'Active Socket Stream',
    lastSync: '10:45 AM',
    details: 'Live mock queue synchronizer feeding token numbers to OPD doctor consoles.',
  },
  {
    id: 'int-emr',
    name: 'Enterprise EMR Connector',
    type: 'Clinical Document Storage',
    status: 'prototype-ready',
    fhirExchange: 'DocumentReference Endpoint',
    lastSync: '10:30 AM',
    details: 'Prototype connector for syncing structured intake PDFs and OCR extract JSON artifacts.',
  },
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'audit-01',
    timestamp: '10:42 AM',
    actor: 'Dr. Ananya Sharma',
    role: 'Doctor',
    action: 'Viewed Patient Record',
    resource: '#102 (Ramesh Kumar)',
    status: 'Success',
    details: 'Doctor accessed unified clinical workspace overview and timeline.',
  },
  {
    id: 'audit-02',
    timestamp: '10:40 AM',
    actor: 'Nurse Priya',
    role: 'Nurse',
    action: 'Escalated Triage Alert',
    resource: '#102 (Ramesh Kumar)',
    status: 'Success',
    details: 'Triage alert flagged as escalated due to chest pain & exertional dyspnea.',
  },
  {
    id: 'audit-03',
    timestamp: '10:38 AM',
    actor: 'Patient Kiosk',
    role: 'Patient Kiosk',
    action: 'Intake Session Completed',
    resource: '#102 (Ramesh Kumar)',
    status: 'Success',
    details: '12-step guided intake complete; AI risk engine generated 🔴 Immediate rating.',
  },
  {
    id: 'audit-04',
    timestamp: '10:35 AM',
    actor: 'Dr. Ananya Sharma',
    role: 'Doctor',
    action: 'Verified Medication Fact',
    resource: 'Aspirin 75mg OD',
    status: 'Success',
    details: 'Verified by Dr. Ananya Sharma with audit timestamp.',
  },
  {
    id: 'audit-05',
    timestamp: '10:30 AM',
    actor: 'System Engine',
    role: 'System Engine',
    action: 'ABDM Health ID Sync',
    resource: 'ABHA-9948-2201-9921',
    status: 'Success',
    details: 'Mock ABDM Health ID resolved and mapped to patient MRN.',
  },
];

export const INITIAL_LANGUAGES: LanguageMetric[] = [
  { id: 'lang-01', code: 'en', name: 'English', nativeName: 'English', sessionsToday: 420, completionRatePercent: 94, voiceUsagePercent: 52, avgIntakeTime: '3m 50s', isEnabled: true },
  { id: 'lang-02', code: 'te', name: 'Telugu', nativeName: 'తెలుగు', sessionsToday: 310, completionRatePercent: 92, voiceUsagePercent: 78, avgIntakeTime: '4m 10s', isEnabled: true },
  { id: 'lang-03', code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', sessionsToday: 240, completionRatePercent: 90, voiceUsagePercent: 72, avgIntakeTime: '4m 15s', isEnabled: true },
  { id: 'lang-04', code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', sessionsToday: 160, completionRatePercent: 91, voiceUsagePercent: 65, avgIntakeTime: '4m 05s', isEnabled: true },
  { id: 'lang-05', code: 'kn', name: 'Kannada', nativeName: 'కన్నడ', sessionsToday: 90, completionRatePercent: 89, voiceUsagePercent: 60, avgIntakeTime: '4m 20s', isEnabled: true },
  { id: 'lang-06', code: 'mr', name: 'Marathi', nativeName: 'मराठी', sessionsToday: 45, completionRatePercent: 88, voiceUsagePercent: 55, avgIntakeTime: '4m 30s', isEnabled: true },
  { id: 'lang-07', code: 'bn', name: 'Bengali', nativeName: 'বাংলা', sessionsToday: 30, completionRatePercent: 87, voiceUsagePercent: 50, avgIntakeTime: '4m 35s', isEnabled: true },
  { id: 'lang-08', code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', sessionsToday: 20, completionRatePercent: 90, voiceUsagePercent: 58, avgIntakeTime: '4m 12s', isEnabled: true },
];

interface AdminContextType {
  departments: DepartmentMetric[];
  doctors: DoctorMetric[];
  systemServices: SystemServiceStatus[];
  integrations: IntegrationStatus[];
  auditEvents: AuditEvent[];
  languages: LanguageMetric[];
  updateDoctorStatus: (doctorId: string, status: DoctorStatus) => void;
  toggleLanguage: (langId: string) => void;
  selectedTimeRange: 'today' | '7days' | '30days';
  setSelectedTimeRange: (range: 'today' | '7days' | '30days') => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [departments] = useState<DepartmentMetric[]>(INITIAL_DEPARTMENTS);
  const [doctors, setDoctors] = useState<DoctorMetric[]>(INITIAL_DOCTORS);
  const [systemServices] = useState<SystemServiceStatus[]>(INITIAL_SYSTEM_SERVICES);
  const [integrations] = useState<IntegrationStatus[]>(INITIAL_INTEGRATIONS);
  const [auditEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [languages, setLanguages] = useState<LanguageMetric[]>(INITIAL_LANGUAGES);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | '7days' | '30days'>('today');

  const updateDoctorStatus = (doctorId: string, status: DoctorStatus) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, status } : d))
    );
  };

  const toggleLanguage = (langId: string) => {
    setLanguages((prev) =>
      prev.map((l) => (l.id === langId ? { ...l, isEnabled: !l.isEnabled } : l))
    );
  };

  return (
    <AdminContext.Provider
      value={{
        departments,
        doctors,
        systemServices,
        integrations,
        auditEvents,
        languages,
        updateDoctorStatus,
        toggleLanguage,
        selectedTimeRange,
        setSelectedTimeRange,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
