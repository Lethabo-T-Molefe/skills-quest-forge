import { useSuspenseQuery } from "@tanstack/react-query";
import { alertQuery, alertsQuery, monitorsQuery, predictionQuery } from "../api/monitors";

export function useAlerts() {
  return useSuspenseQuery(alertsQuery()).data;
}

export function useAlert(id: string) {
  return useSuspenseQuery(alertQuery(id)).data;
}

export function useMonitors() {
  return useSuspenseQuery(monitorsQuery()).data;
}

export function usePrediction() {
  return useSuspenseQuery(predictionQuery()).data;
}
