import { queryOptions } from "@tanstack/react-query";
import { API_URL, ApiError, api } from "@/lib/api";
import type { ChartSettings, Dashboard, DashboardChartType, DashboardSummary } from "../types";

export const dashboardsQuery = () =>
  queryOptions({
    queryKey: ["dashboards"],
    queryFn: () => api.get<DashboardSummary[]>("/dashboards"),
  });

/** A dashboard with every chart computed for the person viewing it, under their own role. */
export const dashboardQuery = (id: string) =>
  queryOptions({
    queryKey: ["dashboards", id],
    queryFn: () => api.get<Dashboard>(`/dashboards/${encodeURIComponent(id)}`),
  });

export function createDashboard(body: {
  name: string;
  description: string;
  visibility: "private" | "team" | "organisation";
}) {
  return api.post<Dashboard>("/dashboards", body);
}

export function updateDashboard(
  id: string,
  changes: {
    name?: string;
    description?: string;
    visibility?: "private" | "team" | "organisation";
  },
) {
  return api.patch<Dashboard>(`/dashboards/${encodeURIComponent(id)}`, changes);
}

export function deleteDashboard(id: string) {
  return api.delete(`/dashboards/${encodeURIComponent(id)}`);
}

/** Add a chart from analysis settings or from SQL. The dashboard stores how it is made, not its numbers. */
export function addChart(
  dashboardId: string,
  chart: {
    title: string;
    type: DashboardChartType;
    config?: ChartSettings;
    sql?: string;
    explanation?: string;
  },
) {
  return api.post<Dashboard>(`/dashboards/${encodeURIComponent(dashboardId)}/charts`, chart);
}

export function removeChart(dashboardId: string, chartId: string) {
  return api.delete<Dashboard>(
    `/dashboards/${encodeURIComponent(dashboardId)}/charts/${encodeURIComponent(chartId)}`,
  );
}

export function shareDashboard(dashboardId: string, emails: string[]) {
  return api.post<Dashboard>(`/dashboards/${encodeURIComponent(dashboardId)}/shares`, { emails });
}

export function unshareDashboard(dashboardId: string, userId: string) {
  return api.delete<Dashboard>(
    `/dashboards/${encodeURIComponent(dashboardId)}/shares/${encodeURIComponent(userId)}`,
  );
}

export function setEmbedding(dashboardId: string, enabled: boolean) {
  return api.post<{
    embedEnabled: boolean;
    token?: string;
    path?: string;
    expiresInHours?: number;
  }>(`/dashboards/${encodeURIComponent(dashboardId)}/embed`, { enabled });
}

/**
 * A dashboard as another internal application shows it: read with the signed, expiring token from its embed
 * link instead of a member's session. It holds organisation-wide data only.
 */
export async function fetchEmbeddedDashboard(
  dashboardId: string,
  token: string,
): Promise<Dashboard> {
  const response = await fetch(
    `${API_URL}/embed/dashboards/${encodeURIComponent(dashboardId)}?token=${encodeURIComponent(token)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) {
    throw new ApiError(
      response.status,
      "embed",
      response.status === 404 || response.status === 401
        ? "This embed link is no longer valid. Ask the dashboard's owner for a new one."
        : "The dashboard could not be loaded.",
    );
  }
  return (await response.json()) as Dashboard;
}

/** The address of the read-only page that another application can put in a frame. */
export function embedPageUrl(dashboardId: string, token: string) {
  return `${window.location.origin}/embed/${encodeURIComponent(dashboardId)}?token=${encodeURIComponent(token)}`;
}

/** The chart type that suits an analysis method. */
export function chartTypeFor(method: string): DashboardChartType {
  return method === "trend" ? "line" : "bar";
}
