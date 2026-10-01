import { queryOptions, useQuery, useSuspenseQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AnalysisCatalogue, AnalysisDataset, AnalysisResult, BuildConfig } from "../types";

export const analysisCatalogueQuery = () =>
  queryOptions({
    queryKey: ["analysis", "catalogue"],
    // Roles that do not analyse data (auditors) get an empty list, and the pages say so.
    queryFn: () => api.get<AnalysisCatalogue>("/analysis/catalogue"),
    staleTime: 60_000,
  });

/** The approved datasets this member may analyse, with their measures, dimensions and months. */
export function useAnalysisDatasets(): AnalysisDataset[] {
  return useSuspenseQuery(analysisCatalogueQuery()).data.datasets;
}

export function runAnalysis(config: BuildConfig) {
  return api.post<AnalysisResult>("/analysis/run", config);
}

/** Run an analysis whenever its settings change, keeping the last result on screen while the next one loads. */
export function useAnalysisResult(config: BuildConfig | null) {
  return useQuery({
    queryKey: ["analysis", "run", config],
    queryFn: () => runAnalysis(config!),
    enabled: config !== null,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function saveExploration(name: string, config: BuildConfig) {
  return api.post<{ id: string; name: string; sql: string }>("/explorations", { name, config });
}
