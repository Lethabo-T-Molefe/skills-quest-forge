import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPopiaScorecard,
  getPiiRegister,
  getRetentionPolicies,
  getDatasetApprovals,
  reviewDatasetApproval,
} from "@/lib/api/governance";

export function usePopiaScorecard() {
  return useQuery({
    queryKey: ["governance", "popia-scorecard"],
    queryFn: getPopiaScorecard,
    staleTime: 60 * 1000,
  });
}

export function usePiiRegister() {
  return useQuery({
    queryKey: ["governance", "pii-register"],
    queryFn: getPiiRegister,
    staleTime: 60 * 1000,
  });
}

export function useRetentionPolicies() {
  return useQuery({
    queryKey: ["governance", "retention"],
    queryFn: getRetentionPolicies,
    staleTime: 60 * 1000,
  });
}

export function useDatasetApprovals() {
  return useQuery({
    queryKey: ["governance", "approvals"],
    queryFn: getDatasetApprovals,
    staleTime: 60 * 1000,
  });
}

export function useReviewDatasetApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => reviewDatasetApproval(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance", "approvals"] });
    },
  });
}
