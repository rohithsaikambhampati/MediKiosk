import { httpClient, ApiResponse } from './httpClient';

export interface VerificationRecordDto {
  id: string;
  target_type: 'FACT' | 'TIMELINE' | 'RISK' | 'MEDICATION' | 'ALLERGY';
  target_id: string;
  status: 'CONFIRMED' | 'REJECTED' | 'MODIFIED' | 'PROVISIONAL';
  previous_value?: string;
  verified_value?: string;
  confidence_before?: number;
  confidence_after: number;
  verified_by: string;
  notes?: string;
  created_at?: string;
}

export const VerificationApi = {
  async verifyEntity(data: {
    target_type: 'FACT' | 'TIMELINE' | 'RISK' | 'MEDICATION' | 'ALLERGY';
    target_id: string;
    status: 'CONFIRMED' | 'REJECTED' | 'MODIFIED' | 'PROVISIONAL';
    verified_value?: string;
    confidence_before?: number;
    confidence_after?: number;
    notes?: string;
  }): Promise<ApiResponse<VerificationRecordDto>> {
    return httpClient.post<VerificationRecordDto>('/verification', data);
  },

  async getVerifications(
    targetType: string,
    targetId: string
  ): Promise<ApiResponse<VerificationRecordDto[]>> {
    return httpClient.get<VerificationRecordDto[]>(`/verification/target/${targetType}/${targetId}`);
  },
};
