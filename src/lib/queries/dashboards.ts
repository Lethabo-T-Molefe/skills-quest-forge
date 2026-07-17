import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptRecommendation,
  dismissRecommendation,
  getAiRecommendations,
  getHomeKpis,
  getRecentActivity,
  getRiskAlerts,
} from "@/lib/api/dashboards";

export function useHomeKpis() {
  return useQuery({ queryKey: ["dashboards", "home"], queryFn: getHomeKpis, staleTime: 60 * 1000 });
}

export function useRiskAlerts() {
  return useQuery({
    queryKey: ["dashboards", "risk-alerts"],
    queryFn: getRiskAlerts,
    staleTime: 60 * 1000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["dashboards", "recent-activity"],
    queryFn: getRecentActivity,
    staleTime: 60 * 1000,
  });
}

export function useAiRecommendations() {
  return useQuery({
    queryKey: ["dashboards", "recommendations"],
    queryFn: getAiRecommendations,
    staleTime: 30 * 1000,
  });
}

export function useAcceptRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => acceptRecommendation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboards", "recommendations"] }),
  });
}

export function useDismissRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dismissRecommendation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboards", "recommendations"] }),
  });
}
