import { TrendingDown, TrendingUp } from "lucide-react";
import { useMetricSummaries } from "../hooks/use-metrics";

export function MetricTiles() {
  const metrics = useMetricSummaries();

  return (
    <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.name} className="bg-surface-raised p-5">
          <p className="text-sm text-muted-foreground">{m.name}</p>
          <p className="num mt-2 font-display text-4xl font-light">{m.value}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            {m.trend === "up" ? (
              <TrendingUp className="size-3.5 text-success" strokeWidth={1.75} />
            ) : (
              <TrendingDown className="size-3.5 text-signal-strong" strokeWidth={1.75} />
            )}
            <span className="num">{m.delta}</span> vs last month
          </p>
          <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{m.definition}</p>
        </div>
      ))}
    </div>
  );
}
