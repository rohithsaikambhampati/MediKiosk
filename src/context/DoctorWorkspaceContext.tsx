import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RiskLevel, VerificationStatus } from '../types/clinical';
import { MedicalFact } from '../types/evidence';

export interface QueuePatient {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  department: string;
  chiefComplaint: string;
  riskLevel: RiskLevel;
  intakeStatus: 'ready' | 'reviewing' | 'in-consultation' | 'completed';
  waitTime: string;
  arrivalTime: string;
  riskFlagsCount: number;
  unverifiedFactsCount: number;
  documentsCount: number;
}

export const SYNTHETIC_PATIENTS: QueuePatient[] = [
  {
    id: 'patient-ramesh-01',
    token: '#102',
    name: 'Ramesh Kumar',
    age: 65,
    gender: 'male',
    department: 'General Medicine',
    chiefComplaint: 'Chest pressure & breathlessness since yesterday',
    riskLevel: 'immediate',
    intakeStatus: 'ready',
    waitTime: '04m',
    arrivalTime: '10:15 AM',
    riskFlagsCount: 3,
    unverifiedFactsCount: 4,
    documentsCount: 3,
  },
  {
    id: 'patient-sita-02',
    token: '#103',
    name: 'Sita Devi',
    age: 54,
    gender: 'female',
    department: 'General Medicine',
    chiefComplaint: 'High fever (102°F) & extreme fatigue for 3 days',
    riskLevel: 'high-priority',
    intakeStatus: 'ready',
    waitTime: '11m',
    arrivalTime: '10:08 AM',
    riskFlagsCount: 1,
    unverifiedFactsCount: 2,
    documentsCount: 2,
  },
  {
    id: 'patient-ravi-03',
    token: '#104',
    name: 'Ravi Kumar',
    age: 32,
    gender: 'male',
    department: 'General Medicine',
    chiefComplaint: 'Throbbing headache & light sensitivity',
    riskLevel: 'routine',
    intakeStatus: 'ready',
    waitTime: '18m',
    arrivalTime: '10:01 AM',
    riskFlagsCount: 0,
    unverifiedFactsCount: 1,
    documentsCount: 1,
  },
  {
    id: 'patient-anita-04',
    token: '#105',
    name: 'Anita Rao',
    age: 48,
    gender: 'female',
    department: 'General Medicine',
    chiefComplaint: 'Right lower quadrant abdominal cramping',
    riskLevel: 'needs-attention',
    intakeStatus: 'ready',
    waitTime: '24m',
    arrivalTime: '09:55 AM',
    riskFlagsCount: 1,
    unverifiedFactsCount: 3,
    documentsCount: 2,
  },
  {
    id: 'patient-mohan-05',
    token: '#106',
    name: 'Mohan Singh',
    age: 71,
    gender: 'male',
    department: 'General Medicine',
    chiefComplaint: 'Sudden onset dizziness & dyspnea on exertion',
    riskLevel: 'immediate',
    intakeStatus: 'reviewing',
    waitTime: '30m',
    arrivalTime: '09:49 AM',
    riskFlagsCount: 4,
    unverifiedFactsCount: 5,
    documentsCount: 4,
  },
  {
    id: 'patient-lakshmi-06',
    token: '#107',
    name: 'Lakshmi Devi',
    age: 59,
    gender: 'female',
    department: 'General Medicine',
    chiefComplaint: 'Bilateral knee joint swelling & stiffness',
    riskLevel: 'routine',
    intakeStatus: 'completed',
    waitTime: '45m',
    arrivalTime: '09:34 AM',
    riskFlagsCount: 0,
    unverifiedFactsCount: 0,
    documentsCount: 2,
  },
];

interface DoctorWorkspaceContextType {
  queue: QueuePatient[];
  activePatientId: string;
  activePatient: QueuePatient;
  setActivePatientId: (id: string) => void;
  riskFilter: string;
  setRiskFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  verifiedFactsState: Record<string, VerificationStatus>;
  doctorNotesState: Record<string, string>;
  verifyFact: (factId: string, doctorNotes?: string) => void;
  rejectFact: (factId: string, doctorNotes?: string) => void;
  editFact: (factId: string, newDetail: string) => void;
  startConsultation: (patientId: string) => void;
  completeConsultation: (patientId: string) => void;
}

const DoctorWorkspaceContext = createContext<DoctorWorkspaceContextType | undefined>(undefined);

export const DoctorWorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<QueuePatient[]>(SYNTHETIC_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>('patient-ramesh-01');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [verifiedFactsState, setVerifiedFactsState] = useState<Record<string, VerificationStatus>>({
    'fact-chief-complaint': 'patient-reported',
    'fact-metformin': 'needs-verification',
    'fact-aspirin': 'doctor-verified',
    'fact-penicillin': 'needs-verification',
    'fact-hba1c': 'ai-extracted',
  });

  const [doctorNotesState, setDoctorNotesState] = useState<Record<string, string>>({});

  const activePatient = queue.find((p) => p.id === activePatientId) || queue[0];

  const verifyFact = (factId: string, doctorNotes?: string) => {
    setVerifiedFactsState((prev) => ({
      ...prev,
      [factId]: 'doctor-verified',
    }));

    if (doctorNotes) {
      setDoctorNotesState((prev) => ({
        ...prev,
        [factId]: doctorNotes,
      }));
    }
  };

  const rejectFact = (factId: string, doctorNotes?: string) => {
    setVerifiedFactsState((prev) => ({
      ...prev,
      [factId]: 'needs-verification',
    }));

    if (doctorNotes) {
      setDoctorNotesState((prev) => ({
        ...prev,
        [factId]: doctorNotes,
      }));
    }
  };

  const editFact = (factId: string, newDetail: string) => {
    setVerifiedFactsState((prev) => ({
      ...prev,
      [factId]: 'doctor-verified',
    }));

    setDoctorNotesState((prev) => ({
      ...prev,
      [factId]: `Doctor Modified: ${newDetail} (Verified by Dr. Ananya Sharma)`,
    }));
  };

  const startConsultation = (patientId: string) => {
    setQueue((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, intakeStatus: 'in-consultation' } : p))
    );
  };

  const completeConsultation = (patientId: string) => {
    setQueue((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, intakeStatus: 'completed' } : p))
    );
  };

  return (
    <DoctorWorkspaceContext.Provider
      value={{
        queue,
        activePatientId,
        activePatient,
        setActivePatientId,
        riskFilter,
        setRiskFilter,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        verifiedFactsState,
        doctorNotesState,
        verifyFact,
        rejectFact,
        editFact,
        startConsultation,
        completeConsultation,
      }}
    >
      {children}
    </DoctorWorkspaceContext.Provider>
  );
};

export const useDoctorWorkspace = () => {
  const context = useContext(DoctorWorkspaceContext);
  if (!context) {
    throw new Error('useDoctorWorkspace must be used within a DoctorWorkspaceProvider');
  }
  return context;
};
