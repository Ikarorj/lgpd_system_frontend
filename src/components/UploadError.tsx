import { AlertCircle, X } from "lucide-react";

interface UploadErrorProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function UploadError({
  message,
  onRetry,
  onDismiss,
}: UploadErrorProps) {
  return (
    <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-danger-700">
            Erro no upload
          </h4>
          <p className="text-sm text-danger-600 mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-danger-700 hover:text-danger-800 underline"
            >
              Tentar novamente
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-danger-400 hover:text-danger-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
