import { CheckCircle, AlertCircle, Loader2, XCircle } from "lucide-react";
import { UploadFileEntry } from "../types/artifact.types";

interface ProgressTrackerProps {
  files: UploadFileEntry[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getStatusIcon(status: UploadFileEntry["status"]) {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-5 h-5 text-success-500" />;
    case "error":
      return <XCircle className="w-5 h-5 text-danger-500" />;
    case "uploading":
      return <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-300" />;
  }
}

function getStatusText(status: UploadFileEntry["status"]) {
  switch (status) {
    case "completed":
      return "Concluído";
    case "error":
      return "Erro";
    case "uploading":
      return "Enviando...";
    default:
      return "Aguardando";
  }
}

export default function ProgressTracker({ files }: ProgressTrackerProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {getStatusIcon(file.status)}
              <span className="text-sm font-medium text-gray-700 truncate">
                {file.file.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{getStatusText(file.status)}</span>
              {file.file.size > 0 && (
                <span className="text-xs">
                  ({formatFileSize(file.file.size)})
                </span>
              )}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                file.status === "error"
                  ? "bg-danger-500"
                  : file.status === "completed"
                    ? "bg-success-500"
                    : "bg-primary-500"
              }`}
              style={{ width: `${file.progress}%` }}
            />
          </div>

          {file.status === "pending" && (
            <p className="text-xs text-gray-400 mt-1">
              Aguardando início do upload...
            </p>
          )}

          {file.status === "uploading" && (
            <p className="text-xs text-primary-600 mt-1">
              {file.progress}% concluído
            </p>
          )}

          {file.error && (
            <p className="text-xs text-danger-600 mt-1">{file.error}</p>
          )}
        </div>
      ))}
    </div>
  );
}
