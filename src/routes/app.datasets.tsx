import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { datasets } from "@/lib/mock-data";
import { Search, Filter, Download, Eye, GitBranch } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/datasets")({ component: Page });

function Page() {
  const [q, setQ] = useState("");
  const filtered = datasets.filter(d => d.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Dataset Catalogue" subtitle={`${datasets.length} datasets · governed by Data Stewardship`} actions={
        <button className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2"><Filter className="size-4"/> Filters</button>
      } />

      <Panel title="Browse" subtitle="Click any dataset to view metadata, lineage and audit trail">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 h-9 rounded-md bg-muted border border-border flex-1 max-w-md">
            <Search className="size-4 text-muted-foreground" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search datasets…" className="flex-1 bg-transparent outline-none text-sm" />
          </div>
          <select className="bg-muted border border-border rounded-md text-sm h-9 px-3"><option>All classifications</option></select>
          <select className="bg-muted border border-border rounded-md text-sm h-9 px-3"><option>All owners</option></select>
          <select className="bg-muted border border-border rounded-md text-sm h-9 px-3"><option>All quality</option></select>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(d => (
            <div key={d.name} className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-3 hover:border-primary/60 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display font-semibold tracking-tight">{d.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.owner} · {d.date}</div>
                </div>
                <Badge tone={d.quality === "Validated" ? "success" : d.quality === "Pending" ? "warn" : "danger"}>{d.quality}</Badge>
              </div>
              <Badge tone={d.classification.includes("RESTRICTED") ? "danger" : "info"}>{d.classification}</Badge>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{d.rows.toLocaleString()} rows · {d.cols} cols</span>
                <span className="font-medium" style={{ color: d.score > 80 ? "var(--success)" : d.score > 60 ? "var(--accent)" : "var(--danger)" }}>Quality {d.score}/100</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted"><Eye className="size-3.5"/> Preview</button>
                <button className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted"><GitBranch className="size-3.5"/> Lineage</button>
                <button className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted"><Download className="size-3.5"/> Download</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
