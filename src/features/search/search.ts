import { queryOptions } from "@tanstack/react-query";
import { api, query } from "@/lib/api";

export interface SearchHit {
  type: "dataset" | "metric" | "dashboard" | "notebook";
  id: string;
  title: string;
  detail: string;
  /** How well the hit matched. The API returns hits best first. */
  rank: number;
}

/**
 * Search the catalogue: datasets (including their column names), shared metrics, dashboards and notebooks.
 * Only what this member may see is returned.
 */
export const searchQuery = (text: string) =>
  queryOptions({
    queryKey: ["search", text],
    queryFn: () => api.get<SearchHit[]>(`/search${query({ q: text })}`),
    enabled: text.trim().length > 0,
  });
