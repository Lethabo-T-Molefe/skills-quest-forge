import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Chip, ConfirmDialog, Drawer, Notice, QuietButton, SignalButton } from "@/components";
import { hasPermission, useCurrentUser } from "@/features/auth";
import {
  MonitorForm,
  checkMonitor,
  deleteMonitor,
  refreshMonitors,
  setMonitorStatus,
  useAlerts,
  useMonitors,
  type Monitor,
} from "@/features/monitors";
import { MainLayout } from "@/layouts/MainLayout";
import { notifyError } from "@/lib/notify";

const smallButton = "px-3 py-1.5 text-xs";

export function MonitorsPage() {
  const monitors = useMonitors();
  const alerts = useAlerts();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<Monitor | null>(null);
  const mayManage = hasPermission(user, "manage_monitors");

  const check = useMutation({
    mutationFn: (monitor: Monitor) => checkMonitor(monitor.id),
    onSuccess: async (result, monitor) => {
      await refreshMonitors(queryClient);
      if (result.triggered) {
        toast.warning(`${monitor.name}: alert raised`, { description: result.message });
      } else {
        toast.success(`${monitor.name}: inside its limits`, { description: result.message });
      }
    },
    onError: notifyError("The monitor could not be checked."),
  });

  const toggle = useMutation({
    mutationFn: (monitor: Monitor) =>
      setMonitorStatus(monitor.id, monitor.status === "watching" ? "paused" : "watching"),
    onSuccess: () => refreshMonitors(queryClient),
    onError: notifyError("The monitor could not be changed."),
  });

  const remove = useMutation({
    mutationFn: (monitor: Monitor) => deleteMonitor(monitor.id),
    onSuccess: async (_result, monitor) => {
      await refreshMonitors(queryClient);
      toast.success(`Stopped watching ${monitor.name}`);
    },
    onError: notifyError("The monitor could not be deleted."),
  });

  return (
    <MainLayout
      title="Monitors"
      description="Watch the numbers that matter. When one moves past its limit you get an alert, with a plain explanation of what drove it."
      actions={
        mayManage ? (
          <SignalButton onClick={() => setOpen(true)}>
            <Bell className="size-4" strokeWidth={1.75} aria-hidden />
            Watch a metric
          </SignalButton>
        ) : null
      }
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-labelledby="alerts-heading">
          <h2 id="alerts-heading" className="font-sans mb-3 text-sm font-medium">
            Recent alerts
          </h2>
          {alerts.length === 0 ? (
            <p className="border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
              No alerts. Every watched metric is inside its limits.
            </p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Notice
                  key={alert.id}
                  tone={alert.acknowledged ? "info" : alert.severity === "high" ? "signal" : "warn"}
                  title={alert.metric}
                  action={
                    <Link
                      to="/monitors/$alertId"
                      params={{ alertId: alert.id }}
                      className="text-sm text-signal-strong underline-offset-4 hover:underline"
                    >
                      Explain why<span className="sr-only">: {alert.metric}</span>
                    </Link>
                  }
                >
                  {alert.message} · {alert.when}
                  {alert.acknowledged ? " · acknowledged" : ""}
                </Notice>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="watching-heading">
          <h2 id="watching-heading" className="font-sans mb-3 text-sm font-medium">
            What is being watched
          </h2>
          {monitors.length === 0 ? (
            <p className="border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
              Nothing is being watched yet.
              {mayManage ? " Choose a metric and the change that is worth an alert." : ""}
            </p>
          ) : (
            <ul className="divide-y divide-border border border-border bg-surface-raised">
              {monitors.map((monitor) => {
                const mine = monitor.ownerId === user.id || user.roleId === "admin";
                return (
                  <li key={monitor.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{monitor.name}</p>
                        <p className="text-sm text-muted-foreground">{monitor.threshold}</p>
                        <p className="num mt-1 text-xs text-muted-foreground">
                          {monitor.metric} · checked {monitor.cadence.toLowerCase()}, last{" "}
                          {monitor.lastChecked.toLowerCase()} · owner {monitor.owner}
                          {monitor.notifySlack ? " · also sent to Slack" : ""}
                        </p>
                      </div>
                      <Chip
                        tone={
                          !monitor.available
                            ? "warn"
                            : monitor.status === "watching"
                              ? "ok"
                              : "neutral"
                        }
                      >
                        {!monitor.available ? "data unavailable" : monitor.status}
                      </Chip>
                    </div>
                    {mine ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <QuietButton
                          className={smallButton}
                          disabled={check.isPending || !monitor.available}
                          onClick={() => check.mutate(monitor)}
                        >
                          {check.isPending && check.variables?.id === monitor.id
                            ? "Checking…"
                            : "Check now"}
                        </QuietButton>
                        <QuietButton
                          className={smallButton}
                          disabled={toggle.isPending}
                          onClick={() => toggle.mutate(monitor)}
                        >
                          {monitor.status === "watching" ? "Pause" : "Resume"}
                        </QuietButton>
                        <QuietButton className={smallButton} onClick={() => setRemoving(monitor)}>
                          Delete
                        </QuietButton>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <Drawer open={open} title="Watch a metric" onClose={() => setOpen(false)}>
        <MonitorForm onCreated={() => setOpen(false)} />
      </Drawer>

      <ConfirmDialog
        open={removing !== null}
        title={`Stop watching ${removing?.name ?? "this metric"}?`}
        confirmLabel="Delete the monitor"
        onConfirm={() => {
          if (removing) remove.mutate(removing);
        }}
        onClose={() => setRemoving(null)}
      >
        The monitor is removed. Alerts it has already raised stay in the audit trail.
      </ConfirmDialog>
    </MainLayout>
  );
}
