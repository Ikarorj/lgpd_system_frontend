import axios, { AxiosInstance, AxiosError } from "axios";
import type { UploadSessionDTO, ComplianceReportDTO, UpdateViolationResponse } from "@shared/types/apiContracts.types";
import type { ExtractedFieldDTO as SharedExtractedFieldDTO } from "@shared/types/apiContracts.types";

export interface ExtractionListItem {
  extraction_id: string;
  artifact_id: string;
  artifact_filename: string;
  artifact_format: string;
  overall_confidence: number;
  flagged_count: number;
  completion_status: string;
  extraction_timestamp: string;
  extracted_by: string;
}

export interface ExtractionsListResponse {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  extractions: ExtractionListItem[];
}

export interface FlaggedFieldsResponse {
  extraction_id: string;
  artifact_id: string;
  flagged_count: number;
  flagged_fields: Array<{
    field_id: string;
    field_type: string;
    extracted_value: string;
    confidence_score: number;
    flag_reason: string;
    source_evidence: string;
    suggested_action?: string;
    human_override_available: boolean;
  }>;
}

export interface ExtractionResponse {
  extraction_id: string;
  artifact_id: string;
  artifact_filename?: string;
  extraction_timestamp: string;
  extraction_version: string;
  extracted_by: string;
  overall_confidence: number;
  completion_status: string;
  extraction_duration_ms?: number;
  flagged_count: number;
  human_override_count: number;
  extracted_fields: SharedExtractedFieldDTO[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const API_TIMEOUT = parseInt(
  import.meta.env.VITE_API_TIMEOUT_MS ?? "30000",
  10,
);

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: (() => void) | null): void {
  onUnauthorized = callback;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export async function loginUser(
  email: string,
  password: string,
): Promise<{ token: string; user: { id: string; email: string; name: string; role: string } }> {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data;
}

export async function registerUser(
  email: string,
  name: string,
  password: string,
): Promise<{ token: string; user: { id: string; email: string; name: string; role: string } }> {
  const response = await apiClient.post("/auth/register", {
    email,
    name,
    password,
  });
  return response.data;
}

export async function uploadFiles(
  files: File[],
  batchId?: string,
  retentionDays?: number,
  onProgress?: (percent: number) => void,
): Promise<UploadSessionDTO> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (batchId) formData.append("batch_id", batchId);
  if (retentionDays) formData.append("retention_days", String(retentionDays));

  const response = await apiClient.post("/artifacts/upload", formData, {
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        onProgress(
          Math.round((progressEvent.loaded * 100) / progressEvent.total),
        );
      }
    },
  });

  return response.data;
}

export async function getUploadStatus(
  uploadSessionId: string,
): Promise<UploadSessionDTO> {
  const response = await apiClient.get(`/artifacts/upload/${uploadSessionId}`);
  return response.data;
}

export async function getExtractionResult(
  extractionId: string,
): Promise<ExtractionResponse> {
  const response = await apiClient.get(`/extractions/${extractionId}`);
  return response.data;
}

export async function getExtractionByArtifact(
  artifactId: string,
): Promise<ExtractionResponse> {
  const response = await apiClient.get(
    `/extractions/by-artifact/${artifactId}`,
  );
  return response.data;
}

export async function getFlaggedFields(
  extractionId: string,
): Promise<FlaggedFieldsResponse> {
  const response = await apiClient.get(`/extractions/${extractionId}/flagged`);
  return response.data;
}

export async function getExtractionsList(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}): Promise<ExtractionsListResponse> {
  const response = await apiClient.get("/extractions", { params });
  return response.data;
}

export async function getComplianceReport(
  extractionId: string,
): Promise<ComplianceReportDTO> {
  const response = await apiClient.get(
    `/extractions/${extractionId}/compliance`,
  );
  return response.data;
}

export async function triggerComplianceCheck(
  extractionId: string,
): Promise<ComplianceReportDTO> {
  const response = await apiClient.post(
    `/extractions/${extractionId}/compliance/run`,
  );
  return response.data;
}

export async function generateOpinion(
  extractionId: string,
): Promise<Record<string, unknown>> {
  const response = await apiClient.post(`/extractions/${extractionId}/opinion`);
  return response.data;
}

export async function updateViolationStatus(
  violationId: string,
  status: string,
  notes?: string,
): Promise<UpdateViolationResponse> {
  const response = await apiClient.patch(
    `/compliance/violations/${violationId}`,
    {
      remediation_status: status,
      remediation_notes: notes,
    },
  );
  return response.data;
}

export default apiClient;
