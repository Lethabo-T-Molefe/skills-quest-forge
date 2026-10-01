import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MetricDefinition, MetricDraft, MetricSummary } from "../types";

const path = (metricId: string, rest = "") =>
  `/metrics/definitions/${encodeURIComponent(metricId)}${rest}`;

/** Headline figures: each shared metric's latest month against the month before. */
export const metricSummariesQuery = () =>
  queryOptions({
    queryKey: ["metrics", "summaries"],
    queryFn: () => api.get<MetricSummary[]>("/metrics/summaries"),
  });

export const metricDefinitionsQuery = () =>
  queryOptions({
    queryKey: ["metrics", "definitions"],
    queryFn: () => api.get<MetricDefinition[]>("/metrics/definitions"),
  });

/** A metric feeds analysis fields, the assistant and dashboards, so they are refetched when one changes. */
export function refreshMetrics(queryClient: QueryClient) {
  return Promise.all(
    [["metrics"], ["analysis"], ["assistant"], ["dashboards"], ["audit"], ["search"]].map(
      (queryKey) => queryClient.invalidateQueries({ queryKey }),
    ),
  );
}

/** Define a metric. It starts as a draft: a steward publishes it before anyone else can use it. */
export function createMetric(draft: MetricDraft) {
  return api.post<MetricDefinition>("/metrics/definitions", draft);
}

export function publishMetric(metricId: string) {
  return api.post<MetricDefinition>(path(metricId, "/publish"));
}

export function unpublishMetric(metricId: string) {
  return api.post<MetricDefinition>(path(metricId, "/unpublish"));
}

export function deleteMetric(metricId: string) {
  return api.delete(path(metricId));
}
