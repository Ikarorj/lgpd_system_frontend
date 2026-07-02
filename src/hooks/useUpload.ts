import { useState, useCallback, useRef } from "react";
import { UploadFileEntry } from "../types/artifact.types";
import { handleFileUpload, pollUploadStatus } from "../services/uploadService";

interface UseUploadReturn {
  files: UploadFileEntry[];
  isUploading: boolean;
  overallProgress: number;
  error: string | null;
  sessionId: string | null;
  isCompleted: boolean;
  fileIds: string[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (fileId: string) => void;
  startUpload: () => Promise<void>;
  reset: () => void;
}

export function useUpload(): UseUploadReturn {
  const [files, setFiles] = useState<UploadFileEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const pollingRef = useRef<boolean>(false);

  const addFiles = useCallback((newFiles: File[]) => {
    setError(null);
    setFiles((prev) => {
      const existing = new Set(
        prev.map((f) => `${f.file.name}-${f.file.size}`),
      );
      const toAdd: UploadFileEntry[] = newFiles
        .filter((f) => !existing.has(`${f.name}-${f.size}`))
        .map((file) => ({
          file,
          id: `${file.name}-${file.size}`,
          progress: 0,
          status: "pending" as const,
        }));
      return [...prev, ...toAdd].slice(0, 10);
    });
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const startUpload = useCallback(async () => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    setError(null);
    pollingRef.current = true;

    try {
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: "uploading" as const })),
      );

      const { sessionId: sid, fileIds: ids } = await handleFileUpload(
        files.map((f) => f.file),
        (fileId, percent) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress: percent } : f,
            ),
          );
        },
      );

      setSessionId(sid);
      setFileIds(ids);

      await pollUploadStatus(
        sid,
        (updatedFiles) => {
          setFiles(updatedFiles);
          const total = updatedFiles.reduce((s, f) => s + f.progress, 0);
          setOverallProgress(
            updatedFiles.length > 0
              ? Math.round(total / updatedFiles.length)
              : 0,
          );
        },
        () => {
          pollingRef.current = false;
          setIsUploading(false);
          setIsCompleted(true);
        },
        (err) => {
          setError(err);
          pollingRef.current = false;
          setIsUploading(false);
        },
      );
    } catch {
      setError("Erro ao enviar arquivos. Tente novamente.");
      setIsUploading(false);
      pollingRef.current = false;
    }
  }, [files, isUploading]);

  const reset = useCallback(() => {
    setFiles([]);
    setIsUploading(false);
    setOverallProgress(0);
    setError(null);
    setSessionId(null);
    setIsCompleted(false);
    setFileIds([]);
    pollingRef.current = false;
  }, []);

  return {
    files,
    isUploading,
    overallProgress,
    error,
    sessionId,
    isCompleted,
    fileIds,
    addFiles,
    removeFile,
    startUpload,
    reset,
  };
}
