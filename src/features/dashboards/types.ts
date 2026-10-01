import type { BuildConfig, ValueFormat } from "@/features/analysis";

export type DashboardVisibility = "Organisation" | "Team" | "Private";
export type DashboardChartType = "bar" | "line" | "area";

/**
 * The analysis settings a chart is made from. The dataset and method are required; the API fills in the
 * method's defaults for anything left out.
 */
export type ChartSettings = Pick<BuildConfig, "datasetId" | "method"> & Partial<BuildConfig>;

export interface DashboardChart {
  id: string;
  title: string;
  type: DashboardChartType;
  metric: string;
  sql: string;
  explanation: string;
  source: "build" | "sql";
  config: ChartSettings | null;
  points: { name: string; value: number | null }[];
  format?: ValueFormat;
  reading?: string;
  /** Why this chart cannot be shown to this viewer (data they may not see, or a refused query). */
  unavailable?: string;
}

export interface Dashboard {
  id: string;
  name: string;
  owner: string;
  ownerId: string | null;
  visibility: DashboardVisibility;
  description: string;
  charts: DashboardChart[];
  updated: string;
  updatedAt: string;
  sharedWith: string[];
  sharedMembers?: { id: string; name: string; email: string }[];
  embedEnabled: boolean;
  canEdit: boolean;
  supersetUuid: string | null;
}

export interface DashboardSummary {
  id: string;
  name: string;
  owner: string;
  visibility: DashboardVisibility;
  updated: string;
  charts: number;
  description: string;
  ownerId: string | null;
  canEdit: boolean;
}
