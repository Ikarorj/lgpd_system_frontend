import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import ProtectedRoute from "../../../src/components/ProtectedRoute";

const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock("../../../src/contexts/AuthContext", () => ({
  useAuth: mockUseAuth,
}));

function LocationDisplay() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("mostra spinner enquanto carrega", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Conteúdo protegido</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument();
  });

  it("renderiza children quando autenticado", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Conteúdo protegido</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Conteúdo protegido")).toBeInTheDocument();
  });

  it("redireciona para /login quando não autenticado", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <ProtectedRoute>
          <div>Conteúdo protegido</div>
        </ProtectedRoute>
        <LocationDisplay />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("location")).toHaveTextContent("/login");
  });
});
