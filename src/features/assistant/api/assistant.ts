import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AssistantTurn } from "../types";

/**
 * Ask in plain English. The assistant plans the question against the shared metrics and the data this member
 * may see; the answer comes with the SQL that ran, or a clear refusal when it cannot be grounded.
 */
export function askAssistant(question: string, contextId?: string, datasetId?: string) {
  // contextId is the previous answer in this conversation, so "what about Gauteng?" builds on it.
  // datasetId is the dataset the member chose: the assistant then answers from that dataset only.
  return api.post<AssistantTurn>("/assistant/ask", {
    question,
    ...(contextId ? { contextId } : {}),
    ...(datasetId ? { datasetId } : {}),
  });
}

/** The member's earlier questions, newest first. */
export const assistantHistoryQuery = () =>
  queryOptions({
    queryKey: ["assistant", "history"],
    queryFn: () => api.get<AssistantTurn[]>("/assistant/history"),
  });

/** Questions that can be answered from the metrics and data this member may see, or from one dataset. */
export const assistantSuggestionsQuery = (datasetId?: string) =>
  queryOptions({
    queryKey: ["assistant", "suggestions", datasetId ?? "all"],
    queryFn: () =>
      api.get<string[]>(
        datasetId
          ? `/assistant/suggestions?datasetId=${encodeURIComponent(datasetId)}`
          : "/assistant/suggestions",
      ),
    staleTime: 60_000,
  });
