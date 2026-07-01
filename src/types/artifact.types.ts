export type { ArtifactDTO as Artifact, ArtifactStatus } from "@shared/types/apiContracts.types";

export interface UploadFileEntry {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  artifact_id?: string;
}
