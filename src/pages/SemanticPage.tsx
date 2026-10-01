import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, ConfirmDialog, Drawer, EmptyState, QuietButton, SignalButton } from "@/components";
import { canDefineMetrics, canPublishMetrics, useCurrentUser } from "@/features/auth";
import {
  DefineMetricForm,
  deleteMetric,
  publishMetric,
  refreshMetrics,
  unpublishMetric,
  useMetricDefinitions,
  type MetricDefinition,
} from "@/features/metrics";
import { MainLayout } from "@/layouts/MainLayout";
import { notifyError } from "@/lib/notify";

const smallButton = "px-3 py-1.5 text-xs";

export function SemanticPage() {
  const metrics = useMetricDefinitions();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<MetricDefinition | null>(null);
  const mayDefine = canDefineMetrics(user);
  const mayPublish = canPublishMetrics(user);

  const setStatus = useMutation({
    mutationFn: (metric: MetricDefinition) =>
      metric.status === "published" ? unpublishMetric(metric.id) : publishMetric(metric.id),
    onSuccess: async (metric) => {
      await refreshMetrics(queryClient);
      toast.success(
        metric.status === "published" ? `${metric.name} published` : `${metric.name} unpublished`,
        {
          description:
            metric.status === "published"
              ? "Answers, charts and monitors can now use it."
              : "It is a draft again and no longer offered for analysis.",
        },
      );
    },
    onError: notifyError("The metric could not be changed."),
  });

  const remove = useMutation({
    mutationFn: (metric: MetricDefinition) => deleteMetric(metric.id),
    onSuccess: async (_result, metric) => {
      await refreshMetrics(queryClient);
      toast.success(`${metric.name} deleted`);
    },
    onError: notifyError("The metric could not be deleted."),
  });

  return (
    <MainLayout
      title="Metrics"
      description="Each metric is defined once and used everywhere: answers, dashboards, notebooks and monitors. That is why the numbers agree, and why the assistant can refuse rather than guess."
      actions={
        mayDefine ? (
          <SignalButton onClick={() => setOpen(true)}>Define a metric</SignalButton>
        ) : (
          <p className="text-xs text-muted-foreground">
            Stewards and practitioners can define new metrics.
          </p>
        )
      }
    >
      {metrics.length === 0 ? (
        <EmptyState
          title="No shared metrics yet"
          body="A metric is a calculation everyone agrees on, such as completion rate. Define one, and a steward publishes it."
          action={
            mayDefine ? (
              <SignalButton onClick={() => setOpen(true)}>Define a metric</SignalButton>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-2">
          {metrics.map((metric) => {
            const mine = metric.ownerId === user.id;
            return (
              <article
                key={metric.id}
                id={metric.id}
                className="flex scroll-mt-24 flex-col bg-surface-raised p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl">{metric.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      Measured per {metric.grain} · version {metric.version}
                    </p>
                  </div>
                  <Chip tone={metric.status === "published" ? "ok" : "warn"}>{metric.status}</Chip>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{metric.description}</p>
                <pre className="mt-3 overflow-x-auto bg-surface-inverse px-3 py-2 font-mono text-[12px] text-background">
                  {metric.expression}
                </pre>
                <p className="num mt-3 text-xs text-muted-foreground">
                  Owner {metric.owner} · used by {metric.usedBy}{" "}
                  {metric.usedBy === 1 ? "chart, monitor or model" : "charts, monitors and models"}
                  {metric.datasets.length > 0
                    ? ` · applies to ${metric.datasets.length} approved ${metric.datasets.length === 1 ? "dataset" : "datasets"}`
                    : " · no approved dataset has its columns yet"}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  {metric.status === "published" && metric.datasets[0] ? (
                    <Link
                      to="/analyse/build"
                      search={{ dataset: metric.datasets[0], method: "trend", measure: metric.key }}
                      className="mr-auto text-sm text-signal-strong underline-offset-4 hover:underline"
                    >
                      Chart this metric
                    </Link>
                  ) : (
                    <span className="mr-auto" />
                  )}
                  {mayPublish ? (
                    <QuietButton
                      className={smallButton}
                      disabled={setStatus.isPending}
                      onClick={() => setStatus.mutate(metric)}
                    >
                      {metric.status === "published" ? "Unpublish" : "Publish"}
                    </QuietButton>
                  ) : null}
                  {metric.status === "draft" && (mine || mayPublish) ? (
                    <QuietButton className={smallButton} onClick={() => setRemoving(metric)}>
                      Delete
                    </QuietButton>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Drawer open={open} title="Define a shared metric" onClose={() => setOpen(false)}>
        <DefineMetricForm onSaved={() => setOpen(false)} />
      </Drawer>

      <ConfirmDialog
        open={removing !== null}
        title={`Delete ${removing?.name ?? "this metric"}?`}
        confirmLabel="Delete the draft"
        onConfirm={() => {
          if (removing) remove.mutate(removing);
        }}
        onClose={() => setRemoving(null)}
      >
        The draft is removed. Published metrics cannot be deleted while anything uses them.
      </ConfirmDialog>
    </MainLayout>
  );
}
