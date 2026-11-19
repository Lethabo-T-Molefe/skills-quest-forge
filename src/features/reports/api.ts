import { queryOptions } from "@tanstack/react-query";
import { api, query } from "@/lib/api";

export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  /** role → what dataset it needs, e.g. primary → learner records. */
  roles: Record<string, string>;
}

export interface FigureRow {
  group: string | null;
  value: number | null;
  display: string;
  suppressed: boolean;
}

export interface ReportFigure {
  id: string;
  label: string;
  section: string;
  kind: "metric" | "model";
  dataset: string;
  datasetName?: string;
  measure?: string;
  measureLabel?: string;
  metric?: { name: string; version: number } | null;
  groupBy?: string | null;
  period?: { from: string; to: string };
  rows: FigureRow[];
  sql: string;
  params: Record<string, string>;
  sessionId: string | null;
  rowPolicy?: boolean;
  model?: { id: string; label: string };
  scoringRun?: { id: string; at: string; rows: number };
}

export interface Report {
  id: string;
  templateId: string;
  title: string;
  period: { from: string; to: string };
  datasets: Record<string, string>;
  figures: ReportFigure[];
  narrative: { text: string; template: string }[];
  narrativeSource: string;
  disclaimer: string;
  createdBy: string | null;
  createdAt: string;
  when: string;
  skipped?: string[];
}

export interface ReportAudit {
  reportId: string;
  figuresChecked: number;
  reproduced: number;
  mismatches: { figure: string; group: string | null; published: number; now: number | null }[];
  narrativeChecks: string[];
  suppressedCells: number;
}

export const reportTemplatesQuery = () =>
  queryOptions({
    queryKey: ["reports", "templates"],
    queryFn: () => api.get<ReportTemplate[]>("/reports/templates"),
  });

export const reportsQuery = () =>
  queryOptions({ queryKey: ["reports", "list"], queryFn: () => api.get<Report[]>("/reports") });

export const reportQuery = (reportId: string) =>
  queryOptions({
    queryKey: ["reports", reportId],
    queryFn: () => api.get<Report>(`/reports/${encodeURIComponent(reportId)}`),
  });

export function generateReport(body: {
  templateId: string;
  datasets: Record<string, string>;
  period?: { from: string; to: string };
}) {
  return api.post<Report>("/reports", body);
}

/** Re-run every figure's SQL and say whether each published value comes out the same. */
export function auditReport(reportId: string) {
  return api.post<ReportAudit>(`/reports/${encodeURIComponent(reportId)}/audit`);
}

export function exportReport(reportId: string, format: "pdf" | "xlsx") {
  return api.download(
    `/reports/${encodeURIComponent(reportId)}/export${query({ format })}`,
    `report.${format}`,
  );
}
