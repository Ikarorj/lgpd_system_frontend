import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileWarning } from "lucide-react";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export default function UploadZone({
  onFilesSelected,
  disabled = false,
  maxFiles = 10,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles.slice(0, maxFiles));
    },
    [onFilesSelected, maxFiles],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      disabled,
      maxFiles,
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "text/markdown": [".md", ".markdown"],
        "text/plain": [".txt"],
        "text/x-python": [".py"],
        "text/javascript": [".js", ".jsx"],
        "application/typescript": [".ts", ".tsx"],
        "text/x-java-source": [".java"],
        "text/x-go": [".go"],
        "text/x-rust": [".rs"],
        "application/json": [".json"],
        "application/x-yaml": [".yml", ".yaml"],
      },
    });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${isDragActive && !isDragReject ? "border-primary-500 bg-primary-50" : ""}
        ${isDragReject ? "border-danger-500 bg-danger-50" : ""}
        ${!isDragActive && !isDragReject ? "border-gray-300 hover:border-primary-400 hover:bg-gray-50" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {isDragReject ? (
          <FileWarning className="w-12 h-12 text-danger-500" />
        ) : (
          <Upload className="w-12 h-12 text-gray-400" />
        )}
        <div>
          {isDragActive ? (
            <p className="text-lg font-medium text-primary-600">
              {isDragReject
                ? "Formato de arquivo não suportado"
                : "Solte os arquivos aqui..."}
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-600">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-sm text-gray-400 mt-1">
                PDF, DOCX, Markdown, Python, JavaScript, TypeScript, Java, Go,
                Rust, JSON, YAML
              </p>
            </>
          )}
        </div>
        <div className="flex gap-4 text-xs text-gray-400">
          <span>Até {maxFiles} arquivos</span>
          <span>Até 10 MB por arquivo</span>
        </div>
      </div>
    </div>
  );
}
