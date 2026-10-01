import { Link } from "@tanstack/react-router";
import { Panel, signalButtonClass } from "@/components";
import { statusLabel } from "../constants";
import { useDatasets } from "../hooks/use-datasets";
import { DatasetNextAction } from "./DatasetNextAction";

/** "Pick up where you left off": recent datasets, each with its next step. */
export function RecentDatasetsPanel({ limit = 4 }: { limit?: number }) {
  const datasets = useDatasets();

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl">Pick up where you left off</h2>
        <Link
          to="/datasets"
          className="text-sm text-signal-strong underline-offset-4 hover:underline"
        >
          All datasets
        </Link>
      </div>
      {datasets.length === 0 ? (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            There is no data here yet. Upload a file to start: it is measured and checked for
            personal information before anyone can use it.
          </p>
          <Link to="/datasets/upload" className={`${signalButtonClass} mt-4`}>
            Upload a file
          </Link>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {datasets.slice(0, limit).map((dataset) => (
            <li
              key={dataset.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-1 last:pb-0"
            >
              <div className="min-w-0">
                <Link
                  to="/datasets/$datasetId"
                  params={{ datasetId: dataset.id }}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {dataset.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {dataset.layerLabel} · {statusLabel[dataset.status]} · {dataset.nextStep.reason}
                </p>
              </div>
              <DatasetNextAction
                dataset={dataset}
                emphasis="quiet"
                className="px-3 py-1.5 text-xs"
              />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
