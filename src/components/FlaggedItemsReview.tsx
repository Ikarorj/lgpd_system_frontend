import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { FlaggedField, FieldType } from "../types/extraction.types";

const FIELD_DISPLAY_NAMES: Record<FieldType, string> = {
  data_categories: "Categorias de Dados",
  legal_basis: "Base Legal",
  retention_period: "Período de Retenção",
  processing_purpose: "Finalidade do Tratamento",
  third_party_sharing: "Compartilhamento com Terceiros",
  data_subject_rights: "Direitos dos Titulares",
  storage_method: "Método de Armazenamento",
  encryption_status: "Status de Criptografia",
};

function getFieldDisplayName(fieldType: FieldType): string {
  return FIELD_DISPLAY_NAMES[fieldType] ?? fieldType;
}

interface FlaggedItemsReviewProps {
  flaggedFields: FlaggedField[];
}

export default function FlaggedItemsReview({
  flaggedFields,
}: FlaggedItemsReviewProps) {
  const [expandedField, setExpandedField] = useState<string | null>(null);

  if (flaggedFields.length === 0) {
    return (
      <div className="card border-success-200 bg-success-50">
        <p className="text-success-700 font-medium">
          Nenhum item sinalizado para revisão.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-danger-600" />
        <h3 className="text-lg font-medium text-gray-900">
          Itens Sinalizados para Revisão ({flaggedFields.length})
        </h3>
      </div>

      {flaggedFields.map((field) => (
        <div key={field.field_id} className="card border-danger-200">
          <button
            onClick={() =>
              setExpandedField(
                expandedField === field.field_id ? null : field.field_id,
              )
            }
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">
                {getFieldDisplayName(field.field_type)}
              </span>
              <span className="text-xs text-danger-600 font-medium bg-danger-50 px-2 py-0.5 rounded-full">
                {field.confidence_score}% confiança
              </span>
            </div>
            {expandedField === field.field_id ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <div className="mt-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Valor extraído:</span>{" "}
              {field.extracted_value}
            </p>
            <p className="text-xs text-gray-400 mt-1 italic">
              &ldquo;{field.source_evidence}&rdquo;
            </p>
            {field.suggested_action && (
              <p className="text-xs text-gray-500 mt-1">
                Sugestão: {field.suggested_action}
              </p>
            )}
            {field.lgpd_reference && field.lgpd_reference.length > 0 && (
              <p className="text-xs text-primary-600 mt-1">
                Referência LGPD: {field.lgpd_reference.join(", ")}
              </p>
            )}
          </div>

          {expandedField === field.field_id && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Entre em contato com o administrador para revisar este campo.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
