export interface DashboardSummary {
  id: string;
  name: string;
  owner: string;
  visibility: "Organisation" | "Team" | "Private";
  charts: number;
  updated: string;
}
