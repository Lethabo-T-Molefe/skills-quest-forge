import { useSuspenseQuery } from "@tanstack/react-query";
import { alertsQuery } from "../api/monitors";

export function useAlerts() {
  return useSuspenseQuery(alertsQuery()).data;
}
