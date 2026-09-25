import { useState } from "react";
import { Plug, Upload } from "lucide-react";
import { QuietButton, SignalButton } from "@/components";
import { DatasetCard, layerFilters, useDatasets, type LayerFilter } from "@/features/datasets";
import { MainLayout } from "@/layouts/MainLayout";

export function DatasetsPage() {
  const datasets = useDatasets();
  const [filter, setFilter] = useState<LayerFilter>("All");
  const shown = filter === "All" ? datasets : datasets.filter((d) => d.layer === filter);

  return (
    <MainLayout
      label="catalogue"
      title="Datasets"
      intro="Every dataset is classified, profiled and masked before it can be used. Raw data sits in bronze, cleaned data in silver, and analytics-ready data in gold."
      actions={
        <>
          <SignalButton>
            <Upload className="size-4" strokeWidth={1.75} />
            Upload a file
          </SignalButton>
          <QuietButton>
            <Plug className="size-4" strokeWidth={1.5} />
            Connect a source
          </QuietButton>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        {layerFilters.map((f) => (
          <QuietButton key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === "All" ? "All layers" : f}
          </QuietButton>
        ))}
      </div>

      <div className="mt-6 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
        {shown.map((d) => (
          <DatasetCard key={d.id} dataset={d} />
        ))}
      </div>
    </MainLayout>
  );
}
