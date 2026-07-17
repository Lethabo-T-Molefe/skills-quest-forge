import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptPrototypeRecommendation,
  dismissPrototypeRecommendation,
  forecastCentreDemand,
  getPrototypeRecommendations,
  predictCompletion,
  runScenarioSimulation,
  scoreGrantRisk,
} from "@/lib/api/prototype";

export function usePredictCompletion() {
  return useMutation({ mutationFn: predictCompletion });
}

export function useScoreGrantRisk() {
  return useMutation({ mutationFn: scoreGrantRisk });
}

export function useForecastCentreDemand() {
  return useMutation({ mutationFn: forecastCentreDemand });
}

export function useRunScenarioSimulation() {
  return useMutation({ mutationFn: runScenarioSimulation });
}

export function usePrototypeRecommendations() {
  return useQuery({
    queryKey: ["prototype", "recommendations"],
    queryFn: getPrototypeRecommendations,
    staleTime: 30 * 1000,
  });
}

export function useAcceptPrototypeRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => acceptPrototypeRecommendation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prototype", "recommendations"] }),
  });
}

export function useDismissPrototypeRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dismissPrototypeRecommendation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prototype", "recommendations"] }),
  });
}
