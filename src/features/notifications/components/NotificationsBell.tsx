import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Popover from "@radix-ui/react-popover";
import { Bell } from "lucide-react";
import { notifyError } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { markNotificationsRead, notificationsQuery } from "../api/notifications";
import type { Notification } from "../types";

const KIND_LABELS: Record<Notification["kind"], string> = {
  alert: "Alert",
  approval: "Needs a decision",
  decision: "Decision",
  share: "Shared with you",
  refresh: "Refresh",
};

/** The bell in the top bar: alerts, decisions on the member's data, and things waiting for them. */
export function NotificationsBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const notifications = useQuery(notificationsQuery());
  const unread = notifications.data?.unread ?? 0;
  const items = notifications.data?.items ?? [];

  const markRead = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    onError: notifyError("Those notifications could not be marked as read."),
  });

  function openItem(item: Notification) {
    if (!item.read) markRead.mutate([item.id]);
    setOpen(false);
    // Links come from the API as paths in this app, so they go to the router as they are.
    if (item.link) router.history.push(item.link);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="relative rounded-full p-2 text-muted-foreground hover:bg-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell className="size-5" strokeWidth={1.5} aria-hidden />
          {unread > 0 ? (
            <span
              className="num absolute -top-0.5 -right-0.5 min-w-4 rounded-full bg-signal-strong px-1 text-center text-[10px] leading-4 font-semibold text-background"
              aria-hidden
            >
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-50 w-[min(24rem,calc(100vw-2rem))] border border-border bg-surface-raised shadow-lg outline-none"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="text-sm font-medium">Notifications</p>
            {unread > 0 ? (
              <button
                type="button"
                className="text-xs text-signal-strong underline-offset-4 hover:underline disabled:opacity-60"
                disabled={markRead.isPending}
                onClick={() => markRead.mutate(undefined)}
              >
                Mark all as read
              </button>
            ) : null}
          </div>
          {notifications.isError ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Notifications could not be loaded. They will be checked again shortly.
            </p>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Nothing yet. Alerts, decisions on your data and things waiting for you appear here.
            </p>
          ) : (
            <ul className="max-h-[min(28rem,70vh)] divide-y divide-border overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none",
                      !item.read && "bg-accent/25",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        item.read ? "bg-transparent" : "bg-signal-strong",
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">
                        {KIND_LABELS[item.kind]} · {item.when}
                        {item.read ? "" : <span className="sr-only"> · unread</span>}
                      </span>
                      <span className="mt-0.5 block text-sm font-medium">{item.title}</span>
                      {item.body ? (
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {item.body}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
