import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import ExtractionResults from "../../../src/components/ExtractionResults";

const mockFields = [
  {
    field_id: "f1",
    field_type: "legal_basis" as const,
    extracted_value: "consentimento",
    confidence_score: 92,
    is_flagged: false,
    flag_reason: undefined,
    source_evidence: "Seção 4.2",
    requires_human_review: false,
  },
  {
    field_id: "f2",
    field_type: "retention_period" as const,
    extracted_value: "permanente",
    confidence_score: 35,
    is_flagged: true,
    flag_reason: "low_confidence" as const,
    source_evidence: "Seção 5",
    requires_human_review: true,
  },
];

describe("ExtractionResults", () => {
  it("should render fields", () => {
    render(
      <ExtractionResults
        fields={mockFields}
        overallConfidence={85}
        flaggedCount={1}
      />,
    );
    expect(screen.getByText("Base Legal")).toBeTruthy();
    expect(screen.getByText("consentimento")).toBeTruthy();
  });

  it("should highlight flagged fields", () => {
    render(
      <ExtractionResults
        fields={mockFields}
        overallConfidence={85}
        flaggedCount={1}
      />,
    );
    expect(screen.getByText("Período de Retenção")).toBeTruthy();
  });

  it("should show stats when no fields", () => {
    render(
      <ExtractionResults
        fields={[]}
        overallConfidence={0}
        flaggedCount={0}
      />,
    );
    expect(screen.getByText("Campos Extraídos")).toBeTruthy();
  });
});
