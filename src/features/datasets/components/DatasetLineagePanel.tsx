import { useQuery } from "@tanstack/react-query";
import { LayerStrip, Notice } from "@/components";
import { errorMessage } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { datasetLineageQuery, datasetVersionsQuery } from "../api/datasets";
import type { Dataset, LineageEdge } from "../types";

const transformLabel: Record<string, string> = {
  upload: "Uploaded",
  connector: "Imported from a connected source",
  clean: "Cleaned",
  promote: "Promoted to gold",
  erase: "Erased",
};

/** Where the data came from: every move between layers, with who made it and when. */
export function DatasetLineagePanel({ dataset }: { dataset: Dataset }) {
  const lineage = useQuery(datasetLineageQuery(dataset.id));
  const versions = useQuery(datasetVersionsQuery(dataset.id));

  return (
    <div className="space-y-6">
      <LayerStrip current={dataset.layer} />

      <section aria-labelledby="lineage-heading">
        <h3 id="lineage-heading" className="font-sans text-sm font-medium">
          What happened to it
        </h3>
        {lineage.isPending ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading the lineage…</p>
        ) : lineage.isError ? (
          <Notice className="mt-2" tone="signal" title="The lineage did not load">
            {errorMessage(lineage.error)}
          </Notice>
        ) : (
          <ol className="mt-3 space-y-3 border-l border-line-strong pl-4">
            {lineage.data.map((edge) => (
              <LineageStep key={edge.id} edge={edge} />
            ))}
          </ol>
        )}
      </section>

      {versions.data && versions.data.length > 0 ? (
        <section aria-labelledby="versions-heading">
          <h3 id="versions-heading" className="font-sans text-sm font-medium">
            Versions
          </h3>
          <ul className="num mt-2 divide-y divide-border border border-border bg-surface-raised text-sm">
            {versions.data.map((version) => (
              <li
                key={`${version.layer}-${version.version}`}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5"
              >
                <span className="font-sans">
                  Version {version.version} · {version.layer}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(version.rows)} rows · {version.table}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-xs text-muted-foreground">
        The raw file is never changed. Every move between layers is recorded, so any figure can be
        traced back to its source.
      </p>
    </div>
  );
}

function LineageStep({ edge }: { edge: LineageEdge }) {
  return (
    <li>
      <p className="text-sm font-medium">{transformLabel[edge.transform] ?? edge.transform}</p>
      <p className="text-sm break-words text-muted-foreground">
        {edge.source} → {edge.target}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {edge.detail ? `${edge.detail} · ` : ""}
        {edge.actor} · {edge.when}
      </p>
    </li>
  );
}
