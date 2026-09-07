import { ConfidenceLevel } from './clinical';

export type DocumentType = 'prescription' | 'lab-report' | 'discharge-summary' | 'imaging' | 'doctor-note' | 'other';

export type ProcessingStatus = 'uploading' | 'queued' | 'ocr-processing' | 'ai-extracting' | 'completed' | 'failed';

export interface MedicalDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileSize: string;
  fileType: string; // e.g. 'application/pdf', 'image/jpeg'
  documentType: DocumentType;
  uploadDate: string;
  documentDate?: string;
  status: ProcessingStatus;
  extractedFactsCount: number;
  confidence: ConfidenceLevel;
  previewUrl?: string;
  ocrText?: string;
  extractedSummary?: string;
  processingProgress?: number; // 0-100%
}
