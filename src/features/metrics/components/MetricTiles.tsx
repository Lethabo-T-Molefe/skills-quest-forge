import { Link } from "@tanstack/react-router";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMetricSummaries } from "../hooks/use-metrics";

/** Headline figures from the shared metric definitions, each for its latest month against the one before. */
export function MetricTiles() {
  const metrics = useMetricSummaries();

  if (metrics.length === 0) {
    return (
      <p className="border border-dashed border-border px-5 py-6 text-sm text-muted-foreground">
        Headline figures appear here once a dataset with monthly data is approved and a steward has
        published a metric for it.{" "}
        <Link to="/semantic" className="text-signal-strong underline-offset-4 hover:underline">
          See the shared metrics
        </Link>
        .
      </p>
    );
  }

  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.key} className="bg-surface-raised px-5 py-4">
          <dt className="text-xs text-muted-foreground">
            {m.name} · {m.month}
          </dt>
          <dd className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="num font-display text-3xl font-light">{m.value}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {m.trend === "up" ? (
                <TrendingUp className="size-3.5 text-success" strokeWidth={1.75} aria-label="Up" />
              ) : (
                <TrendingDown
                  className="size-3.5 text-signal-strong"
                  strokeWidth={1.75}
                  aria-label="Down"
                />
              )}
              <span className="num">{m.delta}</span> on the month before
            </span>
          </dd>
          <dd className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.definition}</dd>
        </div>
      ))}
    </dl>
  );
}
