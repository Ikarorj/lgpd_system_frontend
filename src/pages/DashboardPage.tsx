import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Upload,
  FileText,
  BarChart3,
  Shield,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchExtractionsList } from "../services/extractionService";

const statusConfig: Record<
  string,
  { color: string; icon: typeof Clock; label: string }
> = {
  completed: {
    color: "text-success-600",
    icon: CheckCircle,
    label: "Concluída",
  },
  failed: { color: "text-danger-600", icon: AlertCircle, label: "Falhou" },
  processing: {
    color: "text-primary-600",
    icon: Loader2,
    label: "Processando",
  },
  needs_review: {
    color: "text-yellow-600",
    icon: AlertCircle,
    label: "Revisão necessária",
  },
};

function getStatusConfig(status: string) {
  return (
    statusConfig[status] ?? {
      color: "text-gray-400",
      icon: Clock,
      label: status,
    }
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: extractionsData, isLoading } = useQuery({
    queryKey: ["extractions", "recent"],
    queryFn: () => fetchExtractionsList({ page: 1, page_size: 5 }),
  });

  const extractions =
    (
      extractionsData as {
        extractions: Array<{
          extraction_id: string;
          artifact_filename: string;
          completion_status: string;
          extraction_timestamp: string;
          overall_confidence: number;
        }>;
      }
    )?.extractions ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Conformidade LGPD
              </h1>
              <p className="text-sm text-gray-500">
                Análise de artefatos para conformidade com a Lei Geral de
                Proteção de Dados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/upload")}
            className="card hover:shadow-md transition-shadow text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                <Upload className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Upload de Artefatos
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Envie documentos e código-fonte para análise de conformidade
                  LGPD
                </p>
                <span className="text-sm text-primary-600 font-medium mt-2 inline-block">
                  Acessar →
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              if (extractions.length > 0) {
                navigate(`/analysis/${extractions[0].extraction_id}`);
              }
            }}
            className={`card hover:shadow-md transition-shadow text-left group ${
              extractions.length === 0 ? "cursor-default" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium text-gray-900">
                  Extrações Recentes
                </h2>
                {isLoading ? (
                  <p className="text-sm text-gray-400 mt-1">Carregando...</p>
                ) : extractions.length > 0 ? (
                  <ul className="mt-2 space-y-1.5">
                    {extractions.map((ex) => {
                      const cfg = getStatusConfig(ex.completion_status);
                      const Icon = cfg.icon;
                      return (
                        <li
                          key={ex.extraction_id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Icon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              ex.completion_status === "processing"
                                ? "animate-spin"
                                : ""
                            } ${cfg.color}`}
                          />
                          <span className="text-gray-700 truncate">
                            {ex.artifact_filename}
                          </span>
                          <span
                            className={`text-xs ml-auto shrink-0 ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">
                    Nenhuma extração ainda
                  </p>
                )}
              </div>
            </div>
          </button>

          <div className="card opacity-50 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-400">
                  Relatórios
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Exporte relatórios de conformidade
                </p>
                <span className="text-sm text-gray-400 font-medium mt-2 inline-block">
                  Em breve
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
