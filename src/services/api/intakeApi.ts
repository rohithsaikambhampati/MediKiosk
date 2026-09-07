import { httpClient, ApiResponse } from './httpClient';

export interface IntakeSessionDto {
  id: string;
  session_id: string;
  patient_id: string;
  kiosk_id: string;
  mode: 'STANDARD' | 'EASY' | 'ASSISTED';
  language: string;
  status: 'IN_PROGRESS' | 'PENDING_TRIAGE' | 'COMPLETED' | 'CANCELLED';
  chief_complaint?: string;
  vitals?: Record<string, any>;
  risk_score?: number;
  risk_level?: string;
}

export const IntakeApi = {
  async startIntake(data: {
    patient_id: string;
    kiosk_id?: string;
    mode?: 'STANDARD' | 'EASY' | 'ASSISTED';
    language?: string;
    chief_complaint?: string;
    vitals?: Record<string, any>;
  }): Promise<ApiResponse<IntakeSessionDto>> {
    return httpClient.post<IntakeSessionDto>('/intake/start', data);
  },

  async sendMessage(
    intakeId: string,
    content: string,
    language: string = 'en'
  ): Promise<ApiResponse<any>> {
    return httpClient.post<any>(`/conversations/${intakeId}/messages`, {
      content,
      language,
    });
  },

  async recordConsent(data: {
    intake_id: string;
    patient_id: string;
    consent_type: string;
    granted: boolean;
  }): Promise<ApiResponse<any>> {
    return httpClient.post<any>('/intake/consent', data);
  },

  async finalizeIntake(intakeId: string): Promise<ApiResponse<any>> {
    return httpClient.post<any>(`/intake/${intakeId}/finalize`);
  },
};
