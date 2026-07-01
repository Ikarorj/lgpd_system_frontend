import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, AlertTriangle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      const supabaseErr = err as { message?: string };
      setError(
        supabaseErr?.message ?? "Email ou senha inválidos. Verifique suas credenciais.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card max-w-sm w-full p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Entrar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Faça login no sistema LGPD
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
              autoFocus
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
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Não tem conta?{" "}
          <Link
            to="/register"
            className="text-primary-600 hover:underline font-medium"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
