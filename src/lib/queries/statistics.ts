import { useQuery, useMutation } from "@tanstack/react-query";
import { getTaxonomy, runAnalysis } from "@/lib/api/statistics";
import { listDatasets } from "@/lib/api";

export function useStatTaxonomy() {
  return useQuery({ queryKey: ["statistics", "taxonomy"], queryFn: getTaxonomy, staleTime: Infinity });
}

export function useDatasetsForAnalysis() {
  return useQuery({ queryKey: ["datasets", null], queryFn: () => listDatasets(), staleTime: 30 * 1000 });
}

export function useRunAnalysis() {
  return useMutation({
    mutationFn: ({ categoryId, table, methods }: { categoryId: string; table: string; methods: string[] }) =>
      runAnalysis(categoryId, table, methods),
  });
}
