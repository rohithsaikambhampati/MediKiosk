import { httpClient, ApiResponse } from './httpClient';

export interface StartConversationResponseDto {
  conversation_id: string;
  intake_id: string;
  patient_id: string;
  status: string;
  current_topic: string;
  current_question: string;
  is_completed: boolean;
  facts_count: number;
  red_flags: Array<{
    rule_id: string;
    category: string;
    severity: string;
    message: string;
    requires_clinician_review: boolean;
  }>;
  conflicts: Array<{
    conflict_id: string;
    title: string;
    description: string;
    itemA: string;
    itemB: string;
    severity: string;
    requires_doctor_decision: boolean;
  }>;
}

export interface ProcessTurnResponseDto {
  conversation_id: string;
  patient_message: {
    id: string;
    content: string;
    timestamp: string;
  };
  assistant_message: {
    id: string;
    content: string;
    topic: string;
    timestamp: string;
  };
  next_topic: string;
  next_question: string;
  is_completed: boolean;
  new_facts: Array<{
    id: string;
    category?: string;
    field?: string;
    value: string;
    normalized_value?: string;
    confidence: number;
    verification_status: string;
  }>;
  total_facts_count: number;
  red_flags: Array<{
    rule_id: string;
    category: string;
    severity: string;
    message: string;
    requires_clinician_review: boolean;
  }>;
  conflicts: Array<{
    conflict_id: string;
    title: string;
    description: string;
    itemA: string;
    itemB: string;
    severity: string;
    requires_doctor_decision: boolean;
  }>;
}

export const ConversationApi = {
  async startConversation(data: {
    intake_id: string;
    language?: string;
    accessibility_mode?: string;
  }): Promise<ApiResponse<StartConversationResponseDto>> {
    return httpClient.post<StartConversationResponseDto>('/conversations/start', data);
  },

  async processTurn(
    conversationId: string,
    content: string,
    language: string = 'en',
    source: string = 'TEXT'
  ): Promise<ApiResponse<ProcessTurnResponseDto>> {
    return httpClient.post<ProcessTurnResponseDto>(`/conversations/${conversationId}/message`, {
      content,
      language,
      source,
    });
  },

  async getConversationState(conversationId: string): Promise<ApiResponse<any>> {
    return httpClient.get<any>(`/conversations/${conversationId}/state`);
  },

  async getConversationFacts(conversationId: string): Promise<ApiResponse<any[]>> {
    return httpClient.get<any[]>(`/conversations/${conversationId}/facts`);
  },

  async confirmFacts(conversationId: string, confirmedFactIds?: string[]): Promise<ApiResponse<any>> {
    return httpClient.post<any>(`/conversations/${conversationId}/confirm`, {
      confirmed_fact_ids: confirmedFactIds,
    });
  },

  async getConversationStory(conversationId: string): Promise<ApiResponse<any>> {
    return httpClient.get<any>(`/conversations/${conversationId}/story`);
  },
};
