import { useMemo, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  CodeBlock,
  DatePicker,
  HelpTip,
  MiniChart,
  Notice,
  Panel,
  QuietButton,
  quietButtonClass,
  ResultTable,
  SelectMenu,
  SignalButton,
  TextInput,
} from "@/components";
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
  const [fromDate, setFromDate] = useState<Date | undefined>();

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
      <Notice tone="info" title="Pending datasets stay out of this list">
        A Steward must approve a file before it can be explored.
      </Notice>
      <div className="mt-6 grid gap-6 lg:grid-cols-[5fr_7fr]">
        <Panel>
          <h2 className="heading-2">Build a view</h2>
          <div className="mt-5 space-y-4">
            <SelectMenu
              label="Dataset"
              value={definition.datasetId}
              onValueChange={(value) => {
                const next = datasets.find((item) => item.id === value);
                setDefinition((current) => ({
                  ...current,
                  datasetId: value,
                  datasetName: next?.name ?? current.datasetName,
                }));
              }}
              options={approved.map((item) => ({ value: item.id, label: item.name }))}
            />
            <SelectMenu
              label="Group by"
              value={definition.xField}
              onValueChange={(value) => setDefinition((current) => ({ ...current, xField: value }))}
              options={[
                { value: "region", label: "region" },
                { value: "course", label: "course" },
                { value: "month", label: "month" },
              ]}
            />
            <SelectMenu
              label="Measure"
              value={definition.yField}
              onValueChange={(value) => setDefinition((current) => ({ ...current, yField: value }))}
              options={[
                { value: "enrolments", label: "enrolments" },
                { value: "completions", label: "completions" },
                { value: "revenue", label: "revenue" },
              ]}
            />
            <SelectMenu
              label="Aggregation"
              value={definition.aggregation}
              onValueChange={(value) =>
                setDefinition((current) => ({
                  ...current,
                  aggregation: value as typeof current.aggregation,
                }))
              }
              options={[
                { value: "sum", label: "Sum" },
                { value: "avg", label: "Average" },
                { value: "count", label: "Count" },
              ]}
            />
            <label className="block text-sm">
              <span className="font-medium">Filter region</span>
              <TextInput
                className="mt-1.5"
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
            <DatePicker label="From date" value={fromDate} onChange={setFromDate} />
            <div>
              <p className="text-sm font-medium">Chart</p>
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
