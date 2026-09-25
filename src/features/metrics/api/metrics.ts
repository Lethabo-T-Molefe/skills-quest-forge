import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { MetricDefinition, MetricSummary } from "../types";

const metricSummaries: MetricSummary[] = [
  { name: "Active learners", value: "12 480", delta: "+4.2%", trend: "up", definition: "Learners with at least one session in the last 30 days" },
  { name: "Completion rate", value: "66.3%", delta: "+1.8%", trend: "up", definition: "Completions divided by enrolments in the period" },
  { name: "Average fee paid", value: "R1 214", delta: "-2.1%", trend: "down", definition: "Mean fee across approved enrolments" },
  { name: "Open data issues", value: "7", delta: "+3", trend: "down", definition: "Quality flags raised on datasets you own" },
];

const metricDefinitions: MetricDefinition[] = [
  { name: "Active learners", owner: "Data Stewardship", expression: "COUNT(DISTINCT learner_id) WHERE last_session >= today - 30", usedBy: 14 },
  { name: "Completion rate", owner: "Data Stewardship", expression: "completions / NULLIF(enrolments, 0)", usedBy: 9 },
  { name: "Average fee paid", owner: "Sipho Dlamini", expression: "AVG(fee_paid) WHERE status = 'approved'", usedBy: 6 },
];

export function fetchMetricSummaries() {
  return mockResponse(metricSummaries);
}

export function fetchMetricDefinitions() {
  return mockResponse(metricDefinitions);
}

export const metricSummariesQuery = () =>
  queryOptions({ queryKey: ["metrics", "summaries"], queryFn: fetchMetricSummaries });

export const metricDefinitionsQuery = () =>
  queryOptions({ queryKey: ["metrics", "definitions"], queryFn: fetchMetricDefinitions });
