import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Brain } from "lucide-react";
import { Chip, Drawer, EmptyState, SignalButton } from "@/components";
import { hasPermission, useCurrentUser } from "@/features/auth";
import { TrainModelForm, pct } from "@/features/models";
import { predictionModelsQuery, type PredictionModel } from "@/features/predictions";
import { MainLayout } from "@/layouts/MainLayout";

const statusTone = {
  draft: "warn",
  active: "ok",
  retired: "neutral",
  rejected: "neutral",
} as const;
const statusLabel = {
  draft: "Waiting for review",
  active: "Approved · in use",
  retired: "Retired",
  rejected: "Rejected",
};

function ModelRow({ model }: { model: PredictionModel }) {
  return (
    <li className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="font-medium">
          <Link
            to="/models/$modelId"
            params={{ modelId: model.id }}
            className="underline-offset-4 hover:underline"
          >
            {model.label}
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">{model.outcome}</p>
        <p className="num mt-1 text-xs text-muted-foreground">
          {model.kind === "trained"
            ? `${model.algorithm === "logistic" ? "Logistic regression" : "Gradient-boosted trees"} · test ROC-AUC ${model.metrics?.rocAuc?.toFixed(3) ?? "—"} · recall ${pct(model.metrics?.recall)}`
            : "Documented heuristic: weighted factors, nothing learned"}
          {model.metrics?.liftOverHeuristic != null
            ? ` · ${model.metrics.liftOverHeuristic >= 0 ? "+" : ""}${model.metrics.liftOverHeuristic.toFixed(3)} AUC over the heuristic`
            : ""}
          {(model.trainedBy ?? model.createdBy)
            ? ` · by ${model.trainedBy ?? model.createdBy}`
            : ""}
          {model.approvedBy ? ` · approved by ${model.approvedBy}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {model.fairnessFlagged ? <Chip tone="signal">Fairness flag</Chip> : null}
        {model.driftStatus === "drift" ? <Chip tone="signal">Drifted</Chip> : null}
        <Chip tone={statusTone[model.status]}>{statusLabel[model.status]}</Chip>
      </div>
    </li>
  );
}

/** Every model version: who built it, how well it does against its baselines, and who approved it. */
export function ModelsPage() {
  const models = useSuspenseQuery(predictionModelsQuery()).data;
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const mayTrain = hasPermission(user, "curate_models");
  const waiting = models.filter((m) => m.status === "draft");
  const others = models.filter((m) => m.status !== "draft");

  return (
    <MainLayout
      title="Models"
      description="Predictive models are trained on approved data, tested on records they never saw, audited for fairness, and approved by someone other than their author before anyone can use them."
      actions={
        mayTrain ? (
          <SignalButton onClick={() => setOpen(true)}>
            <Brain className="size-4" strokeWidth={1.75} aria-hidden />
            Train a model
          </SignalButton>
        ) : null
      }
    >
      {models.length === 0 ? (
        <EmptyState
          title="No models yet"
          body="A Model Curator trains a model for an outcome on an approved dataset; a second person reviews it before it is used."
        />
      ) : (
        <div className="space-y-8">
          {waiting.length > 0 ? (
            <section aria-labelledby="waiting-heading">
              <h2 id="waiting-heading" className="mb-3 text-sm font-medium">
                Waiting for review
              </h2>
              <ul className="divide-y divide-border border border-border bg-surface-raised">
                {waiting.map((model) => (
                  <ModelRow key={model.id} model={model} />
                ))}
              </ul>
            </section>
          ) : null}
          <section aria-labelledby="all-heading">
            <h2 id="all-heading" className="mb-3 text-sm font-medium">
              In use and earlier versions
            </h2>
            <ul className="divide-y divide-border border border-border bg-surface-raised">
              {others.map((model) => (
                <ModelRow key={model.id} model={model} />
              ))}
            </ul>
          </section>
        </div>
      )}
      <Drawer open={open} title="Train a model" onClose={() => setOpen(false)}>
        <TrainModelForm onTrained={() => setOpen(false)} />
      </Drawer>
    </MainLayout>
  );
}
