import { useQuery } from "@tanstack/react-query";
import { getAuditLog, type AuditLogFilters } from "@/lib/api/audit";

export function useAuditLog(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ["audit", filters],
    queryFn: () => getAuditLog(filters),
    staleTime: 30 * 1000,
  });
}
