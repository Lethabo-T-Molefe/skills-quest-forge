import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { DashboardSummary } from "../types";

const dashboards: DashboardSummary[] = [
  { id: "exec-overview", name: "Executive overview", owner: "Data Stewardship", visibility: "Organisation", charts: 6, updated: "Today" },
  { id: "enrolment-health", name: "Enrolment health", owner: "Thandi Mokoena", visibility: "Team", charts: 4, updated: "Yesterday" },
  { id: "my-scratch", name: "My scratch board", owner: "Thandi Mokoena", visibility: "Private", charts: 2, updated: "3 days ago" },
];

export function fetchDashboards() {
  return mockResponse(dashboards);
}

export const dashboardsQuery = () => queryOptions({ queryKey: ["dashboards"], queryFn: fetchDashboards });
