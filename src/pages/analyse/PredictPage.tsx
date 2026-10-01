import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, LoaderCircle } from "lucide-react";
import {
  Chip,
  HelpTip,
  Notice,
  QuietButton,
  SelectMenu,
  SideRail,
  SignalButton,
  SplitLayout,
} from "@/components";
import { AnalyseTabs, analysisCatalogueQuery } from "@/features/analysis";
import { hasPermission, useCurrentUser } from "@/features/auth";
import {
  exportPrediction,
  predictionHistoryQuery,
  predictionModelsQuery,
  scoreCohort,
  type Prediction,
} from "@/features/predictions";
import { MainLayout } from "@/layouts/MainLayout";
import { errorMessage } from "@/lib/api";
import { notifyError } from "@/lib/notify";

const ANY = "__any__";

export function PredictPage() {
  const search = useSearch({ from: "/analyse/predict" });
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const mayPredict = hasPermission(user, "predict");
  const models = useQuery({ ...predictionModelsQuery(), enabled: mayPredict });
  const catalogue = useQuery({ ...analysisCatalogueQuery(), enabled: mayPredict });
  const history = useQuery({ ...predictionHistoryQuery(), enabled: mayPredict });

  const [modelId, setModelId] = useState("");
  const [cohort, setCohort] = useState<Record<string, string>>({});
  const [shown, setShown] = useState<Prediction | null>(null);

  // Prefer a model for the dataset the member arrived with, then the newest one.
  const available = models.data ?? [];
  const model =
    available.find((item) => item.id === modelId) ??
    available.find((item) => item.datasetId === search.dataset) ??
    available[0];
  const dataset = catalogue.data?.datasets.find((item) => item.id === model?.datasetId);
  const prediction = shown ?? history.data?.[0] ?? null;

  const score = useMutation({
    mutationFn: () => {
      if (!model) throw new Error("Choose a model.");
      return scoreCohort(model.id, cohort);
    },
    onSuccess: async (result) => {
      setShown(result);
      await Promise.all(
        [["predictions", "history"], ["auth"], ["audit"]].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
    onError: notifyError("The cohort could not be scored."),
  });

  const download = useMutation({
    mutationFn: (format: "pdf" | "xlsx") => {
      if (!prediction) throw new Error("Score a cohort first.");
      return exportPrediction(prediction.id, format);
    },
    onError: notifyError("The export could not be made."),
  });

  const loading = mayPredict && (models.isPending || catalogue.isPending);
  const failed = models.error ?? catalogue.error;

  return (
    <MainLayout
      title="Predict an outcome"
      description="Choose an outcome and a cohort. You get a score from 0 to 100 and the ranked factors behind it, in plain language."
      toolbar={<AnalyseTabs context={{ ...search, method: "predict" }} />}
    >
      {!mayPredict ? (
        <Notice tone="warn" title="Your role cannot score predictions">
          Scores are available to analysts, practitioners, stewards, executives and model curators.
        </Notice>
      ) : loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <LoaderCircle className="size-4 animate-spin" strokeWidth={2} aria-hidden />
          Loading the models…
        </p>
      ) : failed ? (
        <Notice tone="signal" title="The models did not load">
          {errorMessage(failed)}
        </Notice>
      ) : !model ? (
        <Notice title="No model is available yet">
          A Model Curator publishes a documented model for an approved dataset. Until then there is
          nothing to score with.
        </Notice>
      ) : (
        <SplitLayout
          railWidth="22rem"
          railFirstOnMobile
          rail={
            <SideRail label="What to predict" className="panel flex flex-col p-6">
              <h2 className="font-display text-xl">What should we predict?</h2>
              <div className="mt-4 space-y-4">
                <SelectMenu
                  label="Outcome"
                  value={model.id}
                  onValueChange={(next) => {
                    setModelId(next);
                    setCohort({});
                  }}
                  options={available.map((item) => ({
                    value: item.id,
                    label: `${item.outcome} · ${item.label}`,
                  }))}
                />
                {dataset ? (
                  dataset.dimensions.map((dimension) => (
                    <SelectMenu
                      key={dimension.id}
                      label={`For which ${dimension.label.toLowerCase()}`}
                      value={cohort[dimension.id] ?? ANY}
                      onValueChange={(value) =>
                        setCohort((current) => {
                          const { [dimension.id]: _previous, ...rest } = current;
                          return value === ANY ? rest : { ...rest, [dimension.id]: value };
                        })
                      }
                      options={[
                        { value: ANY, label: `Every ${dimension.label.toLowerCase()}` },
                        ...dimension.values.map((value) => ({ value, label: value })),
                      ]}
                    />
                  ))
                ) : (
                  <p className="text-sm text-warning">
                    The data this model reads is not approved for you, so it cannot be scored.
                  </p>
                )}
              </div>
              <SignalButton
                className="mt-5 w-fit"
                disabled={score.isPending || !dataset}
                onClick={() => score.mutate()}
              >
                {score.isPending ? "Scoring…" : "Score this cohort"}
              </SignalButton>
              <p className="mt-3 text-xs text-muted-foreground">{model.description}</p>
              <div className="mt-5">
                <HelpTip title="How the score is made">
                  A documented, deterministic model weighs each factor. Each factor compares the
                  cohort with every other group in the same data. Scores describe cohorts, never
                  individual people, and every score records the model version that produced it.
                </HelpTip>
              </div>
              {history.data && history.data.length > 0 ? (
                <div className="mt-6 border-t border-border pt-4">
                  <h3 className="font-sans text-sm font-medium">Your recent scores</h3>
                  <ul className="mt-2 space-y-1.5">
                    {history.data.slice(0, 6).map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-current={prediction?.id === item.id ? "true" : undefined}
                          className="flex w-full items-baseline justify-between gap-3 text-left text-sm underline-offset-4 hover:underline aria-[current]:font-medium"
                          onClick={() => setShown(item)}
                        >
                          <span className="min-w-0">{item.subject.replace("Cohort · ", "")}</span>
                          <span className="num shrink-0 text-xs text-muted-foreground">
                            {item.score} · {item.when.toLowerCase()}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </SideRail>
          }
        >
          {prediction ? (
            <ScorePanel
              prediction={prediction}
              exporting={download.isPending}
              onExport={(format) => download.mutate(format)}
            />
          ) : (
            <section className="panel p-8 text-center" aria-label="Score">
              <p className="font-display text-xl">No score yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Choose a cohort and score it. You will see the score, its band and what drives it.
              </p>
            </section>
          )}
        </SplitLayout>
      )}
    </MainLayout>
  );
}

function ScorePanel({
  prediction,
  exporting,
  onExport,
}: {
  prediction: Prediction;
  exporting: boolean;
  onExport: (format: "pdf" | "xlsx") => void;
}) {
  // The factors that moved the score most come first.
  const factors = [...prediction.factors].sort(
    (a, b) => Math.abs(b.contribution) - Math.abs(a.contribution),
  );
  const weights = prediction.factors.reduce((sum, factor) => sum + factor.weight, 0);

  return (
    <section className="panel" aria-label="Score" aria-live="polite">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-6">
        <div>
          <p className="text-xs text-muted-foreground">
            {prediction.subject} · {prediction.modelVersion} · scored{" "}
            {prediction.when.toLowerCase()}
          </p>
          <p className="mt-1 text-sm">{prediction.outcome}</p>
          <p className="mt-2 flex flex-wrap items-baseline gap-3">
            <span className="num font-display text-6xl font-light">{prediction.score}</span>
            <span className="text-sm text-muted-foreground">out of 100 · {prediction.band}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuietButton disabled={exporting} onClick={() => onExport("pdf")}>
            Export PDF
          </QuietButton>
          <QuietButton disabled={exporting} onClick={() => onExport("xlsx")}>
            Export Excel
          </QuietButton>
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-sans text-sm font-medium">What drives the score</h2>
          <Chip>Weights add up to {weights.toFixed(2)}</Chip>
        </div>
        <ul className="mt-4 grid gap-x-8 gap-y-5 xl:grid-cols-2">
          {factors.map((factor) => {
            const raises = factor.contribution >= 0;
            return (
              <li key={factor.key}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    {raises ? (
                      <ArrowUpRight
                        className="size-4 shrink-0 text-success"
                        strokeWidth={1.75}
                        aria-label="Raises the score"
                      />
                    ) : (
                      <ArrowDownRight
                        className="size-4 shrink-0 text-signal-strong"
                        strokeWidth={1.75}
                        aria-label="Lowers the score"
                      />
                    )}
                    {factor.name}
                  </p>
                  <p className="num shrink-0 text-sm text-muted-foreground">
                    {raises ? "+" : "−"}
                    {Math.abs(factor.contribution).toFixed(1)} pts · weight{" "}
                    {Math.round(factor.weight * 100)}%
                  </p>
                </div>
                <div className="mt-1.5 h-1 bg-surface-alt" aria-hidden>
                  <div className="h-1 bg-signal" style={{ width: `${factor.weight * 100}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{factor.reading}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{factor.why}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
