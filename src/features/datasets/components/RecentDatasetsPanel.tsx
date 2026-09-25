import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Chip, Panel } from "@/components";
import { formatNumber } from "@/lib/format";
import { useDatasets } from "../hooks/use-datasets";

/** "Continue where you left off" list of the most recent datasets. */
export function RecentDatasetsPanel({ limit = 3 }: { limit?: number }) {
  const datasets = useDatasets();

  return (
    <Panel>
      <div className="flex items-center justify-between">
        <h2 className="heading-2">Continue where you left off</h2>
        <Link to="/datasets" className="text-sm text-signal-strong underline-offset-4 hover:underline">
          All datasets
        </Link>
      </div>
      <ul className="mt-5 divide-y divide-border">
        {datasets.slice(0, limit).map((d) => (
          <li key={d.id} className="py-4 first:pt-0 last:pb-0">
            <Link
              to="/datasets/$datasetId"
              params={{ datasetId: d.id }}
              className="group flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium">{d.name}</p>
                <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">{d.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip>{d.layer}</Chip>
                  <Chip tone={d.status === "approved" ? "ok" : "warn"}>{d.status}</Chip>
                  <Chip>
                    <span className="num">{formatNumber(d.rows)}</span> rows
                  </Chip>
                </div>
              </div>
              <ArrowUpRight
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
