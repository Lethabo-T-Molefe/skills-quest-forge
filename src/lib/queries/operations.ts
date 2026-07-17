import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMlExperiments,
  getPipelineRuns,
  getSystemHealth,
  promoteModel,
} from "@/lib/api/operations";

const experimentsKey = ["operations", "experiments"] as const;

export function usePipelineRuns() {
  return useQuery({
    queryKey: ["operations", "pipelines"],
    queryFn: getPipelineRuns,
    staleTime: 60 * 1000,
  });
}

export function useMlExperiments() {
  return useQuery({
    queryKey: experimentsKey,
    queryFn: getMlExperiments,
    staleTime: 60 * 1000,
  });
}

export function usePromoteModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => promoteModel(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experimentsKey });
    },
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["operations", "health"],
    queryFn: getSystemHealth,
    staleTime: 30 * 1000,
  });
}
