import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Chip, DatePicker, Drawer, Field, Notice, SelectMenu, SignalButton, TextInput } from "@/components";
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
      title="Monitors"
      description="Watch the numbers that matter. When one moves past its band you get an alert, with a plain explanation of what drove it."
      actions={
        <SignalButton onClick={() => setOpen(true)}>
          <Bell className="size-4" strokeWidth={1.75} aria-hidden />
          Watch a metric
        </SignalButton>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-labelledby="alerts-heading">
          <h2 id="alerts-heading" className="font-sans mb-3 text-sm font-medium">
            Recent alerts
          </h2>
          <div className="space-y-3">
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
                {alert.message} · {alert.when}
              </Notice>
            ))}
          </div>
        </section>

        <section aria-labelledby="watching-heading">
          <h2 id="watching-heading" className="font-sans mb-3 text-sm font-medium">
            What is being watched
          </h2>
          <ul className="divide-y divide-border border border-border bg-surface-raised">
            {monitors.map((monitor) => (
              <li key={monitor.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{monitor.name}</p>
                  <p className="text-sm text-muted-foreground">{monitor.threshold}</p>
                  <p className="num mt-1 text-xs text-muted-foreground">
                    {monitor.metric} · checked {monitor.cadence.toLowerCase()}, last {monitor.lastChecked} · owner {monitor.owner}
                  </p>
                </div>
                <Chip tone={monitor.status === "watching" ? "ok" : "neutral"}>{monitor.status}</Chip>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Drawer open={open} title="Watch a metric" onClose={() => setOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            toast.success("Monitor created", { description: "Alerts will appear here and can also go to Slack or Teams." });
            setOpen(false);
            setName("");
          }}
        >
          <Field label="Name">
            <TextInput value={name} onChange={(event) => setName(event.target.value)} placeholder="Gauteng enrolments" required />
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
          <Field label="Alert when" hint="An alert is raised when the metric moves past this band.">
            <TextInput placeholder="It changes by more than 15% in a month" />
          </Field>
          <SignalButton type="submit">Start watching</SignalButton>
        </form>
      </Drawer>
    </MainLayout>
  );
}
