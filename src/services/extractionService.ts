import {
  getExtractionResult,
  getExtractionsList,
  getFlaggedFields,
  getComplianceReport,
  triggerComplianceCheck,
  updateViolationStatus,
} from "./apiService";
import type {
  ExtractionsListResponse,
  FlaggedFieldsResponse,
  ExtractionResponse,
} from "./apiService";
import type { ComplianceReportDTO, UpdateViolationResponse } from "@shared/types/apiContracts.types";

export async function fetchExtractionsList(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}): Promise<ExtractionsListResponse> {
  return getExtractionsList(params);
}

export async function fetchExtractionResult(
  extractionId: string,
): Promise<ExtractionResponse> {
  return getExtractionResult(extractionId);
}

export async function fetchFlaggedFields(
  extractionId: string,
): Promise<FlaggedFieldsResponse> {
  return getFlaggedFields(extractionId);
}

export async function fetchComplianceReport(
  extractionId: string,
): Promise<ComplianceReportDTO> {
  return getComplianceReport(extractionId);
}

export async function runComplianceCheck(
  extractionId: string,
): Promise<ComplianceReportDTO> {
  return triggerComplianceCheck(extractionId);
}

export async function changeViolationStatus(
  violationId: string,
  status: string,
  notes?: string,
): Promise<UpdateViolationResponse> {
  return updateViolationStatus(violationId, status, notes);
}
