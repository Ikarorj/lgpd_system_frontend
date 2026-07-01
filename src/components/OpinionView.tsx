import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Scale,
  AlertOctagon,
  BookOpen,
  Lightbulb,
  ListChecks,
} from "lucide-react";

interface OpinionData {
  resumo_executivo: string;
  pontuacao_completude: number;
  secoes_presentes: string[];
  secoes_ausentes: string[];
  pontos_fortes: string[];
  inferencias_lei: Array<{
    contexto: string;
    base_legal_provavel: string;
    artigo: string;
    ressalva: string;
  }>;
  nao_conformidades: Array<{
    violacao: string;
    artigo: string;
    risco: string;
  }>;
  recomendacoes: Array<{
    acao: string;
    prioridade: string;
  }>;
  riscos_legais: string[];
  analise_dados_pessoais: {
    categorias: string[];
    dados_sensiveis: string[];
    nivel_risco: string;
  };
}

const priorityColor: Record<string, string> = {
  alta: "text-danger-700 bg-danger-50 border-danger-200",
  media: "text-yellow-700 bg-yellow-50 border-yellow-200",
  baixa: "text-success-700 bg-success-50 border-success-200",
};

const riskColor: Record<string, string> = {
  alto: "text-danger-600",
  medio: "text-yellow-600",
  baixo: "text-success-600",
};

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-success-600"
      : score >= 50
        ? "text-yellow-600"
        : "text-danger-600";
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${score * 0.942} 100`}
            className={color}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}
        >
          {score}%
        </span>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Completude
        </p>
        <p className="text-sm text-gray-700">
          {score >= 80
            ? "Documento completo"
            : score >= 50
              ? "Documento parcial"
              : "Documento incompleto"}
        </p>
      </div>
    </div>
  );
}

function isOpinionData(data: unknown): data is OpinionData {
  if (typeof data !== "object" || data === null) return false;
  return typeof (data as OpinionData).resumo_executivo === "string";
}

export default function OpinionView({ data }: { data: unknown }) {
  if (!isOpinionData(data)) return null;
  const opinion = data;

  return (
    <div className="space-y-6">
      <div className="card bg-white">
        <div className="flex items-start gap-3 mb-4">
          <Shield className="w-6 h-6 text-primary-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900">Resumo Executivo</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {opinion.resumo_executivo}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-white">
          <ScoreGauge score={opinion.pontuacao_completude ?? 0} />
        </div>

        <div className="card bg-white">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <h3 className="font-medium text-gray-900">
              Estrutura do Documento
            </h3>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Seções Presentes
              </span>
              {opinion.secoes_presentes?.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {opinion.secoes_presentes.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-success-600 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 mt-1">
                  Nenhuma seção identificada
                </p>
              )}
            </div>
            {opinion.secoes_ausentes?.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Seções Ausentes
                </span>
                <ul className="mt-1 space-y-1">
                  {opinion.secoes_ausentes.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-danger-600 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-white">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-success-600" />
            <h3 className="font-medium text-gray-900">Pontos Fortes</h3>
          </div>
          <ul className="space-y-2">
            {opinion.pontos_fortes?.map((p, i) => (
              <li
                key={i}
                className="text-sm text-gray-600 flex items-start gap-2"
              >
                <span className="text-success-500 mt-0.5">•</span>
                {p}
              </li>
            )) ?? (
              <li className="text-sm text-gray-400">
                Nenhum ponto forte identificado
              </li>
            )}
          </ul>
        </div>

        <div className="card bg-white">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-danger-600" />
            <h3 className="font-medium text-gray-900">Não Conformidades</h3>
          </div>
          {opinion.nao_conformidades?.length > 0 ? (
            <ul className="space-y-3">
              {opinion.nao_conformidades.map((nc, i) => (
                <li
                  key={i}
                  className="text-sm border border-gray-100 rounded-lg p-3"
                >
                  <div className="font-medium text-gray-900">{nc.violacao}</div>
                  <div className="text-xs text-primary-600 mt-1">
                    {nc.artigo}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{nc.risco}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-success-600">
              Nenhuma não conformidade encontrada
            </p>
          )}
        </div>
      </div>

      {opinion.inferencias_lei?.length > 0 && (
        <div className="card bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h3 className="font-medium text-gray-900">
              Bases Legais Inferidas
            </h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            A IA identificou possíveis bases legais com base no contexto do
            documento.
            <strong> Recomenda-se validação por profissional jurídico.</strong>
          </p>
          <ul className="space-y-3">
            {opinion.inferencias_lei.map((inf, i) => (
              <li
                key={i}
                className="text-sm border border-yellow-100 bg-yellow-50/50 rounded-lg p-3"
              >
                <div className="font-medium text-gray-900">
                  Contexto: "{inf.contexto}"
                </div>
                <div className="text-primary-600 mt-1">
                  Base legal provável: {inf.base_legal_provavel} ({inf.artigo})
                </div>
                <div className="text-xs text-gray-500 mt-1 italic">
                  {inf.ressalva}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card bg-white">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="w-5 h-5 text-primary-600" />
          <h3 className="font-medium text-gray-900">Recomendações</h3>
        </div>
        {opinion.recomendacoes?.length > 0 ? (
          <ul className="space-y-2">
            {opinion.recomendacoes.map((r, i) => (
              <li
                key={i}
                className={`text-sm border rounded-lg px-4 py-3 ${
                  priorityColor[r.prioridade] ??
                  "text-gray-700 bg-gray-50 border-gray-200"
                }`}
              >
                <span className="font-medium">
                  [{r.prioridade.toUpperCase()}]
                </span>{" "}
                {r.acao}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">Nenhuma recomendação gerada</p>
        )}
      </div>

      <div className="card bg-white">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Riscos Legais</h3>
        </div>
        {opinion.riscos_legais?.length > 0 ? (
          <ul className="space-y-2">
            {opinion.riscos_legais.map((rl, i) => (
              <li
                key={i}
                className="text-sm text-gray-600 flex items-start gap-2"
              >
                <AlertOctagon className="w-4 h-4 text-danger-400 mt-0.5 shrink-0" />
                {rl}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">
            Nenhum risco legal identificado
          </p>
        )}
      </div>

      {opinion.analise_dados_pessoais && (
        <div className="card bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">
              Análise de Dados Pessoais
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Categorias
              </span>
              <ul className="mt-1 space-y-1">
                {opinion.analise_dados_pessoais.categorias?.map((c, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    {c}
                  </li>
                )) ?? <li className="text-sm text-gray-400">Nenhuma</li>}
              </ul>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Dados Sensíveis
              </span>
              <ul className="mt-1 space-y-1">
                {opinion.analise_dados_pessoais.dados_sensiveis?.map(
                  (ds, i) => (
                    <li key={i} className="text-sm text-danger-600">
                      {ds}
                    </li>
                  ),
                ) ?? <li className="text-sm text-gray-400">Nenhum</li>}
              </ul>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Nível de Risco
              </span>
              <p
                className={`mt-1 text-sm font-semibold ${riskColor[opinion.analise_dados_pessoais.nivel_risco] ?? "text-gray-600"}`}
              >
                {opinion.analise_dados_pessoais.nivel_risco?.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
