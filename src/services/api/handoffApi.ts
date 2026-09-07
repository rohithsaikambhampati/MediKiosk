import { httpClient, ApiResponse } from './httpClient';

export interface HandoffRecordDto {
  id: string;
  patient_id: string;
  intake_id: string;
  priority: 'ROUTINE' | 'REVIEW_REQUIRED' | 'HIGH_PRIORITY_REVIEW';
  status: 'READY' | 'TRIAGE_REQUIRED' | 'ASSIGNED' | 'IN_REVIEW' | 'CONSULTATION_STARTED' | 'COMPLETED';
  assigned_to?: string;
  review_notes?: string;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}

export const HandoffApi = {
  async createHandoff(intakeId: string, data: {
    patient_id: string;
    priority?: string;
    status?: string;
    assigned_to?: string;
    review_notes?: string;
  }): Promise<HandoffRecordDto> {
    const res = await httpClient.post<HandoffRecordDto>(`/intakes/${intakeId}/handoff`, {
      intake_id: intakeId,
      ...data,
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to create clinical handoff');
    }
    return res.data;
  },

  async getHandoff(intakeId: string): Promise<HandoffRecordDto | null> {
    const res = await httpClient.get<HandoffRecordDto>(`/intakes/${intakeId}/handoff`);
    if (!res.success || !res.data) {
      return null;
    }
    return res.data;
  },

  async assignHandoff(handoffId: string, assignedTo: string, notes?: string): Promise<HandoffRecordDto> {
    const res = await httpClient.post<HandoffRecordDto>(`/handoffs/${handoffId}/assign`, {
      assigned_to: assignedTo,
      notes,
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to assign handoff');
    }
    return res.data;
  },

  async reviewHandoff(handoffId: string, data: {
    status: string;
    priority?: string;
    review_notes?: string;
    reviewer_id?: string;
  }): Promise<HandoffRecordDto> {
    const res = await httpClient.post<HandoffRecordDto>(`/handoffs/${handoffId}/review`, data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to review handoff');
    }
    return res.data;
  },
};
