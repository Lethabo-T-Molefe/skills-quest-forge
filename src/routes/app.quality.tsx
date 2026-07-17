import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { Gauge } from "@/components/lab/charts";
import { datasets } from "@/lib/mock-data";
import { useState } from "react";
import { QUALITY_TABLES, type QualityTable } from "@/lib/api/data-quality";
import { useQualityReport } from "@/lib/queries/data-quality";

export const Route = createFileRoute("/app/quality")({ component: Page });

function Page() {
  const [sel, setSel] = useState(datasets[0]);
  const [table, setTable] = useState<QualityTable>(QUALITY_TABLES[0]);
  const { data: report, isLoading: qualityLoading } = useQualityReport(table);

  const dims = report
    ? [
        { name: "Completeness", value: report.completeness_pct, desc: `${report.row_count.toLocaleString()} rows · ${report.column_count} columns` },
        { name: "Uniqueness", value: report.uniqueness_pct, desc: "First column, distinct ÷ total rows" },
      ]
    : [];

  return (
    <>
      <PageHeader title="Data Quality Reports" subtitle="Validation, profiling and rule outcomes per dataset" />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <Panel title="Datasets">
          <ul className="flex flex-col gap-1.5">
            {datasets.map(d => (
              <li key={d.name}>
                <button onClick={()=>setSel(d)} className={`w-full text-left p-2 rounded-md text-sm ${sel.name===d.name ? "bg-primary/15 border border-primary/40" : "hover:bg-muted"}`}>
                  <div className="font-medium truncate">{d.name}</div>
                  <div className="mt-1 h-1.5 rounded bg-muted overflow-hidden"><div style={{width:`${d.score}%`, background: d.score > 80 ? "var(--success)" : d.score > 60 ? "var(--accent)" : "var(--danger)"}} className="h-full" /></div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title={sel.name} subtitle={`Owner: ${sel.owner} · ${sel.classification}`} action={
            <div className="flex items-center gap-2">
              <select
                className="bg-muted border border-border rounded-md h-8 px-2 text-xs"
                value={table}
                onChange={(e) => setTable(e.target.value as QualityTable)}
              >
                {QUALITY_TABLES.map(t => <option key={t} value={t}>bronze.{t}</option>)}
              </select>
              <button className="text-xs px-3 py-1.5 rounded-md border border-border">Re-run Validation</button>
              <button className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground">Download PDF</button>
            </div>
          } info={{
            what: "Live completeness and uniqueness scores computed directly against the selected bronze warehouse table, plus the overall score (their average).",
            calculation: "Completeness = average across all columns of (1 − NULL count ÷ row count) × 100. Uniqueness = distinct values ÷ row count × 100 for the table's first column, as a simple key-uniqueness proxy. Overall = average of the two.",
            source: "playground warehouse · bronze schema (live query)", updated: "Computed fresh on every page load / table switch." }}>
            <div className="grid md:grid-cols-[260px_1fr] gap-6 items-center">
              <div className="grid place-items-center"><Gauge value={qualityLoading ? 0 : (report?.overall_score ?? 0)} /></div>
              <div className="space-y-3">
                {qualityLoading && <div className="text-xs text-muted-foreground">Loading bronze.{table}…</div>}
                {dims.map(d => (
                  <div key={d.name}>
                    <div className="flex justify-between text-xs"><span className="font-medium">{d.name}</span><span className="text-muted-foreground">{d.value}/100</span></div>
                    <div className="h-2 rounded bg-muted overflow-hidden mt-1"><div style={{width:`${d.value}%`, background: d.value > 80 ? "var(--success)" : d.value > 60 ? "var(--accent)" : "var(--danger)"}} className="h-full" /></div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Failed Validation Rules" info={{
            what: "Specific data quality rules that failed on the most recent validation run for this dataset, with the affected field and row count.",
            calculation: "Each row is a Great Expectations 'expectation' that evaluated to false against the current data, e.g. a range check, format check, or cross-field consistency check.",
            source: "governance.data_quality_results" }}>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="text-left py-2">Rule</th><th className="text-left">Field</th><th className="text-left">Issue</th><th className="text-right">Rows</th><th className="text-right">Status</th></tr></thead>
              <tbody>
                {[
                  { rule: "Spend ≤ Allocated", field: "spent", issue: "12 records exceed allocation", rows: 12 },
                  { rule: "Date in current FY", field: "issued_at", issue: "4 records pre-2024", rows: 4 },
                  { rule: "No PII in column",   field: "notes",     issue: "Possible ID numbers found", rows: 2 },
                ].map(r => (
                  <tr key={r.rule} className="border-t border-border">
                    <td className="py-2">{r.rule}</td><td>{r.field}</td><td className="text-muted-foreground">{r.issue}</td><td className="text-right">{r.rows}</td><td className="text-right"><Badge tone="danger">Failed</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </>
  );
}
