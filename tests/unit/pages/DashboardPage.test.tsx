import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../../../src/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "1", email: "test@test.com", name: "Teste", role: "compliance_officer" },
    logout: vi.fn(),
    isLoading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../../../src/services/extractionService", () => ({
  fetchExtractionsList: vi.fn().mockResolvedValue({
    page: 1,
    page_size: 5,
    total_count: 1,
    total_pages: 1,
    extractions: [
      {
        extraction_id: "ext-1",
        artifact_id: "art-1",
        artifact_filename: "test.pdf",
        artifact_format: "PDF",
        overall_confidence: 85,
        flagged_count: 1,
        completion_status: "completed",
        extraction_timestamp: new Date().toISOString(),
        extracted_by: "mock",
      },
    ],
  }),
}));

import DashboardPage from "../../../src/pages/DashboardPage";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dashboard title", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Sistema de Conformidade LGPD")).toBeTruthy();
  });

  it("should display user name", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/Teste/)).toBeTruthy();
  });

  it("should show extractions table", async () => {
    renderWithProviders(<DashboardPage />);
    await waitFor(() => expect(screen.getByText("test.pdf")).toBeTruthy());
  });

  it("should have upload button", () => {
    renderWithProviders(<DashboardPage />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
