import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getContributions,
  getTasks,
  logContribution,
  updateTaskStatus,
  type LogContributionInput,
  type TaskFilters,
} from "@/lib/api/workspace";

const tasksKey = ["workspace", "tasks"] as const;
const contributionsKey = ["workspace", "contributions"] as const;

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: [...tasksKey, filters],
    queryFn: () => getTasks(filters),
    staleTime: 60 * 1000,
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKey });
    },
  });
}

export function useContributions(student?: string) {
  return useQuery({
    queryKey: [...contributionsKey, student ?? null],
    queryFn: () => getContributions(student),
    staleTime: 60 * 1000,
  });
}

export function useLogContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LogContributionInput) => logContribution(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contributionsKey });
    },
  });
}
