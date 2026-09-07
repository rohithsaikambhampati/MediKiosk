import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TriagePatient, TriageAlert, TriagePriority, TriageStatus } from '../types/triage';

export const INITIAL_TRIAGE_PATIENTS: TriagePatient[] = [
  {
    id: 'patient-ramesh-01',
    token: '#102',
    name: 'Ramesh Kumar',
    age: 65,
    gender: 'male',
    department: 'General Medicine',
    chiefComplaint: 'Chest pressure & breathlessness since yesterday',
    priority: 'immediate',
    riskLevel: 'immediate',
    whyFlagged: ['Chest pain', 'Arm radiation', 'Sweating', 'Breathlessness'],
    status: 'awaiting-triage',
    intakeStatus: 'complete',
    waitTime: '04m',
    arrivalTime: '10:15 AM',
    riskFlagsCount: 4,
    unverifiedFactsCount: 4,
    documentsCount: 3,
    historyHighlights: ['Type 2 Diabetes (10 yrs)', 'Hypertension (5 yrs)'],
    medications: [
      { name: 'Metformin', dose: '500 mg BD' },
      { name: 'Aspirin', dose: '75 mg OD' },
    ],
    allergies: ['Penicillin (Severe cutaneous reaction 2021)'],
  },
  {
    id: 'patient-sita-02',
    token: '#103',
    name: 'Sita Devi',
    age: 54,
    gender: 'female',
    department: 'General Medicine',
    chiefComplaint: 'High fever (102°F) & extreme fatigue for 3 days',
    priority: 'high-priority',
    riskLevel: 'high-priority',
    whyFlagged: ['High fever > 101.5°F for 3+ days', 'Profound fatigue'],
    status: 'awaiting-triage',
    intakeStatus: 'complete',
    waitTime: '08m',
    arrivalTime: '10:08 AM',
    riskFlagsCount: 2,
    unverifiedFactsCount: 2,
    documentsCount: 2,
    historyHighlights: ['Hypothyroidism'],
    medications: [{ name: 'Levothyroxine', dose: '50 mcg OD' }],
    allergies: ['No known drug allergies (NKDA)'],
  },
  {
    id: 'patient-anita-04',
    token: '#105',
    name: 'Anita Rao',
    age: 48,
    gender: 'female',
    department: 'General Medicine',
    chiefComplaint: 'Right lower quadrant abdominal cramping',
    priority: 'needs-attention',
    riskLevel: 'needs-attention',
    whyFlagged: ['Localized abdominal tenderness'],
    status: 'awaiting-triage',
    intakeStatus: 'complete',
    waitTime: '14m',
    arrivalTime: '09:55 AM',
    riskFlagsCount: 1,
    unverifiedFactsCount: 3,
    documentsCount: 2,
    historyHighlights: ['GERD'],
    medications: [{ name: 'Omeprazole', dose: '20 mg OD' }],
    allergies: ['Sulfa drugs'],
  },
  {
    id: 'patient-ravi-03',
    token: '#104',
    name: 'Ravi Kumar',
    age: 32,
    gender: 'male',
    department: 'General Medicine',
    chiefComplaint: 'Throbbing headache & light sensitivity',
    priority: 'routine',
    riskLevel: 'routine',
    whyFlagged: ['No acute red flags identified'],
    status: 'awaiting-triage',
    intakeStatus: 'complete',
    waitTime: '18m',
    arrivalTime: '10:01 AM',
    riskFlagsCount: 0,
    unverifiedFactsCount: 1,
    documentsCount: 1,
    historyHighlights: ['Migraine history'],
    medications: [{ name: 'Paracetamol', dose: '650 mg SOS' }],
    allergies: ['No known drug allergies (NKDA)'],
  },
  {
    id: 'patient-mohan-05',
    token: '#106',
    name: 'Mohan Singh',
    age: 71,
    gender: 'male',
    department: 'General Medicine',
    chiefComplaint: 'Sudden onset dizziness & dyspnea on exertion',
    priority: 'immediate',
    riskLevel: 'immediate',
    whyFlagged: ['Acute exertional dyspnea', 'Age > 70 with acute dizziness'],
    status: 'under-review',
    intakeStatus: 'complete',
    waitTime: '26m',
    arrivalTime: '09:49 AM',
    riskFlagsCount: 3,
    unverifiedFactsCount: 5,
    documentsCount: 4,
    historyHighlights: ['Ischemic Heart Disease (2019)', 'Hypertension'],
    medications: [{ name: 'Atorvastatin', dose: '20 mg OD' }],
    allergies: ['Aspirin (Gastric distress)'],
  },
];

