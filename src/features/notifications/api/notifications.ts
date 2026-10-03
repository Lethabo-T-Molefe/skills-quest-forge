import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { NotificationList } from "../types";

/** The member's latest notifications. Checked every minute, and whenever the window regains focus. */
export const notificationsQuery = () =>
  queryOptions({
    queryKey: ["notifications"],
    queryFn: () => api.get<NotificationList>("/notifications"),
    refetchInterval: 60_000,
  });

/** Mark notifications read: the ones given, or all of them. */
export function markNotificationsRead(ids?: string[]) {
  return api.post<{ unread: number }>("/notifications/read", ids ? { ids } : {});
}
