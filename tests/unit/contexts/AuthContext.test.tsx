import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../../../src/contexts/AuthContext";

const mockSupabase = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "joao@teste.com",
          user_metadata: { name: "João Silva" },
        },
      },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
}));

vi.mock("../../../src/lib/supabaseClient", () => ({
  supabase: mockSupabase,
}));

function TestComponent() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="token">{user ? "has-user" : "null"}</div>
      <div data-testid="user-name">{user ? user.name : "null"}</div>
      <div data-testid="user-email">{user ? user.email : "null"}</div>
      <div data-testid="isLoading">{isLoading ? "true" : "false"}</div>
      <div data-testid="isAuthenticated">{isAuthenticated ? "true" : "false"}</div>
      <button
        data-testid="btn-login"
        onClick={() => login("joao@teste.com", "senha123")}
      >
        Login
      </button>
      <button data-testid="btn-logout" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>,
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("useAuth lança erro quando usado fora do AuthProvider", () => {
    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  it("estado inicial tem isLoading false e isAuthenticated false", async () => {
    renderWithProvider();

    await act(async () => {});

    expect(screen.getByTestId("isLoading")).toHaveTextContent("false");
    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("token")).toHaveTextContent("null");
    expect(screen.getByTestId("user-name")).toHaveTextContent("null");
  });

  it("login define user e isAuthenticated", async () => {
    renderWithProvider();

    await act(async () => {
      screen.getByTestId("btn-login").click();
    });

    expect(screen.getByTestId("user-name")).toHaveTextContent("João Silva");
    expect(screen.getByTestId("user-email")).toHaveTextContent("joao@teste.com");
    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("true");
  });

  it("login persiste token no localStorage", async () => {
    renderWithProvider();

    await act(async () => {
      screen.getByTestId("btn-login").click();
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "joao@teste.com",
      password: "senha123",
    });
  });

  it("logout limpa user e isAuthenticated", async () => {
    renderWithProvider();

    await act(async () => {
      screen.getByTestId("btn-login").click();
    });
    await act(async () => {
      screen.getByTestId("btn-logout").click();
    });

    expect(screen.getByTestId("token")).toHaveTextContent("null");
    expect(screen.getByTestId("user-name")).toHaveTextContent("null");
    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
  });

  it("logout chama signOut do Supabase", async () => {
    renderWithProvider();

    await act(async () => {
      screen.getByTestId("btn-login").click();
    });
    await act(async () => {
      screen.getByTestId("btn-logout").click();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});
