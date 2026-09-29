import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plug, Upload } from "lucide-react";
import { EmptyState, QuietButton, SearchField, Segmented, quietButtonClass, signalButtonClass } from "@/components";
import {
  DatasetCard,
  layerFilters,
  layerLabels,
  statusFilters,
  useDatasets,
  type LayerFilter,
  type StatusFilter,
} from "@/features/datasets";
import { MainLayout } from "@/layouts/MainLayout";

export function DatasetsPage() {
  const datasets = useDatasets();
  const [layer, setLayer] = useState<LayerFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = datasets.filter(
    (d) =>
      (layer === "All" || d.layer === layer) &&
      (status === "All" || d.status === status) &&
      `${d.name} ${d.description} ${d.owner} ${d.sourceName}`.toLowerCase().includes(needle),
  );

  return (
    <MainLayout
      title="Datasets"
      description="Every file and connected table, with where it is on the way to analysis and what to do next."
      actions={
        <>
          <Link to="/datasets/connect" className={quietButtonClass}>
            <Plug className="size-4" strokeWidth={1.5} aria-hidden />
            Connect a source
          </Link>
          <Link to="/datasets/upload" className={signalButtonClass}>
            <Upload className="size-4" strokeWidth={1.75} aria-hidden />
            Upload a file
          </Link>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <SearchField className="max-w-xs" value={query} onChange={setQuery} placeholder="Search datasets" />
        <Segmented
          label="Layer"
          value={layer}
          onValueChange={setLayer}
          options={layerFilters.map((item) => ({
            value: item,
            label: item === "All" ? "All layers" : layerLabels[item],
          }))}
        />
        <Segmented
          label="Status"
          value={status}
          onValueChange={setStatus}
          options={statusFilters.map((item) => ({
            value: item,
            label: item === "All" ? "Any status" : item === "approved" ? "Approved" : "Waiting",
          }))}
        />
      </div>

      {shown.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No datasets match"
            body="Try another search, or clear the filters to see everything in the catalogue."
            action={
              <QuietButton
                onClick={() => {
                  setQuery("");
                  setLayer("All");
                  setStatus("All");
                }}
              >
                Clear filters
              </QuietButton>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
          {shown.map((d) => (
            <DatasetCard key={d.id} dataset={d} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}
