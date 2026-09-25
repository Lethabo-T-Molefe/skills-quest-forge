import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Chip, Drawer, Field, inputClass, MediaFrame, Panel, QuietButton, SignalButton } from "@/components";
import { media } from "@/config/media";
import { useAlerts, useMonitors } from "@/features/monitors";
import { MainLayout } from "@/layouts/MainLayout";

export function MonitorsPage() {
  const monitors = useMonitors();
  const alerts = useAlerts();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  return (
    <MainLayout
      label="watch the numbers that matter"
      title="Monitors"
      intro="Track a metric over time. When it moves in a meaningful way, the platform raises an alert and can explain the main contributing factors in plain language."
      actions={<SignalButton onClick={() => setOpen(true)}>Watch a metric</SignalButton>}
    >
      <MediaFrame {...media.waiting} ratio="16 / 7" className="mb-8" />
      <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
        <div className="space-y-3">
          {monitors.map((monitor) => (
            <Panel key={monitor.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="label-paren">({monitor.cadence.toLowerCase()})</p>
                  <h2 className="heading-2 mt-1">{monitor.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{monitor.threshold}</p>
                </div>
                <Chip tone={monitor.status === "watching" ? "signal" : "neutral"}>{monitor.status}</Chip>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip>{monitor.metric}</Chip>
                <Chip>Owner · {monitor.owner}</Chip>
                <Chip>Checked {monitor.lastChecked}</Chip>
              </div>
            </Panel>
          ))}
        </div>

        <Panel>
          <h2 className="heading-2">Recent alerts</h2>
          <ul className="mt-4 space-y-4">
            {alerts.map((alert) => (
              <li key={alert.id} className="border-l-2 border-signal pl-4">
                <p className="text-sm font-medium">{alert.metric}</p>
                <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                <Link
                  to="/monitors/$alertId"
                  params={{ alertId: alert.id }}
                  className="mt-2 inline-block text-sm text-signal-strong underline-offset-4 hover:underline"
                >
                  Explain why
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Drawer open={open} title="Watch a metric" onClose={() => setOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            toast.success("Monitor created. Alerts will land here and can be sent to Slack or Teams.");
            setOpen(false);
            setName("");
          }}
        >
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Metric">
            <select className={inputClass}>
              <option>Active learners</option>
              <option>Completion rate</option>
              <option>Average fee paid</option>
              <option>Regional revenue</option>
            </select>
          </Field>
          <Field label="Threshold" hint="The platform raises an alert when the metric moves past this band.">
            <input className={inputClass} placeholder="Alert if change exceeds 15%" />
          </Field>
          <SignalButton type="submit">Start watching</SignalButton>
        </form>
      </Drawer>
    </MainLayout>
  );
}
