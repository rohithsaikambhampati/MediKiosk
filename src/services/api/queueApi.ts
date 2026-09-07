import { httpClient, ApiResponse } from './httpClient';

export interface QueueItemDto {
  id: string;
  ticket_number: string;
  patient_id: string;
  intake_id?: string;
  department_id?: string;
  doctor_id?: string;
  nurse_id?: string;
  priority: 'ROUTINE' | 'PRIORITY' | 'URGENT' | 'EMERGENCY';
  status: 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  position: number;
  desk_number?: string;
  room_number?: string;
  chief_complaint?: string;
  is_assisted: boolean;
  needs_assistance: boolean;
  created_at?: string;
}

export const QueueApi = {
  async getQueue(params?: {
    department_id?: string;
    doctor_id?: string;
    nurse_id?: string;
    status?: string;
  }): Promise<ApiResponse<QueueItemDto[]>> {
    return httpClient.get<QueueItemDto[]>('/queue', params);
  },

  async enqueuePatient(data: {
    patient_id: string;
    intake_session_id?: string;
    department_id?: string;
    priority?: string;
  }): Promise<ApiResponse<QueueItemDto>> {
    return httpClient.post<QueueItemDto>('/queue', data);
  },

  async requestAssistance(ticketOrId: string, needsAssistance: boolean = true): Promise<ApiResponse<QueueItemDto>> {
    return httpClient.post<QueueItemDto>(`/queue/${ticketOrId}/assist`, {
      needs_assistance: needsAssistance,
    });
  },

  async updateQueueItem(id: string, update: Partial<QueueItemDto>): Promise<ApiResponse<QueueItemDto>> {
    return httpClient.patch<QueueItemDto>(`/queue/${id}`, update);
  },

  async getAssistanceRequests(): Promise<ApiResponse<QueueItemDto[]>> {
    return httpClient.get<QueueItemDto[]>('/nurse/assist-requests');
  },
};
