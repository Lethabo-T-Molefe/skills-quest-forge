import { useSuspenseQuery } from "@tanstack/react-query";
import { auditEventsQuery } from "../api/audit-events";

export function useAuditEvents() {
  return useSuspenseQuery(auditEventsQuery()).data;
}
