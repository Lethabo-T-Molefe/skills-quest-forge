import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Plug, ShieldCheck } from "lucide-react";
import { AppShell, Chip, QuietButton, SignalButton } from "@/components/app-shell";
import { classificationLabel, datasets } from "@/lib/mock-data";

export const Route = createFileRoute("/datasets/")({
  head: () => ({
    meta: [
      { title: "Dataset catalogue — DataForge" },
      {
        name: "description",
        content: "Browse governed datasets with their classification, approval status and quality profile.",
      },
      { property: "og:title", content: "Dataset catalogue — DataForge" },
      { property: "og:description", content: "Governed datasets with classification, approval status and quality." },
    ],
  }),
  component: DatasetsPage,
});

const filters = ["All", "bronze", "silver", "gold"] as const;

function DatasetsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const shown = filter === "All" ? datasets : datasets.filter((d) => d.layer === filter);

  return (
    <AppShell
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
        {filters.map((f) => (
          <QuietButton key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === "All" ? "All layers" : f}
          </QuietButton>
        ))}
      </div>

      <div className="mt-6 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
        {shown.map((d) => (
          <Link
            key={d.id}
            to="/datasets/$datasetId"
            params={{ datasetId: d.id }}
            className="group bg-surface-raised p-6 transition-colors hover:bg-surface-alt"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-paren">({d.source === "upload" ? "upload" : "connector"})</p>
                <h2 className="heading-2 mt-1">{d.name}</h2>
              </div>
              <Chip tone={d.status === "approved" ? "ok" : "warn"}>{d.status}</Chip>
            </div>
            <p className="mt-3 max-w-[60ch] text-sm text-muted-foreground">{d.description}</p>

            <dl className="num mt-5 grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Rows</dt>
                <dd>{d.rows.toLocaleString("en-ZA")}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Completeness</dt>
                <dd>{d.quality.completeness}%</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Updated</dt>
                <dd className="font-sans">{d.updated}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Chip>{d.layer}</Chip>
              <Chip tone={d.classification === "restricted-personal" ? "signal" : "neutral"}>
                <ShieldCheck className="size-3.5" strokeWidth={1.75} />
                {classificationLabel[d.classification]}
              </Chip>
              <span className="text-xs text-muted-foreground">{d.sourceName}</span>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
