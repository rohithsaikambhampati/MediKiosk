import { httpClient, ApiResponse } from './httpClient';

export interface BackendDocumentEntity {
  id: string;
  document_id: string;
  entity_type: string;
  name: string;
  value?: string;
  unit?: string;
  reference_range?: string;
  is_abnormal?: boolean;
  abnormal_flag?: string;
  raw_text?: string;
  page_number?: number;
  block_id?: string;
  confidence_score?: number;
  extracted_at?: string;
}

export interface BackendTimelineEvent {
  id: string;
  patient_id: string;
  document_id?: string;
  event_type: string;
  title: string;
  description?: string;
  event_date: string;
  source_type: string;
  confidence_score?: number;
  created_at?: string;
}

export interface BackendDocumentStatus {
  id: string;
  processing_status: string;
  ocr_status: string;
  progress_percent: number;
  error_message?: string;
  extracted_facts_count: number;
}

export interface BackendMedicalDocument {
  id: string;
  patient_id: string;
  file_name: string;
  file_path?: string;
  storage_path?: string;
  file_url?: string;
  document_type: string;
  mime_type: string;
  file_size_bytes: number;
  processing_status: string;
  ocr_status: string;
  extracted_facts_count: number;
  document_date?: string;
  quality_score?: number;
  quality_assessment?: string;
  error_message?: string;
  created_at: string;
}

export const DocumentApi = {
  async uploadDocument(
    file: File,
    patientId: string,
    documentType?: string,
    autoProcess: boolean = true
  ): Promise<BackendMedicalDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', patientId);
    if (documentType) {
      formData.append('document_type', documentType);
    }
    formData.append('auto_process', String(autoProcess));

    const res = await httpClient.upload<BackendMedicalDocument>('/documents/upload', formData);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to upload document');
    }
    return res.data;
  },

  async getDocument(documentId: string): Promise<BackendMedicalDocument> {
    const res = await httpClient.get<BackendMedicalDocument>(`/documents/${documentId}`);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to fetch document');
    }
    return res.data;
  },

  async getDocumentStatus(documentId: string): Promise<BackendDocumentStatus> {
    const res = await httpClient.get<BackendDocumentStatus>(`/documents/${documentId}/status`);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to fetch document status');
    }
    return res.data;
  },

  async getDocumentEntities(documentId: string): Promise<BackendDocumentEntity[]> {
    const res = await httpClient.get<BackendDocumentEntity[]>(`/documents/${documentId}/entities`);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to fetch document entities');
    }
    return res.data;
  },

  async getPatientDocuments(patientId: string): Promise<BackendMedicalDocument[]> {
    const res = await httpClient.get<BackendMedicalDocument[]>(`/documents/patient/${patientId}`);
    if (!res.success || !res.data) {
      return [];
    }
    return res.data;
  },

  async getPatientTimeline(patientId: string): Promise<BackendTimelineEvent[]> {
    const res = await httpClient.get<BackendTimelineEvent[]>(`/documents/patient/${patientId}/timeline`);
    if (!res.success || !res.data) {
      return [];
    }
    return res.data;
  },

  async retryDocument(documentId: string): Promise<BackendMedicalDocument> {
    const res = await httpClient.post<BackendMedicalDocument>(`/documents/${documentId}/retry`);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to retry document processing');
    }
    return res.data;
  },

  async seedDemoDocuments(patientId: string): Promise<BackendMedicalDocument[]> {
    const formData = new FormData();
    formData.append('patient_id', patientId);
    const res = await httpClient.post<BackendMedicalDocument[]>('/documents/demo/seed', formData);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to seed synthetic demo documents');
    }
    return res.data;
  },

  getDocumentDownloadUrl(documentId: string): string {
    const baseUrl = ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:8000/api/v1';
    return `${baseUrl}/documents/${documentId}/file`;
  }
};
