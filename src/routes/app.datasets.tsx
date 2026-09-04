import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { useDatasets } from "@/lib/queries/datasets";
import type { Dataset } from "@/lib/api";
import { Search, Eye, GitBranch, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/app/datasets")({ component: Page });

function classificationTone(classification: string): "danger" | "warn" | "info" {
  if (classification.startsWith("RESTRICTED")) return "danger";
  if (classification.includes("Confidential")) return "warn";
  return "info";
}

function DatasetDetail({ dataset, onClose }: { dataset: Dataset; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    // Backdrop: click-to-dismiss is a mouse-only convenience here — the
    // dialog itself is fully keyboard-operable via Escape (above) and the
    // explicit close button below, so the backdrop is marked decorative
    // rather than made a focusable interactive element in its own right.
    // Only the backdrop itself carries the close handler (guarded by an
    // e.target check) so the dialog panel below needs no click handler of
    // its own to stop propagation.
    <div
      role="presentation"
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${dataset.name} dataset details`}
        className="bg-background rounded-xl border border-border max-w-lg w-full p-6 flex flex-col gap-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display font-semibold text-lg">{dataset.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              v{dataset.version} · {dataset.original_filename}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="size-4" /></button>
        </div>
        <Badge tone={classificationTone(dataset.classification)}>{dataset.classification}</Badge>
        {dataset.description && <p className="text-sm text-muted-foreground">{dataset.description}</p>}
        {dataset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {dataset.tags.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border">{t}</span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-muted-foreground">Owner</span><div>{dataset.owner ?? "—"}</div></div>
          <div><span className="text-muted-foreground">Rows</span><div>{dataset.row_count.toLocaleString()}</div></div>
          <div><span className="text-muted-foreground">Columns</span><div>{dataset.column_count}</div></div>
          <div><span className="text-muted-foreground">Warehouse table</span><div className="font-mono">{dataset.warehouse_schema}.{dataset.warehouse_table}</div></div>
        </div>
        {dataset.masked_columns.length > 0 && (
          <div className="text-xs rounded-lg border border-accent/40 bg-accent/10 p-3">
            <span className="font-semibold">PII masked at ingestion:</span>{" "}
            {dataset.masked_columns.join(", ")}
          </div>
        )}
        <div className="text-xs">
          <span className="text-muted-foreground">Columns</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {dataset.columns.map(c => (
              <span key={c.name} className="font-mono px-2 py-0.5 rounded bg-muted border border-border">
                {c.name} <span className="text-muted-foreground">{c.data_type}</span>
              </span>
            ))}
          </div>
        </div>
        <Link to="/app/lineage" className="text-xs inline-flex items-center gap-1 underline underline-offset-2 self-start">
          <GitBranch className="size-3.5" /> View lineage
        </Link>
      </div>
    </div>
  );
}

function Page() {
  const [q, setQ] = useState("");
  const [previewing, setPreviewing] = useState<Dataset | null>(null);
  const { data: datasets = [], isLoading, isError } = useDatasets(q || undefined);

  return (
    <>
      <PageHeader
        title="Dataset Catalogue"
        subtitle={`${datasets.length} dataset${datasets.length === 1 ? "" : "s"} · governed by Data Stewardship`}
      />

      <Panel title="Browse" subtitle="Click Preview to see metadata, masking, and lineage">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 h-9 rounded-md bg-muted border border-border flex-1 max-w-md">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search name, filename, or description…"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
            <Loader2 className="size-4 animate-spin" /> Loading datasets…
          </div>
        )}
        {isError && (
          <div className="text-sm text-danger py-8 text-center">Couldn't load datasets.</div>
        )}
        {!isLoading && !isError && datasets.length === 0 && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No datasets {q ? "match that search" : "uploaded yet"}.
          </div>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {datasets.map(d => (
            <div key={d.id} className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-3 hover:border-primary/60 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display font-semibold tracking-tight">{d.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.owner ?? "unknown owner"} · v{d.version}</div>
                </div>
                {d.masked_columns.length > 0 && <Badge tone="info">PII masked</Badge>}
              </div>
              <Badge tone={classificationTone(d.classification)}>{d.classification}</Badge>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{d.row_count.toLocaleString()} rows · {d.column_count} cols</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => setPreviewing(d)}
                  className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted"
                >
                  <Eye className="size-3.5" /> Preview
                </button>
                <Link to="/app/lineage" className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted">
                  <GitBranch className="size-3.5" /> Lineage
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {previewing && <DatasetDetail dataset={previewing} onClose={() => setPreviewing(null)} />}
    </>
  );
}
