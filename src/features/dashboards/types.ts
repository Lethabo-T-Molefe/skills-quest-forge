export type DashboardVisibility = "Organisation" | "Team" | "Private";
export type DashboardChartType = "bar" | "line" | "area";

export interface DashboardChart {
  id: string;
  title: string;
  type: DashboardChartType;
  metric: string;
  sql: string;
  explanation: string;
  points: { name: string; value: number }[];
}

export interface Dashboard {
  id: string;
  name: string;
  owner: string;
  visibility: DashboardVisibility;
  description: string;
  charts: DashboardChart[];
  updated: string;
  sharedWith: string[];
}

export type DashboardSummary = Pick<Dashboard, "id" | "name" | "owner" | "visibility" | "updated"> & {
  charts: number;
};
