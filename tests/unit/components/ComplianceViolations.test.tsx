import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ComplianceViolations from "../../../src/components/ComplianceViolations";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const mockReport = {
  id: "r1",
  extraction_result_id: "ext-1",
  compliance_score: 45,
  compliance_status: "NON_COMPLIANT" as const,
  total_violations: 2,
  violations_by_severity: { CRITICAL: 1, HIGH: 1 },
  articles_checked: ["Art. 7", "Art. 6"],
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  violations: [
    {
      id: "v1",
      extraction_result_id: "ext-1",
      violation_type: "missing_legal_basis" as const,
      lgpd_article: "Art. 7",
      severity: "CRITICAL" as const,
      violation_category: "omission" as const,
      affected_field_type: null,
      extracted_value: "não declarado",
      remediation_guidance: "Adicionar base legal",
      remediation_status: "active" as const,
      remediation_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "v2",
      extraction_result_id: "ext-1",
      violation_type: "missing_retention_period" as const,
      lgpd_article: "Art. 6",
      severity: "HIGH" as const,
      violation_category: "omission" as const,
      affected_field_type: null,
      extracted_value: "permanente",
      remediation_guidance: "Definir período",
      remediation_status: "resolved" as const,
      remediation_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    },
  ],
  previous_report_id: null,
};

describe("ComplianceViolations", () => {
  it("should render violations list", () => {
    renderWithProviders(
      <ComplianceViolations report={mockReport} onRefresh={vi.fn()} />,
    );
    expect(screen.getByText(/Base legal ausente/i)).toBeTruthy();
    expect(screen.getAllByText(/Art. 7/i).length).toBeGreaterThan(0);
  });

  it("should display compliance score and status", () => {
    renderWithProviders(
      <ComplianceViolations report={mockReport} onRefresh={vi.fn()} />,
    );
    expect(screen.getByText("45%")).toBeTruthy();
    expect(screen.getByText("Não Conforme")).toBeTruthy();
  });

  it("should render empty state", () => {
    const compliantReport = {
      ...mockReport,
      compliance_score: 100,
      compliance_status: "COMPLIANT" as const,
      total_violations: 0,
      violations_by_severity: {},
      violations: [],
    };
    renderWithProviders(
      <ComplianceViolations report={compliantReport} onRefresh={vi.fn()} />,
    );
    expect(screen.getByText("Nenhuma violação detectada")).toBeTruthy();
  });
});
