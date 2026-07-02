import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "../../../src/pages/LoginPage";

const mockLoginUser = vi.hoisted(() => vi.fn());
const mockLogin = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("../../../src/services/apiService", () => ({
  loginUser: mockLoginUser,
}));

vi.mock("../../../src/contexts/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza formulário de login", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("renderiza link para cadastro", () => {
    render(<LoginPage />);
    const registerLink = screen.getByText("Cadastre-se");
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
  });

  it("login bem-sucedido chama loginUser e navigate", async () => {
    mockLoginUser.mockResolvedValue({
      token: "token-abc",
      user: { id: "1", email: "joao@teste.com", name: "João", role: "user" },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "joao@teste.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith("joao@teste.com", "123456");
      expect(mockLogin).toHaveBeenCalledWith("token-abc", {
        id: "1",
        email: "joao@teste.com",
        name: "João",
        role: "user",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("mostra erro quando login falha", async () => {
    mockLoginUser.mockRejectedValue({
      response: { data: { message: "Credenciais inválidas" } },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "joao@teste.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(
        screen.getByText("Erro ao fazer login. Verifique suas credenciais."),
      ).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("mostra mensagem genérica quando erro não tem resposta", async () => {
    mockLoginUser.mockRejectedValue(new Error("Network error"));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "joao@teste.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(
        screen.getByText("Erro ao fazer login. Verifique suas credenciais."),
      ).toBeInTheDocument();
    });
  });

  it("desabilita botão durante loading", async () => {
    mockLoginUser.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ token: "x", user: { id: "1", email: "a@b.com", name: "A", role: "user" } }), 100)),
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "joao@teste.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByRole("button", { name: "Entrando..." })).toBeDisabled();
  });

  it("limpa erro ao tentar novo login", async () => {
    mockLoginUser.mockRejectedValueOnce({
      response: { data: { message: "Credenciais inválidas" } },
    });
    mockLoginUser.mockResolvedValueOnce({
      token: "token-abc",
      user: { id: "1", email: "joao@teste.com", name: "João", role: "user" },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "joao@teste.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(
        screen.getByText("Erro ao fazer login. Verifique suas credenciais."),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Erro ao fazer login. Verifique suas credenciais."),
      ).not.toBeInTheDocument();
    });
  });
});
