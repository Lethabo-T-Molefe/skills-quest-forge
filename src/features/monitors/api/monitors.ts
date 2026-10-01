import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Alert, Monitor, MonitorCheck, MonitorDraft } from "../types";

const monitorPath = (monitorId: string, rest = "") =>
  `/monitors/${encodeURIComponent(monitorId)}${rest}`;
const alertPath = (alertId: string, rest = "") => `/alerts/${encodeURIComponent(alertId)}${rest}`;

export const alertsQuery = () =>
  queryOptions({ queryKey: ["monitors", "alerts"], queryFn: () => api.get<Alert[]>("/alerts") });

/** An alert with its plain-language root cause: the main contributing factors and their figures. */
export const alertQuery = (alertId: string) =>
  queryOptions({
    queryKey: ["monitors", "alerts", alertId],
    queryFn: () => api.get<Alert>(alertPath(alertId)),
  });

export const monitorsQuery = () =>
  queryOptions({ queryKey: ["monitors", "list"], queryFn: () => api.get<Monitor[]>("/monitors") });

export function refreshMonitors(queryClient: QueryClient) {
  return Promise.all(
    [["monitors"], ["audit"]].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

export function createMonitor(draft: MonitorDraft) {
  return api.post<Monitor>("/monitors", draft);
}

export function setMonitorStatus(monitorId: string, status: Monitor["status"]) {
  return api.patch<Monitor>(monitorPath(monitorId), { status });
}

export function deleteMonitor(monitorId: string) {
  return api.delete(monitorPath(monitorId));
}

/** Evaluate a monitor now instead of waiting for its next scheduled check. */
export function checkMonitor(monitorId: string) {
  return api.post<MonitorCheck>(monitorPath(monitorId, "/check"));
}

export function acknowledgeAlert(alertId: string) {
  return api.post<Alert>(alertPath(alertId, "/acknowledge"));
}
