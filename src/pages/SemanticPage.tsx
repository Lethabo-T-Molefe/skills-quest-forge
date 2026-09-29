import { useState } from "react";
import { toast } from "sonner";
import { Chip, Drawer, Field, SignalButton, TextArea, TextInput } from "@/components";
import { canDefineMetrics, useCurrentUser } from "@/features/auth";
import { useMetricDefinitions } from "@/features/metrics";
import { MainLayout } from "@/layouts/MainLayout";

export function SemanticPage() {
  const metrics = useMetricDefinitions();
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const mayDefine = canDefineMetrics(user);

  return (
    <MainLayout
      title="Metrics"
      description="Each metric is defined once and used everywhere: answers, dashboards, notebooks and monitors. That is why the numbers agree, and why the assistant can refuse rather than guess."
      actions={
        mayDefine ? (
          <SignalButton onClick={() => setOpen(true)}>Define a metric</SignalButton>
        ) : (
          <p className="text-xs text-muted-foreground">Stewards and practitioners can define new metrics.</p>
        )
      }
    >
      <div className="grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-2">
        {metrics.map((metric) => (
          <article key={metric.id} className="flex flex-col bg-surface-raised p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">{metric.name}</h2>
                <p className="text-xs text-muted-foreground">Measured per {metric.grain}</p>
              </div>
              <Chip tone={metric.status === "published" ? "ok" : "warn"}>{metric.status}</Chip>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{metric.description}</p>
            <pre className="mt-3 overflow-x-auto bg-surface-inverse px-3 py-2 font-mono text-[12px] text-background">
              {metric.expression}
            </pre>
            <p className="num mt-auto pt-3 text-xs text-muted-foreground">
              Owner {metric.owner} · used by {metric.usedBy} answers and charts
            </p>
          </article>
        ))}
      </div>

      <Drawer open={open} title="Define a shared metric" onClose={() => setOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            toast.success("Draft metric saved", { description: "A steward must publish it before the assistant can use it." });
            setOpen(false);
          }}
        >
          <Field label="Name">
            <TextInput placeholder="Active facilitators" required />
          </Field>
          <Field label="What it means, in plain words">
            <TextArea rows={3} placeholder="A facilitator with a session in the last 14 days" />
          </Field>
          <Field label="Expression" hint="The calculation, as SQL.">
            <TextArea rows={3} placeholder="COUNT(DISTINCT facilitator_id) WHERE ..." />
          </Field>
          <SignalButton type="submit">Save as a draft</SignalButton>
        </form>
      </Drawer>
    </MainLayout>
  );
}
