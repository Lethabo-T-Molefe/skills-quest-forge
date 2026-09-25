import { useSuspenseQuery } from "@tanstack/react-query";
import { metricDefinitionsQuery, metricSummariesQuery } from "../api/metrics";

export function useMetricSummaries() {
  return useSuspenseQuery(metricSummariesQuery()).data;
}

export function useMetricDefinitions() {
  return useSuspenseQuery(metricDefinitionsQuery()).data;
}
