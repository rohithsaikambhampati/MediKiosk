import { httpClient, ApiResponse } from './httpClient';
import { Patient } from '../../types/clinical';
import { PatientStory } from '../../types/story';

export interface BackendPatient {
  id: string;
  hospital_id: string;
  name: string;
  gender: string;
  age: number;
  phone?: string;
  preferred_language?: string;
  accessibility_mode?: boolean;
  abha_reference?: string;
  created_at?: string;
  updated_at?: string;
}

export const PatientApi = {
  async getPatients(query?: string): Promise<Patient[]> {
    const res = await httpClient.get<BackendPatient[]>('/patients', query ? { query } : undefined);
    if (res.success && Array.isArray(res.data)) {
      return res.data.map((bp) => ({
        id: bp.id,
        mrn: bp.hospital_id || bp.id,
        name: bp.name,
        age: bp.age || 0,
        gender: (bp.gender?.toLowerCase() as 'male' | 'female' | 'other') || 'other',
        preferredLanguage: bp.preferred_language || 'en',
        phone: bp.phone || '',
        photoUrl: '', // Could be fetched from a storage API later
        assignedDepartment: 'General',
        assignedDoctorId: '',
        assignedDoctorName: 'Unassigned',
        triagePriority: 'routine',
        intakeStatus: 'ready-for-review' as const,
        intakeProgress: 0,
        arrivalTime: bp.created_at ? new Date(bp.created_at).toLocaleTimeString() : 'Now',
        chiefComplaint: '',
        riskFlagsCount: 0,
        unverifiedFactsCount: 0,
        documentsUploadedCount: 0,
      }));
    }
    throw new Error(res.error?.message || 'Failed to fetch patients');
  },

  async getPatientById(id: string): Promise<Patient> {
    const res = await httpClient.get<BackendPatient>(`/patients/${id}`);
    if (res.success && res.data) {
      const bp = res.data;
      return {
        id: bp.id,
        mrn: bp.hospital_id || bp.id,
        name: bp.name,
        age: bp.age || 0,
        gender: (bp.gender?.toLowerCase() as 'male' | 'female' | 'other') || 'other',
        preferredLanguage: bp.preferred_language || 'en',
        phone: bp.phone || '',
        photoUrl: '',
        assignedDepartment: 'General',
        assignedDoctorId: '',
        assignedDoctorName: 'Unassigned',
        triagePriority: 'routine',
        intakeStatus: 'ready-for-review' as const,
        intakeProgress: 0,
        arrivalTime: bp.created_at ? new Date(bp.created_at).toLocaleTimeString() : 'Now',
        chiefComplaint: '',
        riskFlagsCount: 0,
        unverifiedFactsCount: 0,
        documentsUploadedCount: 0,
      };
    }
    throw new Error(res.error?.message || 'Failed to fetch patient');
  },

  async getPatientStory(patientId: string): Promise<PatientStory> {
    const res = await httpClient.get<PatientStory>(`/patients/${patientId}/story`);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error?.message || 'Failed to fetch patient story');
  },
};
