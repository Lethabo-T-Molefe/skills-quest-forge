import { TrendingDown, TrendingUp } from "lucide-react";
import { useMetricSummaries } from "../hooks/use-metrics";

/** Headline figures from the shared metric definitions. The definition is one hover away. */
export function MetricTiles() {
  const metrics = useMetricSummaries();

  return (
    <dl className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.name} className="bg-surface-raised px-4 py-3" title={m.definition}>
          <dt className="text-xs text-muted-foreground">{m.name}</dt>
          <dd className="mt-1 flex items-baseline justify-between gap-3">
            <span className="num font-display text-3xl font-light">{m.value}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {m.trend === "up" ? (
                <TrendingUp className="size-3.5 text-success" strokeWidth={1.75} aria-hidden />
              ) : (
                <TrendingDown className="size-3.5 text-signal-strong" strokeWidth={1.75} aria-hidden />
              )}
              <span className="num">{m.delta}</span> vs last month
            </span>
          </dd>
          <dd className="mt-1 truncate text-xs text-muted-foreground">{m.definition}</dd>
        </div>
      ))}
    </dl>
  );
}
