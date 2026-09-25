import { useState } from "react";
import { toast } from "sonner";
import { Chip, Drawer, Field, inputClass, MediaFrame, Panel, QuietButton, SignalButton, textareaClass } from "@/components";
import { media } from "@/config/media";
import { canDefineMetrics, useCurrentUser } from "@/features/auth";
import { useMetricDefinitions } from "@/features/metrics";
import { MainLayout } from "@/layouts/MainLayout";

export function SemanticPage() {
  const metrics = useMetricDefinitions();
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);

  return (
    <MainLayout
      label="define once, use everywhere"
      title="Semantic layer"
      intro="A metric such as active learner is defined once. Every answer, dashboard and notebook uses the same definition. That is why the assistant can refuse rather than guess when a request does not map to a defined metric."
      actions={
        canDefineMetrics(user) ? (
          <SignalButton onClick={() => setOpen(true)}>Define a metric</SignalButton>
        ) : (
          <QuietButton disabled>Only stewards and practitioners can publish metrics</QuietButton>
        )
      }
    >
      <MediaFrame {...media.hands} ratio="16 / 7" className="mb-8" />
      <div className="space-y-3">
        {metrics.map((metric) => (
          <Panel key={metric.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="label-paren">({metric.grain})</p>
                <h2 className="heading-2 mt-1">{metric.name}</h2>
              </div>
              <Chip tone={metric.status === "published" ? "ok" : "warn"}>{metric.status}</Chip>
            </div>
            <p className="mt-3 max-w-[68ch] text-sm text-muted-foreground">{metric.description}</p>
            <pre className="mt-4 overflow-x-auto bg-surface-inverse p-4 font-mono text-[13px] text-background">
              {metric.expression}
            </pre>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip>Owner · {metric.owner}</Chip>
              <Chip>Used by {metric.usedBy} answers</Chip>
            </div>
          </Panel>
        ))}
      </div>

      <Drawer open={open} title="Define a shared metric" onClose={() => setOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            toast.success("Draft metric saved. A Steward must publish it before the assistant can use it.");
            setOpen(false);
          }}
        >
          <Field label="Name">
            <input className={inputClass} placeholder="Active facilitators" />
          </Field>
          <Field label="Plain-language definition">
            <textarea className={textareaClass} rows={3} placeholder="A facilitator with a session in the last 14 days" />
          </Field>
          <Field label="Expression">
            <textarea className={textareaClass} rows={3} placeholder="COUNT(DISTINCT facilitator_id) WHERE ..." />
          </Field>
          <SignalButton type="submit">Save as draft</SignalButton>
        </form>
      </Drawer>
    </MainLayout>
  );
}
