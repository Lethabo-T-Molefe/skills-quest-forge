import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { BookOpen, Code2, LayoutDashboard } from "lucide-react";
import { Drawer, QuietButton, ScrollPane, SignalButton, quietButtonClass } from "@/components";
import {
  AnalyseTabs,
  BuildControls,
  MethodGuide,
  ResultView,
  defaultConfig,
  getAnalysisDataset,
  getMethod,
  runAnalysis,
  switchDataset,
  switchMethod,
  analysisDatasets,
  type BuildConfig,
  type BuildMethodId,
  type MethodId,
} from "@/features/analysis";
import { useDatasets } from "@/features/datasets";
import { rememberQueryResult } from "@/features/workbench";
import { MainLayout } from "@/layouts/MainLayout";

function asBuildMethod(method: MethodId | undefined): BuildMethodId | undefined {
  return method && method !== "predict" ? method : undefined;
}

export function BuildPage() {
  const search = useSearch({ from: "/analyse/build" });
  const navigate = useNavigate({ from: "/analyse/build" });
  const catalogue = useDatasets();
  const [guideOpen, setGuideOpen] = useState(false);

  const requestedDataset = getAnalysisDataset(search.dataset)?.id;
  const [config, setConfig] = useState<BuildConfig>(() => {
    const base = defaultConfig(requestedDataset ?? analysisDatasets[0]!.id, asBuildMethod(search.method) ?? "compare", {
      measure: search.measure,
      dimension: search.dimension,
    });
    return search.region ? { ...base, region: search.region } : base;
  });

  // Follow the address when another page or a tab links here with a different dataset or method.
  useEffect(() => {
    const method = asBuildMethod(search.method);
    setConfig((current) => {
      let next = current;
      if (requestedDataset && requestedDataset !== next.datasetId) next = switchDataset(next, requestedDataset);
      if (method && method !== next.method) next = switchMethod(next, method);
      return next;
    });
  }, [requestedDataset, search.method]);

  const result = useMemo(() => runAnalysis(config), [config]);

  // Running this result's SQL in the code view returns the same rows.
  useEffect(() => {
    rememberQueryResult(result.sql, { columns: result.table.columns, rows: result.table.rows, explanation: result.reading });
  }, [result]);

  function update(next: BuildConfig) {
    setConfig(next);
    if (next.datasetId !== search.dataset || next.method !== search.method) {
      void navigate({ search: { dataset: next.datasetId, method: next.method }, replace: true });
    }
  }

  const method = getMethod(config.method);
  const unavailable = search.dataset && !requestedDataset ? catalogue.find((item) => item.id === search.dataset) : undefined;

  return (
    <MainLayout
      title="Build a chart"
      description="Choose what to measure and how it is calculated. The chart, reading, table and SQL follow every change."
      toolbar={<AnalyseTabs context={{ dataset: config.datasetId, method: config.method }} />}
      fill
    >
      {unavailable ? (
        <p className="mb-3 text-sm text-warning">
          {unavailable.name} is not approved yet, so it cannot be analysed. Showing {getAnalysisDataset(config.datasetId)?.name}{" "}
          instead.
        </p>
      ) : null}
      <div className="grid gap-4 lg:h-full lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* On a phone the result comes first, so the answer is visible without scrolling past every option. */}
        <section className="panel order-2 flex min-h-0 flex-col lg:order-1" aria-label="Chart settings">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
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
          <ScrollPane className="min-h-0 flex-1" orientation="vertical">
            <div className="p-4">
              <BuildControls config={config} onChange={update} />
            </div>
          </ScrollPane>
        </section>

        <ResultView
          className="order-1 lg:order-2"
          result={result}
          actions={
            <>
              <Link
                to="/analyse/code"
                search={{ sql: result.sql, dataset: config.datasetId, method: config.method }}
                className={`${quietButtonClass} px-3 py-1.5 text-xs`}
              >
                <Code2 className="size-3.5" strokeWidth={1.75} aria-hidden />
                Open as SQL
              </Link>
              <SignalButton
                className="px-3.5 py-1.5 text-xs"
                onClick={() =>
                  toast.success("Chart saved to My scratch board", {
                    description: "Share the board when it is ready.",
                    action: {
                      label: "Open",
                      onClick: () => void navigate({ to: "/dashboards/$dashboardId", params: { dashboardId: "my-scratch" } }),
                    },
                  })
                }
              >
                <LayoutDashboard className="size-3.5" strokeWidth={1.75} aria-hidden />
                Save to a dashboard
              </SignalButton>
            </>
          }
        />
      </div>

      <Drawer open={guideOpen} title={method?.name ?? "Method guide"} onClose={() => setGuideOpen(false)}>
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