export const INITIAL_TRIAGE_ALERTS: TriageAlert[] = [
  {
    id: 'alert-01',
    patientId: 'patient-ramesh-01',
    token: '#102',
    patientName: 'Ramesh Kumar',
    severity: 'immediate',
    triggerTitle: 'Potential Clinical Red Flags Detected',
    signals: ['Chest pain', 'Arm radiation', 'Sweating', 'Breathlessness'],
    receivedTime: '10:38 AM',
    status: 'new',
  },
  {
    id: 'alert-02',
    patientId: 'patient-sita-02',
    token: '#103',
    patientName: 'Sita Devi',
    severity: 'high-priority',
    triggerTitle: 'Persistent High Fever Alert',
    signals: ['Fever 102°F', '3-day duration'],
    receivedTime: '10:41 AM',
    status: 'new',
  },
  {
    id: 'alert-03',
    patientId: 'patient-mohan-05',
    token: '#106',
    patientName: 'Mohan Singh',
    severity: 'immediate',
    triggerTitle: 'Exertional Dyspnea Red Flag',
    signals: ['Sudden dizziness', 'Exertional dyspnea'],
    receivedTime: '10:25 AM',
    status: 'acknowledged',
    acknowledgedBy: 'Nurse Priya',
    acknowledgedTime: '10:30 AM',
  },
];

interface NurseTriageContextType {
  patients: TriagePatient[];
  alerts: TriageAlert[];
  activePatientId: string;
  activePatient: TriagePatient;
  setActivePatientId: (id: string) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: string;
  setPriorityFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (filter: string) => void;
  unreviewedOnly: boolean;
  setUnreviewedOnly: (val: boolean) => void;

  // Actions
  addAlert: (alert: TriageAlert) => void;
  acknowledgeAlert: (alertId: string) => void;
  escalatePatient: (patientId: string) => void;
  sendToDoctor: (patientId: string) => void;
  markReviewed: (patientId: string) => void;
}

const NurseTriageContext = createContext<NurseTriageContextType | undefined>(undefined);

const getInitialAlerts = (): TriageAlert[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('medikiosk_triage_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse triage alerts from localStorage', e);
      }
    }
  }
  return INITIAL_TRIAGE_ALERTS;
};

export const NurseTriageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<TriagePatient[]>(INITIAL_TRIAGE_PATIENTS);
  const [alerts, setAlerts] = useState<TriageAlert[]>(getInitialAlerts);
  const [activePatientId, setActivePatientId] = useState<string>('patient-ramesh-01');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [unreviewedOnly, setUnreviewedOnly] = useState<boolean>(false);

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  // Sync alerts to localStorage and listen for real-time patient help requests
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('medikiosk_triage_alerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  React.useEffect(() => {
    const handleSyncAlerts = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('medikiosk_triage_alerts');
        if (saved) {
          try {
            setAlerts(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    window.addEventListener('medikiosk_new_alert', handleSyncAlerts);
    window.addEventListener('storage', handleSyncAlerts);

    return () => {
      window.removeEventListener('medikiosk_new_alert', handleSyncAlerts);
      window.removeEventListener('storage', handleSyncAlerts);
    };
  }, []);

  const addAlert = (newAlert: TriageAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'acknowledged',
              acknowledgedBy: 'Nurse Priya',
              acknowledgedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : a
      )
    );
  };

  const escalatePatient = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: 'escalated' } : p))
    );
    setAlerts((prev) =>
      prev.map((a) =>
        a.patientId === patientId
          ? {
              ...a,
              status: 'escalated',
              acknowledgedBy: 'Nurse Priya (Escalated)',
              acknowledgedTime: '10:44 AM',
            }
          : a
      )
    );
  };

  const sendToDoctor = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: 'ready-for-doctor' } : p))
    );
  };

  const markReviewed = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: 'under-review' } : p))
    );
  };

  return (
    <NurseTriageContext.Provider
      value={{
        patients,
        alerts,
        activePatientId,
        activePatient,
        setActivePatientId,
        searchQuery,
        setSearchQuery,
        priorityFilter,
        setPriorityFilter,
        statusFilter,
        setStatusFilter,
        departmentFilter,
        setDepartmentFilter,
        unreviewedOnly,
        setUnreviewedOnly,
        addAlert,
        acknowledgeAlert,
        escalatePatient,
        sendToDoctor,
        markReviewed,
      }}
    >
      {children}
    </NurseTriageContext.Provider>
  );
};

export const useNurseTriage = () => {
  const context = useContext(NurseTriageContext);
  if (!context) {
    throw new Error('useNurseTriage must be used within a NurseTriageProvider');
  }
  return context;
};
