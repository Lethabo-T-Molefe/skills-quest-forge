import { useSuspenseQuery } from "@tanstack/react-query";
import { dashboardQuery, dashboardsQuery } from "../api/dashboards";

export function useDashboards() {
  return useSuspenseQuery(dashboardsQuery()).data;
}

export function useDashboard(id: string) {
  return useSuspenseQuery(dashboardQuery(id)).data;
}
