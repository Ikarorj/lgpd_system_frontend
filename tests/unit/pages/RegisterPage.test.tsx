import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "../../../src/pages/RegisterPage";

const mockRegisterUser = vi.hoisted(() => vi.fn());
const mockLogin = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("../../../src/services/apiService", () => ({
  registerUser: mockRegisterUser,
}));

vi.mock("../../../src/contexts/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza formulário de cadastro", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Cadastro")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cadastrar" })).toBeInTheDocument();
  });

  it("renderiza link para login", () => {
    render(<RegisterPage />);
    const loginLink = screen.getByText("Entre aqui");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
  });

  it("mostra erro se senha tem menos de 6 caracteres", async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "João" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "joao@teste.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(
      screen.getByText("A senha deve ter no mínimo 6 caracteres"),
    ).toBeInTheDocument();

    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  it("cadastro bem-sucedido chama registerUser e navigate", async () => {
    mockRegisterUser.mockResolvedValue({
      token: "token-abc",
      user: { id: "1", email: "joao@teste.com", name: "João", role: "user" },
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "João Silva" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "joao@teste.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith(
        "joao@teste.com",
        "João Silva",
        "123456",
      );
      expect(mockLogin).toHaveBeenCalledWith("token-abc", {
        id: "1",
        email: "joao@teste.com",
        name: "João",
        role: "user",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("mostra erro quando cadastro falha", async () => {
    mockRegisterUser.mockRejectedValue({
      response: { data: { message: "Email já cadastrado" } },
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "João" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "joao@teste.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => {
      expect(screen.getByText("Email já cadastrado")).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("mostra mensagem genérica quando erro não tem resposta", async () => {
    mockRegisterUser.mockRejectedValue(new Error("Network error"));

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "João" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "joao@teste.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => {
      expect(
        screen.getByText("Erro ao cadastrar. Tente novamente."),
      ).toBeInTheDocument();
    });
  });

  it("desabilita botão durante loading", async () => {
    mockRegisterUser.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ token: "x", user: { id: "1", email: "a@b.com", name: "A", role: "user" } }), 100)),
    );

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "João" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "joao@teste.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(
      screen.getByRole("button", { name: "Cadastrando..." }),
    ).toBeDisabled();
  });
});
