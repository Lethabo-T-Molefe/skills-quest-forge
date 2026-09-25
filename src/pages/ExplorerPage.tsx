import { useMemo, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { CodeBlock, HelpTip, MediaFrame, MiniChart, Panel, QuietButton, quietButtonClass, ResultTable, SignalButton } from "@/components";
import { media } from "@/config/media";
import { useDatasets } from "@/features/datasets";
import { buildExploreResult, defaultExploreDefinition, type ChartType } from "@/features/explorer";
import { MainLayout } from "@/layouts/MainLayout";

export function ExplorerPage() {
  const datasets = useDatasets();
  const search = useSearch({ from: "/explorer" });
  const approved = datasets.filter((item) => item.status === "approved");
  const initial =
    approved.find((item) => item.id === search.dataset) ?? approved[0] ?? datasets[0] ?? null;
  const [definition, setDefinition] = useState(() =>
    defaultExploreDefinition(initial?.id ?? "regional-revenue", initial?.name ?? "Regional revenue"),
  );

  const result = useMemo(() => buildExploreResult(definition), [definition]);

  return (
    <MainLayout
      label="point and click"
      title="Explorer"
      intro="Filter, group, aggregate and chart permitted data without writing code. Behind the scene the explorer generates SQL, which you can open and edit."
      actions={
        <>
          <SignalButton
            onClick={() => {
              toast.success("Chart saved to My scratch board");
            }}
          >
            Save to a dashboard
          </SignalButton>
          <Link to="/workbench" search={{ sql: result.sql }} className={quietButtonClass}>
            Open the SQL
          </Link>
        </>
      }
    >
      <MediaFrame {...media.plot} ratio="16 / 7" className="mb-8" />
      <div className="grid gap-6 lg:grid-cols-[5fr_7fr]">
        <Panel>
          <h2 className="heading-2">Build a view</h2>
          <div className="mt-5 space-y-4 text-sm">
            <label className="block">
              <span className="font-medium">Dataset</span>
              <select
                className="mt-1.5 w-full rounded-[999px] border border-line-strong bg-surface-raised px-4 py-2.5"
                value={definition.datasetId}
                onChange={(event) => {
                  const next = datasets.find((item) => item.id === event.target.value);
                  setDefinition((current) => ({
                    ...current,
                    datasetId: event.target.value,
                    datasetName: next?.name ?? current.datasetName,
                  }));
                }}
              >
                {approved.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-medium">Group by</span>
              <select
                className="mt-1.5 w-full rounded-[999px] border border-line-strong bg-surface-raised px-4 py-2.5"
                value={definition.xField}
                onChange={(event) => setDefinition((current) => ({ ...current, xField: event.target.value }))}
              >
                <option value="region">region</option>
                <option value="course">course</option>
                <option value="month">month</option>
              </select>
            </label>
            <label className="block">
              <span className="font-medium">Measure</span>
              <select
                className="mt-1.5 w-full rounded-[999px] border border-line-strong bg-surface-raised px-4 py-2.5"
                value={definition.yField}
                onChange={(event) => setDefinition((current) => ({ ...current, yField: event.target.value }))}
              >
                <option value="enrolments">enrolments</option>
                <option value="completions">completions</option>
                <option value="revenue">revenue</option>
              </select>
            </label>
            <label className="block">
              <span className="font-medium">Aggregation</span>
              <select
                className="mt-1.5 w-full rounded-[999px] border border-line-strong bg-surface-raised px-4 py-2.5"
                value={definition.aggregation}
                onChange={(event) =>
                  setDefinition((current) => ({
                    ...current,
                    aggregation: event.target.value as typeof current.aggregation,
                  }))
                }
              >
                <option value="sum">Sum</option>
                <option value="avg">Average</option>
                <option value="count">Count</option>
              </select>
            </label>
            <label className="block">
              <span className="font-medium">Filter region</span>
              <input
                className="mt-1.5 w-full rounded-[999px] border border-line-strong bg-surface-raised px-4 py-2.5"
                value={definition.filterValue}
                placeholder="Leave blank for all"
                onChange={(event) =>
                  setDefinition((current) => ({
                    ...current,
                    filterField: "region",
                    filterValue: event.target.value,
                  }))
                }
              />
            </label>
            <div>
              <p className="font-medium">Chart</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["bar", "line", "table"] as ChartType[]).map((type) => (
                  <QuietButton
                    key={type}
                    active={definition.chartType === type}
                    onClick={() => setDefinition((current) => ({ ...current, chartType: type }))}
                  >
                    {type}
                  </QuietButton>
                ))}
              </div>
            </div>
            <HelpTip>Pending datasets stay out of this list until a Steward approves them.</HelpTip>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <p className="label-paren">(live preview)</p>
            <h2 className="heading-2 mt-1">
              {definition.aggregation} of {definition.yField} by {definition.xField}
            </h2>
            <div className="mt-5">
              {definition.chartType === "table" ? (
                <ResultTable columns={result.columns} rows={result.rows} />
              ) : (
                <MiniChart type={definition.chartType === "line" ? "line" : "bar"} points={result.series} />
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{result.explanation}</p>
          </Panel>
          <CodeBlock code={result.sql} />
        </div>
      </div>
    </MainLayout>
  );
}
