import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBiasModels,
  getFairnessMetrics,
  getDisparateImpact,
  getExplainability,
  signOffModel,
} from "@/lib/api/ethics";

export function useBiasModels() {
  return useQuery({
    queryKey: ["ethics", "models"],
    queryFn: getBiasModels,
    staleTime: 60 * 1000,
  });
}

export function useFairnessMetrics(modelId: number | undefined) {
  return useQuery({
    queryKey: ["ethics", "models", modelId, "fairness"],
    queryFn: () => getFairnessMetrics(modelId as number),
    enabled: !!modelId,
    staleTime: 60 * 1000,
  });
}

export function useDisparateImpact(modelId: number | undefined) {
  return useQuery({
    queryKey: ["ethics", "models", modelId, "disparate-impact"],
    queryFn: () => getDisparateImpact(modelId as number),
    enabled: !!modelId,
    staleTime: 60 * 1000,
  });
}

export function useExplainability(modelId: number | undefined) {
  return useQuery({
    queryKey: ["ethics", "models", modelId, "explainability"],
    queryFn: () => getExplainability(modelId as number),
    enabled: !!modelId,
    staleTime: 60 * 1000,
  });
}

export function useSignOffModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (modelId: number) => signOffModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ethics", "models"] });
    },
  });
}
