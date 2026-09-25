import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Chip,
  DatePicker,
  Drawer,
  Field,
  Notice,
  Panel,
  SelectMenu,
  SignalButton,
  TextInput,
} from "@/components";
import { useAlerts, useMonitors } from "@/features/monitors";
import { MainLayout } from "@/layouts/MainLayout";

export function MonitorsPage() {
  const monitors = useMonitors();
  const alerts = useAlerts();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("Active learners");
  const [since, setSince] = useState<Date | undefined>();

  return (
    <MainLayout
      label="watch the numbers that matter"
      title="Monitors"
      intro="Track a metric over time. When it moves in a meaningful way, the platform raises an alert and can explain the main contributing factors in plain language."
      actions={<SignalButton onClick={() => setOpen(true)}>Watch a metric</SignalButton>}
    >
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

        <div className="space-y-3">
          <h2 className="heading-2">Recent alerts</h2>
          {alerts.map((alert) => (
            <Notice
              key={alert.id}
              tone={alert.severity === "high" ? "signal" : "warn"}
              title={alert.metric}
              action={
                <Link
                  to="/monitors/$alertId"
                  params={{ alertId: alert.id }}
                  className="text-sm text-signal-strong underline-offset-4 hover:underline"
                >
                  Explain why
                </Link>
              }
            >
              {alert.message}
            </Notice>
          ))}
        </div>
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
            <TextInput value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <SelectMenu
            label="Metric"
            value={metric}
            onValueChange={setMetric}
            options={[
              { value: "Active learners", label: "Active learners" },
              { value: "Completion rate", label: "Completion rate" },
              { value: "Average fee paid", label: "Average fee paid" },
              { value: "Regional revenue", label: "Regional revenue" },
            ]}
          />
          <DatePicker label="Watch from" value={since} onChange={setSince} />
          <Field label="Threshold" hint="The platform raises an alert when the metric moves past this band.">
            <TextInput placeholder="Alert if change exceeds 15%" />
          </Field>
          <SignalButton type="submit">Start watching</SignalButton>
        </form>
      </Drawer>
    </MainLayout>
  );
}
