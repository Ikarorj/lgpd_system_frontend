import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, AlertTriangle, FileText, Loader2, Shield } from "lucide-react";
import { useExtraction } from "../hooks/useExtraction";
import {
  fetchFlaggedFields,
  fetchComplianceReport,
  runComplianceCheck,
} from "../services/extractionService";
import { generateOpinion as apiGenerateOpinion } from "../services/apiService";
import ExtractionResults from "../components/ExtractionResults";
import FlaggedItemsReview from "../components/FlaggedItemsReview";
import ComplianceViolations from "../components/ComplianceViolations";
import OpinionView from "../components/OpinionView";

export default function AnalysisResultsPage() {
  const { extractionId } = useParams<{ extractionId: string }>();
  const navigate = useNavigate();

  const {
    data: extractionData,
    isLoading,
    isError,
    error,
  } = useExtraction(extractionId);

  const { data: complianceData, refetch: refetchCompliance } = useQuery({
    queryKey: ["compliance", extractionId],
    queryFn: () => fetchComplianceReport(extractionId!),
    enabled: !!extractionId,
    retry: false,
  });

  const { data: flaggedData } = useQuery({
    queryKey: ["flaggedFields", extractionId],
    queryFn: () => fetchFlaggedFields(extractionId!),
    enabled: !!extractionId,
  });

  const [opinionData, setOpinionData] = useState<Record<
    string,
    unknown
  > | null>(null);

  const opinionMutation = useMutation<Record<string, unknown>>({
    mutationFn: () => apiGenerateOpinion(extractionId!),
    onSuccess: (data) => setOpinionData(data),
  });

  const complianceMutation = useMutation({
    mutationFn: () => runComplianceCheck(extractionId!),
    onSuccess: () => refetchCompliance(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-4">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar resultados
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {(error as Error)?.message ??
              "Não foi possível carregar os resultados da extração."}
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const extraction = extractionData ?? null;
  const flagged = flaggedData ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Resultados da Extração
              </h1>
              {extraction?.artifact_filename && (
                <p className="text-sm text-gray-500">
                  {extraction.artifact_filename}
                </p>
              )}
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {extraction && (
          <>
            <ExtractionResults
              fields={extraction.extracted_fields.map((f) => ({
                field_id: f.field_id,
                field_type: f.field_type,
                extracted_value: f.extracted_value,
                confidence_score: f.confidence_score,
                is_flagged: f.is_flagged,
                flag_reason: f.flag_reason,
                source_evidence: f.source_evidence,
                requires_human_review: f.requires_human_review,
              }))}
              overallConfidence={extraction.overall_confidence}
              flaggedCount={extraction.flagged_count}
            />

            {!complianceData && extraction?.completion_status === "completed" && (
              <div className="mt-8 card p-6 text-center">
                <Shield className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Análise de Conformidade
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  A análise automática de conformidade pode não ter sido concluída.
                  Clique abaixo para executar manualmente.
                </p>
                <button
                  onClick={() => complianceMutation.mutate()}
                  disabled={complianceMutation.isPending}
                  className="btn-primary"
                >
                  {complianceMutation.isPending ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analisando...
                    </span>
                  ) : (
                    "Executar Análise de Conformidade"
                  )}
                </button>
                {complianceMutation.isError && (
                  <p className="text-sm text-danger-600 mt-3">
                    {(complianceMutation.error as Error).message}
                  </p>
                )}
              </div>
            )}

            {complianceData && (
              <div className="mt-8">
                <ComplianceViolations
                  report={
                    complianceData as import("../types/extraction.types").ComplianceReport
                  }
                  onRefresh={() => refetchCompliance()}
                />
              </div>
            )}

            {complianceData && extractionId && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Parecer LGPD
                  </h2>
                  <button
                    onClick={() => opinionMutation.mutate()}
                    disabled={opinionMutation.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    {opinionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {opinionMutation.isPending ? "Gerando..." : "Gerar Parecer"}
                  </button>
                </div>
                {opinionData && <OpinionView data={opinionData} />}
                {opinionMutation.isError && (
                  <div className="flex items-center gap-2 text-sm text-danger-700 bg-danger-50 rounded-lg px-4 py-3">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {opinionMutation.error?.message ?? "Erro ao gerar parecer"}
                  </div>
                )}
              </div>
            )}

            {extractionId && (
              <div className="mt-8">
                <FlaggedItemsReview
                  flaggedFields={(flagged?.flagged_fields ?? []).map((f) => ({
                    field_id: f.field_id,
                    field_type:
                      f.field_type as import("../types/extraction.types").FieldType,
                    extracted_value: f.extracted_value,
                    confidence_score: f.confidence_score,
                    flag_reason:
                      f.flag_reason as import("../types/extraction.types").FlagReason,
                    source_evidence: f.source_evidence,
                    suggested_action: f.suggested_action,
                    lgpd_reference: undefined,
                    human_override_available: f.human_override_available,
                  }))}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
