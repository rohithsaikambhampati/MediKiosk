import { PatientApi } from './patientApi';

export async function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const PatientService = {
  async getPatients() {
    return await PatientApi.getPatients();
  },
  async getPatientById(id: string) {
    return await PatientApi.getPatientById(id);
  },
  async getPatientStory(patientId: string) {
    return await PatientApi.getPatientStory(patientId);
  },
};

export const DoctorService = {
  async getDoctors() {
    // Left empty for now or could connect to a real API in future
    return [];
  },
  async getDepartments() {
    return [];
  },
};

export const DocumentService = {
  async getDocuments(patientId: string) {
    const { DocumentApi } = await import('./documentApi');
    return await DocumentApi.getPatientDocuments(patientId);
  },
  async uploadDocument(file: File, patientId: string = 'patient-ramesh-01') {
    const { DocumentApi } = await import('./documentApi');
    const doc = await DocumentApi.uploadDocument(file, patientId);
    return {
      id: doc.id,
      patientId: doc.patient_id,
      fileName: doc.file_name,
      fileSize: `${(doc.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`,
      fileType: doc.mime_type,
      documentType: doc.document_type.toLowerCase() as any,
      uploadDate: new Date(doc.created_at).toLocaleDateString(),
      status: (doc.processing_status === 'PROCESSED' ? 'completed' : 'ai-extracting') as any,
      extractedFactsCount: doc.extracted_facts_count,
      confidence: 'high' as const,
      url: doc.file_url,
    };
  },
};

export * from './httpClient';
export * from './authApi';
export * from './patientApi';
export * from './queueApi';
export * from './intakeApi';
export * from './verificationApi';
export * from './documentApi';
export * from './consentApi';
export * from './handoffApi';
export * from './interoperabilityApi';
