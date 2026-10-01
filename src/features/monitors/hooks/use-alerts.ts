import { useSuspenseQuery } from "@tanstack/react-query";
import { alertQuery, alertsQuery, monitorsQuery } from "../api/monitors";

export function useAlerts() {
  return useSuspenseQuery(alertsQuery()).data;
}

/** One alert. The route loader turns a missing alert into the not-found page. */
export function useAlert(id: string) {
  return useSuspenseQuery(alertQuery(id)).data;
}

export function useMonitors() {
  return useSuspenseQuery(monitorsQuery()).data;
}
