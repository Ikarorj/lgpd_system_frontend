import type {
  ExtractionStatus,
  FieldType,
  FlagReason,
  ViolationType,
  ViolationSeverity,
  ComplianceStatus,
  HumanOverrideDTO,
  ComplianceViolationDTO,
  ComplianceReportDTO,
} from "@shared/types/apiContracts.types";

export type {
  ExtractionStatus,
  FieldType,
  FlagReason,
  ViolationType,
  ViolationSeverity,
  ComplianceStatus,
};
export type HumanOverride = HumanOverrideDTO;
export type ComplianceViolation = ComplianceViolationDTO;
export type ComplianceReport = ComplianceReportDTO;

export interface ExtractionResult {
  id: string;
  artifact_id: string;
  artifact_filename: string;
  extraction_timestamp: string;
  extraction_version: string;
  extracted_by: string;
  overall_confidence: number;
  completion_status: ExtractionStatus;
  extraction_duration_ms: number;
  flagged_count: number;
  human_override_count: number;
  extracted_fields: ExtractedField[];
}

export interface ExtractedField {
  field_id: string;
  field_type: FieldType;
  extracted_value: string;
  confidence_score: number;
  is_flagged: boolean;
  flag_reason?: FlagReason;
  source_evidence: string;
  requires_human_review: boolean;
  human_override?: HumanOverride;
}

export interface FlaggedField {
  field_id: string;
  field_type: FieldType;
  extracted_value: string;
  confidence_score: number;
  flag_reason: FlagReason;
  source_evidence: string;
  suggested_action?: string;
  lgpd_reference?: string[];
  human_override_available: boolean;
}
