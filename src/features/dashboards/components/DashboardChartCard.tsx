import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { MiniChart, Notice } from "@/components";
import { formatCompact, formatterFor } from "@/features/analysis";
import type { DashboardChart } from "../types";

/**
 * One chart on a dashboard, computed for the person viewing it. When their role may not read the data
 * behind it, the card says so instead of showing someone else's numbers.
 */
export function DashboardChartCard({
  chart,
  canEdit,
  removing,
  onShowSql,
  onRemove,
}: {
  chart: DashboardChart;
  canEdit: boolean;
  removing: boolean;
  onShowSql: () => void;
  onRemove: () => void;
}) {
  const format = chart.format ? formatterFor(chart.format) : undefined;
  const unit = chart.format && "unit" in chart.format ? chart.format.unit : undefined;
  const hasPoints = chart.points.some((point) => point.value !== null);

  return (
    <section className="panel flex flex-col p-4" aria-labelledby={`chart-${chart.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{chart.metric}</p>
          <h2 id={`chart-${chart.id}`} className="font-display text-lg leading-snug">
            {chart.title}
          </h2>
        </div>
        {canEdit ? (
          <button
            type="button"
            className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
            disabled={removing}
            onClick={onRemove}
          >
            <Trash2 className="size-4" strokeWidth={1.5} aria-hidden />
            <span className="sr-only">Remove {chart.title}</span>
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex-1">
        {chart.unavailable ? (
          <Notice tone="warn" title="This chart is not available to you">
            {chart.unavailable}
          </Notice>
        ) : hasPoints ? (
          <MiniChart
            type={chart.type}
            points={chart.points}
            className="h-56"
            seriesName={chart.metric || "Value"}
            {...(format ? { format } : {})}
            {...(unit ? { axisFormat: (value: number) => formatCompact(value, unit) } : {})}
          />
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            There is no data for this chart yet.
          </p>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{chart.reading ?? chart.explanation}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {chart.sql ? (
          <button
            type="button"
            className="text-signal-strong underline-offset-4 hover:underline"
            onClick={onShowSql}
          >
            Show the SQL<span className="sr-only"> for {chart.title}</span>
          </button>
        ) : null}
        {chart.config && !chart.unavailable ? (
          <Link
            to="/analyse/build"
            search={{
              dataset: chart.config.datasetId,
              method: chart.config.method,
              measure: chart.config.measure,
              dimension: chart.config.dimension,
            }}
            className="text-signal-strong underline-offset-4 hover:underline"
          >
            Open in the chart builder
          </Link>
        ) : null}
      </div>
    </section>
  );
}
