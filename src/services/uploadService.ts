import { uploadFiles, getUploadStatus } from "./apiService";
import { UploadFileEntry } from "../types/artifact.types";
import type { UploadFileStatusDTO } from "@shared/types/apiContracts.types";

export interface UploadProgress {
  sessionId: string | null;
  files: UploadFileEntry[];
  overallProgress: number;
  status: "idle" | "uploading" | "completed" | "error";
  error?: string;
}

export async function handleFileUpload(
  files: File[],
  onProgress?: (fileId: string, percent: number) => void,
): Promise<{ sessionId: string; fileIds: string[] }> {
  const response = await uploadFiles(files, undefined, undefined, (percent) => {
    files.forEach((file) => {
      const fileId = `${file.name}-${file.size}`;
      onProgress?.(fileId, percent);
    });
  });

  return {
    sessionId: response.upload_session_id,
    fileIds: response.files.map((f) => f.artifact_id),
  };
}

export async function pollUploadStatus(
  sessionId: string,
  onProgress: (files: UploadFileEntry[]) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  intervalMs = 2000,
): Promise<void> {
  const poll = async () => {
    try {
      const result = await getUploadStatus(sessionId);

      const entries: UploadFileEntry[] = result.files.map(
        (f: UploadFileStatusDTO) => ({
          file: new File([], f.filename),
          id: f.artifact_id,
          progress: f.progress_percent,
          status:
            f.status === "completed"
              ? "completed"
              : f.status === "failed"
                ? "error"
                : "uploading",
          error: f.error_message,
          artifact_id: f.artifact_id,
        }),
      );

      onProgress(entries);

      if (
        result.overall_status === "completed" ||
        result.overall_status === "completed_with_errors"
      ) {
        onComplete();
        return;
      }

      setTimeout(poll, intervalMs);
    } catch {
      onError("Erro ao verificar status do upload. Tente novamente.");
    }
  };

  await poll();
}
