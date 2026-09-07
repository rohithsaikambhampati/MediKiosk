import { httpClient, ApiResponse } from './httpClient';

export interface ConsentRecordDto {
  id: string;
  patient_id: string;
  intake_id?: string;
  purpose: string;
  scope: string[];
  status: 'GRANTED' | 'WITHDRAWN' | 'EXPIRED' | 'PENDING';
  granted_at: string;
  withdrawn_at?: string;
  expires_at?: string;
  language: string;
  consent_method: string;
  consent_text_version: string;
  metadata?: Record<string, any>;
}

export const ConsentApi = {
  async createConsent(data: {
    patient_id: string;
    intake_id?: string;
    purpose?: string;
    scope?: string[];
    language?: string;
    consent_method?: string;
    consent_text_version?: string;
    metadata?: Record<string, any>;
  }): Promise<ConsentRecordDto> {
    const res = await httpClient.post<ConsentRecordDto>('/consents', data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to record consent');
    }
    return res.data;
  },

  async getPatientConsents(patientId: string): Promise<ConsentRecordDto[]> {
    const res = await httpClient.get<ConsentRecordDto[]>(`/patients/${patientId}/consents`);
    if (!res.success || !res.data) {
      return [];
    }
    return res.data;
  },

  async withdrawConsent(consentId: string, reason?: string): Promise<ConsentRecordDto> {
    const res = await httpClient.post<ConsentRecordDto>(`/consents/${consentId}/withdraw`, {
      reason: reason || 'Patient requested withdrawal',
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to withdraw consent');
    }
    return res.data;
  },
};
