import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchExtractionResult } from "../services/extractionService";
import type { ExtractionResponse } from "../services/apiService";

export function useExtraction(
  extractionId: string | undefined,
): UseQueryResult<ExtractionResponse> {
  return useQuery<ExtractionResponse>({
    queryKey: ["extraction", extractionId],
    queryFn: () => fetchExtractionResult(extractionId!),
    enabled: !!extractionId,
    retry: 2,
    staleTime: 10000,
  });
}
