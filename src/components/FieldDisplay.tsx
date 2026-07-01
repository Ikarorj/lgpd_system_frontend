import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { ExtractedField } from "../types/extraction.types";

interface FieldDisplayProps {
  field: ExtractedField;
  showEvidence?: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  data_categories: "Categorias de Dados",
  legal_basis: "Base Legal",
  retention_period: "Período de Retenção",
  processing_purpose: "Finalidade do Tratamento",
  third_party_sharing: "Compartilhamento com Terceiros",
  data_subject_rights: "Direitos dos Titulares",
  storage_method: "Método de Armazenamento",
  encryption_status: "Status de Criptografia",
};

function getConfidenceColor(score: number): string {
  if (score >= 80) return "text-success-700 bg-success-50";
  if (score >= 50) return "text-warning-700 bg-warning-50";
  return "text-danger-700 bg-danger-50";
}

function getConfidenceIcon(score: number) {
  if (score >= 80) return <CheckCircle className="w-4 h-4" />;
  if (score >= 50) return <HelpCircle className="w-4 h-4" />;
  return <AlertTriangle className="w-4 h-4" />;
}

export default function FieldDisplay({
  field,
  showEvidence = true,
}: FieldDisplayProps) {
  return (
    <div
      className={`border rounded-lg p-4 ${
        field.is_flagged
          ? "border-danger-200 bg-danger-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">
          {FIELD_LABELS[field.field_type] ?? field.field_type}
        </h4>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(field.confidence_score)}`}
        >
          {getConfidenceIcon(field.confidence_score)}
          {field.confidence_score}%
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-2">{field.extracted_value}</p>

      {field.is_flagged && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-danger-700 bg-danger-50 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          {field.flag_reason === "low_confidence"
            ? "Baixa confiança"
            : field.flag_reason === "ambiguous"
              ? "Ambíguo"
              : field.flag_reason === "conflicting"
                ? "Conflitante"
                : "Revisão necessária"}
        </span>
      )}

      {showEvidence && field.source_evidence && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500 italic">
          &ldquo;{field.source_evidence}&rdquo;
        </div>
      )}

      {field.human_override && (
        <div className="mt-2 p-2 bg-success-50 rounded text-xs">
          <span className="font-medium text-success-700">Override:</span>{" "}
          {field.human_override.override_value}
        </div>
      )}
    </div>
  );
}
