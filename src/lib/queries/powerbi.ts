import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPowerBiEmbedConfig, listPowerBiReports, createPowerBiReport, deletePowerBiReport,
  queryPowerBiDataset, type PowerBiAgg, type PowerBiVisual,
} from "@/lib/api/powerbi";

// Power BI embed tokens are short-lived (~60 min); refetch well before that
// so a long-open tab gets a fresh one instead of erroring out mid-session.
const EMBED_TOKEN_REFRESH_MS = 30 * 60 * 1000;

export function usePowerBiEmbedConfig() {
  return useQuery({
    queryKey: ["powerbi", "embed-config"],
    queryFn: getPowerBiEmbedConfig,
    staleTime: EMBED_TOKEN_REFRESH_MS,
    refetchInterval: EMBED_TOKEN_REFRESH_MS,
  });
}

const reportsKey = ["powerbi", "reports"] as const;

export function usePowerBiReports() {
  return useQuery({ queryKey: reportsKey, queryFn: listPowerBiReports, staleTime: 15 * 1000 });
}

export function useCreatePowerBiReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; dataset_id: number; visuals: PowerBiVisual[] }) =>
      createPowerBiReport(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportsKey }),
  });
}

export function useDeletePowerBiReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reportId: number) => deletePowerBiReport(reportId),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportsKey }),
  });
}

export function usePowerBiDatasetQuery(
  datasetId: number | null,
  opts: { columns?: string[]; groupBy?: string | null; agg?: PowerBiAgg | null; limit?: number },
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["powerbi", "dataset-query", datasetId, opts],
    queryFn: () => queryPowerBiDataset(datasetId as number, opts),
    enabled: enabled && datasetId !== null,
    staleTime: 15 * 1000,
  });
}
