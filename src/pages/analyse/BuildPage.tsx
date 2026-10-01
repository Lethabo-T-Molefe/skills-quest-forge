import { useEffect, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { BookOpen, Code2, LoaderCircle } from "lucide-react";
import {
  Drawer,
  EmptyState,
  Notice,
  QuietButton,
  SideRail,
  SplitLayout,
  quietButtonClass,
  signalButtonClass,
} from "@/components";
import {
  AnalyseTabs,
  BuildControls,
  MethodGuide,
  ResultView,
  defaultConfig,
  filtersFromSearch,
  getMethod,
  switchDataset,
  switchMethod,
  useAnalysisDatasets,
  useAnalysisResult,
  type AnalysisDataset,
  type BuildConfig,
  type BuildMethodId,
  type MethodId,
} from "@/features/analysis";
import { canRunSql, useCurrentUser } from "@/features/auth";
import { SaveToDashboard } from "@/features/dashboards";
import { useDatasets } from "@/features/datasets";
import { OpenJupyterButton } from "@/features/integrations";
import { MainLayout } from "@/layouts/MainLayout";
import { errorMessage } from "@/lib/api";

function asBuildMethod(method: MethodId | undefined): BuildMethodId | undefined {
  return method && method !== "predict" ? method : undefined;
}

export function BuildPage() {
  const search = useSearch({ from: "/analyse/build" });
  const datasets = useAnalysisDatasets();
  const catalogue = useDatasets();
  const requested = datasets.find((item) => item.id === search.dataset);
  const first = requested ?? datasets[0];
  const notReady =
    search.dataset && !requested ? catalogue.find((item) => item.id === search.dataset) : undefined;

  if (!first) {
    return (
      <MainLayout
        title="Build a chart"
        description="Choose what to measure and how it is calculated. The chart, reading, table and SQL follow every change."
        toolbar={<AnalyseTabs context={search} />}
      >
        <EmptyState
          title="Nothing is ready to analyse yet"
          body="A dataset can be charted once it is cleaned and a steward has approved it."
          action={
            <Link to="/datasets" className={signalButtonClass}>
              See the datasets
            </Link>
          }
        />
      </MainLayout>
    );
  }

  return (
    <Builder
      datasets={datasets}
      first={first}
      requestedId={requested?.id}
      notice={
        notReady
          ? `${notReady.name} is not approved yet, so it cannot be analysed. Showing ${first.name} instead.`
          : search.dataset && !requested
            ? `That dataset is not available to you. Showing ${first.name} instead.`
            : null
      }
    />
  );
}

function Builder({
  datasets,
  first,
  requestedId,
  notice,
}: {
  datasets: AnalysisDataset[];
  first: AnalysisDataset;
  requestedId: string | undefined;
  notice: string | null;
}) {
  const search = useSearch({ from: "/analyse/build" });
  const navigate = useNavigate({ from: "/analyse/build" });
  const user = useCurrentUser();
  const [guideOpen, setGuideOpen] = useState(false);

  const [config, setConfig] = useState<BuildConfig>(() =>
    defaultConfig(first, asBuildMethod(search.method) ?? "compare", {
      measure: search.measure,
      dimension: search.dimension,
      filters: filtersFromSearch(search),
    }),
  );
  const dataset = datasets.find((item) => item.id === config.datasetId) ?? first;

  // Follow the address when another page or a tab links here with a different dataset or method.
  const requestedMethod = asBuildMethod(search.method);
  useEffect(() => {
    setConfig((current) => {
      let next = current;
      const target = datasets.find((item) => item.id === requestedId);
      if (target && target.id !== next.datasetId) next = switchDataset(target, next);
      const active = datasets.find((item) => item.id === next.datasetId);
      if (active && requestedMethod && requestedMethod !== next.method)
        next = switchMethod(active, next, requestedMethod);
      return next;
    });
  }, [datasets, requestedId, requestedMethod]);

  const analysis = useAnalysisResult(config);
  const result = analysis.data;

  function update(next: BuildConfig) {
    setConfig(next);
    if (next.datasetId !== search.dataset || next.method !== search.method) {
      void navigate({ search: { dataset: next.datasetId, method: next.method }, replace: true });
    }
  }

  const method = getMethod(config.method);
  // Dashboards hold comparisons, trends, summaries and contributions; a scatter stays in the builder.
  const canSave = config.method !== "relationship";

  return (
    <MainLayout
      title="Build a chart"
      description="Choose what to measure and how it is calculated. The chart, reading, table and SQL follow every change."
      toolbar={<AnalyseTabs context={{ dataset: config.datasetId, method: config.method }} />}
    >
      {notice ? <p className="mb-5 text-sm text-warning">{notice}</p> : null}
      {/* On a phone the result comes first, so the answer is visible without scrolling past every option. */}
      <SplitLayout
        railWidth="21rem"
        rail={
          <SideRail label="Chart settings" className="panel">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-sans text-sm font-medium">Settings</h2>
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-signal-strong underline-offset-4 hover:underline"
              >
                <BookOpen className="size-3.5" strokeWidth={1.75} aria-hidden />
                Method guide
              </button>
            </div>
            <div className="p-5">
              <BuildControls datasets={datasets} config={config} onChange={update} />
            </div>
          </SideRail>
        }
      >
        {analysis.isError && !result ? (
          <Notice tone="signal" title="This chart could not be worked out">
            {errorMessage(analysis.error)} Change a setting to try again.
          </Notice>
        ) : !result ? (
          <section
            className="panel flex min-h-[28rem] items-center justify-center p-8"
            aria-label="Result"
            aria-busy="true"
          >
            <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
              <LoaderCircle className="size-4 animate-spin" strokeWidth={2} aria-hidden />
              Working out the numbers in your sandbox…
            </p>
          </section>
        ) : (
          <>
            {analysis.isError ? (
              <Notice className="mb-4" tone="signal" title="Those settings could not be worked out">
                {errorMessage(analysis.error)} The last result is still shown below.
              </Notice>
            ) : null}
            {result.rowPolicy ? (
              <p className="mb-3 text-xs text-muted-foreground">
                A row policy limits the rows your role reads from {dataset.name}, so these figures
                cover only what you are permitted to see.
              </p>
            ) : null}
            <ResultView
              result={result}
              // The last result stays on screen, dimmed, while the next one is worked out.
              className={analysis.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}
              actions={
                <>
                  {canRunSql(user) && result.sqlRunnable !== false ? (
                    <Link
                      to="/analyse/code"
                      search={{ sql: result.sql, dataset: config.datasetId, method: config.method }}
                      className={`${quietButtonClass} px-3 py-1.5 text-xs`}
                    >
                      <Code2 className="size-3.5" strokeWidth={1.75} aria-hidden />
                      Open as SQL
                    </Link>
                  ) : null}
                  {result.sqlRunnable !== false ? (
                    <OpenJupyterButton
                      sql={result.sql}
                      title={result.title}
                      className="px-3 py-1.5 text-xs"
                    />
                  ) : null}
                  {canSave ? (
                    <SaveToDashboard
                      title={result.title}
                      config={config}
                      explanation={result.reading}
                    />
                  ) : null}
                </>
              }
            />
          </>
        )}
      </SplitLayout>

      <Drawer
        open={guideOpen}
        title={method?.name ?? "Method guide"}
        onClose={() => setGuideOpen(false)}
      >
        {method ? (
          <>
            <p className="font-display text-lg">{method.question}</p>
            <div className="mt-3">
              <MethodGuide method={method} compact />
            </div>
          </>
        ) : null}
        <QuietButton className="mt-6" onClick={() => setGuideOpen(false)}>
          Back to the chart
        </QuietButton>
      </Drawer>
    </MainLayout>
  );
}
