import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Every role but the auditor works in Superset. The API enforces this; here it decides what to show. */
export const SUPERSET_ROLES: readonly string[] = [
  "admin",
  "steward",
  "practitioner",
  "curator",
  "analyst",
  "executive",
];

export interface IntegrationStatus {
  enabled: boolean;
  reachable: boolean;
  url: string | null;
  detail: string;
}

export const integrationStatusQuery = () =>
  queryOptions({
    queryKey: ["integrations", "status"],
    queryFn: () =>
      api.get<{ superset: IntegrationStatus; jupyter: IntegrationStatus }>("/integrations/status"),
    staleTime: 60_000,
  });

export interface SupersetDashboard {
  id: number;
  title: string;
  url: string;
  published: boolean;
  changed: string;
  owners: string[];
}

export const supersetDashboardsQuery = () =>
  queryOptions({
    queryKey: ["integrations", "superset", "dashboards"],
    queryFn: () => api.get<SupersetDashboard[]>("/integrations/superset/dashboards"),
  });

/**
 * Sign-in links are single-use and expire in two minutes, so they are fetched on click and opened at once.
 * The window is opened first (synchronously) so browsers do not block it as a pop-up.
 */
async function openSignedLink(fetchLink: () => Promise<{ url: string }>) {
  const opened = window.open("about:blank", "_blank");
  try {
    const { url } = await fetchLink();
    if (opened) {
      opened.opener = null;
      opened.location.href = url;
    } else {
      window.location.href = url;
    }
  } catch (error) {
    opened?.close();
    throw error;
  }
}

export function openSuperset(next = "/superset/welcome/") {
  return openSignedLink(() =>
    api.post<{ url: string }>(`/integrations/superset/sign-in?next=${encodeURIComponent(next)}`),
  );
}

export function openJupyter() {
  return openSignedLink(() => api.post<{ url: string }>("/integrations/jupyter/sign-in"));
}

export function openNotebookInJupyter(notebookId: string) {
  return openSignedLink(() =>
    api.post<{ url: string }>(`/integrations/jupyter/notebooks/${encodeURIComponent(notebookId)}`),
  );
}

export function openSqlInJupyter(title: string, sql: string, note = "") {
  return openSignedLink(() =>
    api.post<{ url: string }>("/integrations/jupyter/sql", { title, sql, note }),
  );
}

export function supersetGuestToken(dashboardId: number) {
  return api.post<{ token: string; embeddedId: string; supersetDomain: string }>(
    `/integrations/superset/dashboards/${dashboardId}/guest-token`,
  );
}
