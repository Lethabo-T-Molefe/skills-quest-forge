import { useParams } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BackLink, Chip, Notice, TabsContent, TabsList, TabsRoot, TabsTrigger } from "@/components";
import {
  ApprovalPanel,
  DriftPanel,
  FairnessTable,
  FeaturePlanTable,
  MetricsPanel,
  modelDetailQuery,
  pct,
} from "@/features/models";
import { MainLayout } from "@/layouts/MainLayout";

const statusTone = {
  draft: "warn",
  active: "ok",
  retired: "neutral",
  rejected: "neutral",
} as const;

/** One trained model version: its card, performance, fairness, columns, drift and the decision on it. */
export function ModelDetailPage() {
  const { modelId } = useParams({ from: "/models/$modelId" });
  const model = useSuspenseQuery(modelDetailQuery(modelId)).data;
  const card = model.card;

  return (
    <MainLayout
      back={<BackLink to="/models">All models</BackLink>}
      title={model.label}
      description={card?.predicts ?? model.outcome}
    >
      <div className="flex flex-wrap gap-2">
        <Chip tone={statusTone[model.status]}>
          {model.status === "draft"
            ? "Waiting for review"
            : model.status === "active"
              ? "Approved · in use"
              : model.status}
        </Chip>
        {card ? <Chip>{card.algorithm}</Chip> : null}
        {model.trainedBy ? <Chip>Trained by {model.trainedBy}</Chip> : null}
        {model.approvedBy ? <Chip tone="ok">Approved by {model.approvedBy}</Chip> : null}
        {model.fairnessFlagged ? <Chip tone="signal">Fairness flag</Chip> : null}
        {model.driftStatus === "drift" ? <Chip tone="signal">Drifted</Chip> : null}
      </div>

      <TabsRoot
        defaultValue={model.status === "draft" && model.canApprove ? "decision" : "overview"}
        className="mt-6"
      >
        <TabsList aria-label="About this model">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="fairness">Fairness</TabsTrigger>
          <TabsTrigger value="columns">Columns</TabsTrigger>
          <TabsTrigger value="drift">Drift</TabsTrigger>
          <TabsTrigger value="decision">Decision</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="panel mt-4 max-w-4xl space-y-5 p-5">
          {card ? (
            <>
              <section>
                <h2 className="text-sm font-medium">What it is for</h2>
                <p className="mt-1 text-sm">{card.intendedUse}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {card.notFor.map((item) => (
                    <li key={item}>Not for: {item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="text-sm font-medium">What it learned from</h2>
                <p className="num mt-1 text-sm text-muted-foreground">
                  {card.data.dataset} (version {card.data.version}):{" "}
                  {card.data.labelled.toLocaleString()} records with a known outcome, of which{" "}
                  {pct(card.data.prevalence)} had it. Trained on{" "}
                  {card.data.trainRows.toLocaleString()} and tested on{" "}
                  {card.data.testRows.toLocaleString()} it never saw.
                </p>
              </section>
              <section>
                <h2 className="text-sm font-medium">How good it is</h2>
                <p className="num mt-1 text-sm text-muted-foreground">
                  Test ROC-AUC {card.performance.rocAuc.toFixed(3)} · PR-AUC{" "}
                  {card.performance.prAuc.toFixed(3)}
                  {card.performance.liftOverHeuristic !== null
                    ? ` · ${card.performance.liftOverHeuristic >= 0 ? "+" : ""}${card.performance.liftOverHeuristic.toFixed(3)} over the documented heuristic`
                    : ""}
                </p>
              </section>
              {card.warnings.length > 0 ? (
                <Notice tone="warn" title="Check before approving">
                  <ul className="list-disc space-y-1 pl-4">
                    {card.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </Notice>
              ) : null}
              <section>
                <h2 className="text-sm font-medium">Limitations</h2>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {card.limitations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm">{card.humanInTheLoop}</p>
              </section>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">This version has no model card.</p>
          )}
        </TabsContent>

        <TabsContent value="performance" className="panel mt-4 p-5">
          {model.fullMetrics && card ? (
            <MetricsPanel
              metrics={model.fullMetrics}
              baselines={card.baselines}
              threshold={model.threshold}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No measurements recorded.</p>
          )}
        </TabsContent>

        <TabsContent value="fairness" className="panel mt-4 max-w-5xl p-5">
          <FairnessTable fairness={model.fairness} />
        </TabsContent>

        <TabsContent value="columns" className="panel mt-4 max-w-5xl p-5">
          {model.features ? (
            <FeaturePlanTable plan={model.features} importance={card?.importance} />
          ) : null}
        </TabsContent>

        <TabsContent value="drift" className="panel mt-4 max-w-3xl p-5">
          <DriftPanel drift={model.drift} checkedAt={model.lastScoring?.at} />
        </TabsContent>

        <TabsContent value="decision" className="panel mt-4 max-w-3xl p-5">
          <ApprovalPanel model={model} />
        </TabsContent>
      </TabsRoot>
    </MainLayout>
  );
}
