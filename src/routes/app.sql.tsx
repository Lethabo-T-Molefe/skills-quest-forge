import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { CodeEditor } from "@/components/lab/code-editor";
import { Play, Download, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/sql")({ component: Page });

const schemas = {
  mart: ["grant_utilisation", "completion_rates", "province_summary", "risk_scores"],
  clean: ["grants", "learners", "providers", "centres"],
  raw: ["grants_q3", "learner_records_2026", "etqa_assessments"],
};

const results = Array.from({ length: 8 }).map((_, i) => ({
  province: ["Gauteng","KZN","WC","EC","Limpopo","Mpumalanga","NW","FS"][i],
  enrolled: 12000 - i * 800,
  completed: 8000 - i * 600,
  rate: (66 - i).toFixed(1) + "%",
}));

function Page() {
  const [q, setQ] = useState(`SELECT province, SUM(enrolled) AS enrolled,
       SUM(completed) AS completed,
       ROUND(100.0 * SUM(completed) / NULLIF(SUM(enrolled),0), 1) AS completion_rate
FROM mart.completion_rates
WHERE fy = 2026
GROUP BY province
ORDER BY completion_rate DESC;`);

  return (
    <>
      <PageHeader title="SQL Lab" subtitle="Query the warehouse · mart / clean / raw" actions={
        <select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>mart</option><option>clean</option><option>raw</option><option>governance</option></select>
      } />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <Panel title="Schema Browser">
          <div className="space-y-3 text-sm">
            {Object.entries(schemas).map(([s, tables]) => (
              <details key={s} open className="group">
                <summary className="cursor-pointer flex items-center gap-1 font-medium uppercase text-xs tracking-wider">
                  <ChevronRight className="size-3 group-open:rotate-90 transition" /> {s}
                </summary>
                <ul className="mt-2 pl-4 flex flex-col gap-1">
                  {tables.map(t => (
                    <li key={t}><button className="text-xs font-mono text-muted-foreground hover:text-foreground">{t}</button></li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Query Editor" action={
            <div className="flex gap-2">
              <span className="text-xs text-muted-foreground hidden md:inline">⌘ + Enter to run</span>
              <button className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-1.5"><Play className="size-3.5" /> Run</button>
            </div>
          }>
            <div className="rounded-lg border border-ink overflow-hidden">
              <CodeEditor value={q} onChange={setQ} language="sql" height="224px" />
            </div>
          </Panel>

          <Panel title="Results" subtitle="8 rows · 142 ms" action={
            <div className="flex gap-2">
              <Badge tone="success">OK</Badge>
              <button className="text-xs px-3 py-1.5 rounded-md border border-border inline-flex items-center gap-1.5"><Download className="size-3.5"/> CSV</button>
              <button className="text-xs px-3 py-1.5 rounded-md border border-border">Create Chart</button>
            </div>
          }>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs font-mono">
                <thead className="bg-muted"><tr>{Object.keys(results[0]).map(k=>(<th key={k} className="text-left p-2 font-semibold">{k}</th>))}</tr></thead>
                <tbody>{results.map((r,i)=>(<tr key={i} className="border-t border-border odd:bg-muted/30"><td className="p-2">{r.province}</td><td className="p-2">{r.enrolled}</td><td className="p-2">{r.completed}</td><td className="p-2 text-accent">{r.rate}</td></tr>))}</tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
