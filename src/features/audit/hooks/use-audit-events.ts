import { useSuspenseQuery } from "@tanstack/react-query";
import { auditEventsQuery } from "../api/audit-events";

/** The newest audit entries the member may see. */
export function useRecentAuditEvents(limit: number) {
  return useSuspenseQuery(auditEventsQuery({ limit })).data.items;
}
