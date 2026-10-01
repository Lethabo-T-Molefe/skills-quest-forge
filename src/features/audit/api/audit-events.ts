import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { api, query } from "@/lib/api";
import type { AuditFilters, AuditPage } from "../types";

/**
 * The append-only audit trail, newest first. Members see their own entries; stewards, auditors and
 * administrators see everyone's. Filtering happens in the API, so it covers the whole trail.
 */
export const auditEventsQuery = (filters: AuditFilters = {}) =>
  queryOptions({
    queryKey: ["audit", "events", filters],
    queryFn: () =>
      api.get<AuditPage>(
        `/audit/events${query({ q: filters.q, actor_id: filters.actorId, limit: filters.limit ?? 25 })}`,
      ),
    placeholderData: keepPreviousData,
  });

/** How many entries the recent-activity panel shows. Route loaders preload the same number. */
export const RECENT_ACTIVITY_LIMIT = 6;

/** Download the trail as CSV. The export is itself recorded as an audit entry. */
export function exportAuditTrail() {
  return api.download("/audit/export", "dataforge-audit.csv");
}
