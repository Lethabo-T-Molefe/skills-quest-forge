import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AssistantTurn } from "../types";

/**
 * Ask in plain English. The assistant plans the question against the shared metrics and the data this member
 * may see; the answer comes with the SQL that ran, or a clear refusal when it cannot be grounded.
 */
export function askAssistant(question: string) {
  return api.post<AssistantTurn>("/assistant/ask", { question });
}

/** The member's earlier questions, newest first. */
export const assistantHistoryQuery = () =>
  queryOptions({
    queryKey: ["assistant", "history"],
    queryFn: () => api.get<AssistantTurn[]>("/assistant/history"),
  });

/** Questions that can be answered from the metrics and data this member may see. */
export const assistantSuggestionsQuery = () =>
  queryOptions({
    queryKey: ["assistant", "suggestions"],
    queryFn: () => api.get<string[]>("/assistant/suggestions"),
    staleTime: 60_000,
  });
