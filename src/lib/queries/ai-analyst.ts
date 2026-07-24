import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { askQuestion, getHistory } from "@/lib/api/ai-analyst";

export function useAskQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: askQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-analyst", "history"] });
    },
  });
}

export function useAiAnalystHistory() {
  return useQuery({
    queryKey: ["ai-analyst", "history"],
    queryFn: getHistory,
    staleTime: 30 * 1000,
  });
}
