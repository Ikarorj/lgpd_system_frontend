import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileUp, CheckCircle } from "lucide-react";
import UploadZone from "../components/UploadZone";
import ProgressTracker from "../components/ProgressTracker";
import UploadError from "../components/UploadError";
import { useUpload } from "../hooks/useUpload";
import { getExtractionByArtifact } from "../services/apiService";

export default function UploadFlowPage() {
  const navigate = useNavigate();
  const [resolvedExtractionId, setResolvedExtractionId] = useState<
    string | null
  >(null);
  const {
    files,
    isUploading,
    overallProgress,
    error,
    sessionId,
    isCompleted,
    fileIds,
    addFiles,
    startUpload,
    reset,
  } = useUpload();

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    async function pollExtraction() {
      while (attempt < 10 && !cancelled) {
        try {
          const data = await getExtractionByArtifact(fileIds[0]);
          if (!cancelled) setResolvedExtractionId(data.extraction_id);
          return;
        } catch {
          attempt++;
          if (attempt >= 10) break;
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }

    if (isCompleted && fileIds.length > 0 && !resolvedExtractionId) {
      pollExtraction();
    }

    return () => { cancelled = true; };
  }, [isCompleted, fileIds, resolvedExtractionId]);

  useEffect(() => {
    if (resolvedExtractionId) {
      const timer = setTimeout(() => {
        navigate(`/analysis/${resolvedExtractionId}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [resolvedExtractionId, navigate]);

  const handleFilesSelected = (newFiles: File[]) => {
    addFiles(newFiles);
  };

  const handleStartUpload = () => {
    startUpload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Upload de Artefatos
            </h1>
            <p className="text-sm text-gray-500">
              Envie documentos e código-fonte para análise de conformidade LGPD
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <UploadZone
            onFilesSelected={handleFilesSelected}
            disabled={isUploading}
          />

          {files.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Arquivos Selecionados ({files.length})
              </h2>
              <ProgressTracker files={files} />
            </div>
          )}

          {error && (
            <UploadError message={error} onRetry={reset} onDismiss={reset} />
          )}

          {files.length > 0 && !isUploading && !sessionId && (
            <div className="flex gap-3">
              <button onClick={handleStartUpload} className="btn-primary">
                <Upload className="w-4 h-4 mr-2" />
                Iniciar Upload
              </button>
              <button onClick={reset} className="btn-secondary">
                Limpar
              </button>
            </div>
          )}

          {isUploading && (
            <div className="card border-primary-200 bg-primary-50">
              <div className="flex items-center gap-3">
                <FileUp className="w-5 h-5 text-primary-600 animate-bounce" />
                <p className="text-primary-700 font-medium">
                  Enviando arquivos... {overallProgress}%
                </p>
              </div>
            </div>
          )}

          {sessionId && !isUploading && !error && (
            <div className="card border-success-200 bg-success-50 text-center py-8">
              <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-success-700 mb-2">
                Upload e Extração Concluídos!
              </h2>
              <p className="text-success-600 mb-2">
                {fileIds.length} arquivo(s) enviado(s) e analisado(s) com
                sucesso.
              </p>
              <p className="text-sm text-success-500">
                Redirecionando para os resultados...
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <button onClick={() => navigate("/")} className="btn-secondary">
                  Voltar ao Dashboard
                </button>
                {resolvedExtractionId && (
                  <button
                    onClick={() =>
                      navigate(`/analysis/${resolvedExtractionId}`)
                    }
                    className="btn-primary"
                  >
                    Ver Resultados Agora
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
