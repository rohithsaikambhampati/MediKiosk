import { httpClient, ApiResponse } from './httpClient';

export interface FHIRBundleDto {
  resourceType: 'Bundle';
  type: string;
  id: string;
  timestamp: string;
  meta: Record<string, any>;
  entry: Array<{
    fullUrl: string;
    resource: Record<string, any>;
  }>;
  validation?: {
    is_valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface DemoSubmissionResultDto {
  status: string;
  mode: string;
  reference_id: string;
  message: string;
  timestamp: string;
  resource_count: number;
}

export const InteroperabilityApi = {
  async getPatientFHIRBundle(patientId: string, intakeId?: string): Promise<FHIRBundleDto> {
    const res = await httpClient.get<FHIRBundleDto>(
      `/patients/${patientId}/fhir`,
      intakeId ? { intake_id: intakeId } : undefined
    );
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to generate FHIR Bundle');
    }
    return res.data;
  },

  async getIntakeFHIRBundle(intakeId: string): Promise<FHIRBundleDto> {
    const res = await httpClient.get<FHIRBundleDto>(`/intakes/${intakeId}/fhir`);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to generate FHIR Bundle for intake');
    }
    return res.data;
  },

  async submitDemoInteroperability(patientId: string, bundle: any, intakeId?: string): Promise<DemoSubmissionResultDto> {
    const res = await httpClient.post<DemoSubmissionResultDto>(
      `/demo/interoperability/submit${intakeId ? `?intake_id=${intakeId}` : ''}`,
      {
        patient_id: patientId,
        bundle,
      }
    );
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to submit demo interoperability transaction');
    }
    return res.data;
  },
};
