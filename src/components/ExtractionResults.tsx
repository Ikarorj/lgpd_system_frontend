import { ExtractedField } from "../types/extraction.types";
import FieldDisplay from "./FieldDisplay";

interface ExtractionResultsProps {
  fields: ExtractedField[];
  overallConfidence: number;
  flaggedCount: number;
}

export default function ExtractionResults({
  fields,
  overallConfidence,
  flaggedCount,
}: ExtractionResultsProps) {
  const nonFlaggedFields = fields.filter((f) => !f.is_flagged);
  const flaggedFields = fields.filter((f) => f.is_flagged);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">
            {overallConfidence}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Confiança Geral</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{fields.length}</p>
          <p className="text-sm text-gray-500 mt-1">Campos Extraídos</p>
        </div>
        <div className="card text-center">
          <p
            className={`text-3xl font-bold ${flaggedCount > 0 ? "text-danger-600" : "text-success-600"}`}
          >
            {flaggedCount}
          </p>
          <p className="text-sm text-gray-500 mt-1">Itens Sinalizados</p>
        </div>
      </div>

      {flaggedFields.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-danger-700 mb-3 flex items-center gap-2">
            Revisão Necessária ({flaggedFields.length})
          </h3>
          <div className="space-y-3">
            {flaggedFields.map((field) => (
              <FieldDisplay key={field.field_id} field={field} />
            ))}
          </div>
        </div>
      )}

      {nonFlaggedFields.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Campos Extraídos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nonFlaggedFields.map((field) => (
              <FieldDisplay key={field.field_id} field={field} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
