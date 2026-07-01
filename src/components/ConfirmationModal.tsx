import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "warning",
}: ConfirmationModalProps) {
  const variantStyles = {
    danger: {
      icon: "text-danger-600 bg-danger-50",
      button: "btn-danger",
    },
    warning: {
      icon: "text-warning-600 bg-warning-50",
      button: "btn-primary",
    },
    info: {
      icon: "text-primary-600 bg-primary-50",
      button: "btn-primary",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${styles.icon}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
