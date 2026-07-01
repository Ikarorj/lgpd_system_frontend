import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  Shield,
  ShieldOff,
  AlertCircle,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { changeViolationStatus } from "../services/extractionService";
import type {
  ComplianceReport,
  ComplianceViolation,
} from "../types/extraction.types";

interface ComplianceViolationsProps {
  report: ComplianceReport;
  onRefresh: () => void;
}

const severityConfig: Record<
  string,
  { color: string; bg: string; icon: typeof AlertTriangle; border: string }
> = {
  CRITICAL: {
    color: "text-danger-700",
    bg: "bg-danger-50",
    icon: ShieldOff,
    border: "border-danger-300",
  },
  HIGH: {
    color: "text-orange-700",
    bg: "bg-orange-50",
    icon: AlertTriangle,
    border: "border-orange-300",
  },
  MEDIUM: {
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    icon: AlertCircle,
    border: "border-yellow-300",
  },
  LOW: {
    color: "text-gray-600",
    bg: "bg-gray-50",
    icon: Info,
    border: "border-gray-200",
  },
};

const statusColors: Record<string, string> = {
  active: "bg-danger-100 text-danger-700",
  acknowledged: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-success-100 text-success-700",
};

const statusLabels: Record<string, string> = {
  active: "Ativa",
  acknowledged: "Reconhecida",
  in_progress: "Em correção",
  resolved: "Resolvida",
};

function ViolationCard({
  violation,
  onRefresh,
}: {
  violation: ComplianceViolation;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(violation.remediation_notes ?? "");

  const config = severityConfig[violation.severity] ?? severityConfig.LOW;
  const SeverityIcon = config.icon;

  const updateMutation = useMutation({
    mutationFn: (newStatus: string) =>
      changeViolationStatus(violation.id, newStatus, notes || undefined),
    onSuccess: () => onRefresh(),
  });

  return (
    <div
      className={`border rounded-lg ${config.border} ${config.bg} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <SeverityIcon className={`w-5 h-5 ${config.color}`} />
          <div>
            <p className={`font-medium ${config.color}`}>
              {violation.lgpd_article} —{" "}
              {formatViolationType(violation.violation_type)}
            </p>
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${statusColors[violation.remediation_status] ?? "bg-gray-100 text-gray-600"}`}
            >
              {statusLabels[violation.remediation_status] ??
                violation.remediation_status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${config.color} ${config.bg} border ${config.border}`}
          >
            {violation.severity}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-inherit pt-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Valor extraído
            </p>
            <p className="text-sm text-gray-700 mt-0.5">
              {violation.extracted_value ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Orientação de remediação
            </p>
            <p className="text-sm text-gray-700 mt-0.5">
              {violation.remediation_guidance}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Notas do revisor
            </p>
            <textarea
              className="input mt-0.5 text-sm"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicionar notas sobre a remediação..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["acknowledged", "in_progress", "resolved"].map((status) => (
              <button
                key={status}
                onClick={() => updateMutation.mutate(status)}
                disabled={
                  updateMutation.isPending ||
                  violation.remediation_status === status
                }
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  violation.remediation_status === status
                    ? "bg-primary-100 text-primary-700 border-primary-300 cursor-default"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                } disabled:opacity-50`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatViolationType(type: string): string {
  const labels: Record<string, string> = {
    missing_legal_basis: "Base legal ausente",
    missing_retention_period: "Período de retenção ausente",
    missing_data_subject_rights: "Direitos dos titulares ausentes",
    insufficient_security: "Segurança insuficiente",
    unsafe_third_party_sharing: "Compartilhamento inseguro",
    sensitive_data_without_consent: "Dados sensíveis sem consentimento",
    missing_dpo_contact: "Contato do DPO ausente",
    unsafe_international_transfer: "Transferência internacional insegura",
  };
  return labels[type] ?? type;
}

export default function ComplianceViolations({
  report,
  onRefresh,
}: ComplianceViolationsProps) {
  const bySeverity = report.violations_by_severity;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-600" />
          Compliance LGPD
        </h2>
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${
            report.compliance_status === "COMPLIANT"
              ? "bg-success-100 text-success-700"
              : report.compliance_status === "PARTIALLY_COMPLIANT"
                ? "bg-yellow-100 text-yellow-700"
                : report.compliance_status === "NON_COMPLIANT"
                  ? "bg-danger-100 text-danger-700"
                  : "bg-gray-100 text-gray-600"
          }`}
        >
          {report.compliance_status === "COMPLIANT"
            ? "Conforme"
            : report.compliance_status === "PARTIALLY_COMPLIANT"
              ? "Parcialmente Conforme"
              : report.compliance_status === "NON_COMPLIANT"
                ? "Não Conforme"
                : "Dados Insuficientes"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center p-3">
          <p className="text-2xl font-bold text-gray-900">
            {report.compliance_score}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Score de Compliance</p>
        </div>
        <div className="card text-center p-3">
          <p className="text-2xl font-bold text-danger-600">
            {bySeverity.CRITICAL ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Críticas</p>
        </div>
        <div className="card text-center p-3">
          <p className="text-2xl font-bold text-orange-600">
            {bySeverity.HIGH ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Altas</p>
        </div>
        <div className="card text-center p-3">
          <p className="text-2xl font-bold text-yellow-600">
            {(bySeverity.MEDIUM ?? 0) + (bySeverity.LOW ?? 0)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Médias/Baixas</p>
        </div>
      </div>

      {report.articles_checked.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-500 mr-1">
            Artigos verificados:
          </span>
          {report.articles_checked.map((article: string) => (
            <span
              key={article}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
            >
              {article}
            </span>
          ))}
        </div>
      )}

      {report.violations.length > 0 ? (
        <div className="space-y-2">
          {report.violations.map((violation) => (
            <ViolationCard
              key={violation.id}
              violation={violation}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-8">
          <CheckCircle className="w-10 h-10 text-success-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Nenhuma violação detectada</p>
        </div>
      )}
    </div>
  );
}
