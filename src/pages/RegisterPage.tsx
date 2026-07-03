import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, AlertTriangle } from "lucide-react";
import { registerUser } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("A senha deve conter pelo menos uma letra maiúscula");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("A senha deve conter pelo menos uma letra minúscula");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("A senha deve conter pelo menos um número");
      return;
    }

    setLoading(true);

    try {
      const { token, user } = await registerUser(email, name, password);
      login(token, user);
      navigate("/");
    } catch {
      setError("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card max-w-sm w-full p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Cadastro</h1>
          <p className="text-sm text-gray-500 mt-1">
            Crie sua conta no sistema LGPD
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-danger-700 bg-danger-50 rounded-lg px-3 py-2 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              type="text"
              className="input"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Mínimo 8 caracteres, maiúscula, minúscula e número"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="text-xs text-gray-400 mt-1">
              Mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número
            </p>
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Já tem conta?{" "}
          <Link
            to="/login"
            className="text-primary-600 hover:underline font-medium"
          >
            Entre aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
