import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { Download } from "lucide-react";
import { useReportHistory, useGenerateReport, useScheduledReports } from "@/lib/queries/reports";

export const Route = createFileRoute("/app/reports")({ component: Page });

const DASHBOARDS = ["Executive Cockpit", "Grants", "Learner", "ETQA", "Centres"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function Page() {
  const { data: scheduled = [] } = useScheduledReports();
  const { data: history = [], isLoading: historyLoading } = useReportHistory();
  const generateReport = useGenerateReport();

  const [title, setTitle] = useState("Executive Brief");
  const [sections, setSections] = useState<string[]>(["Executive Cockpit"]);
  const [dateRange, setDateRange] = useState("Last quarter");
  const [format, setFormat] = useState("PDF");

  function toggleSection(s: string) {
    setSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function handleGenerate() {
    if (sections.length === 0) return;
    generateReport.mutate({ title, sections, format, date_range: dateRange });
  }

  return (
    <>
      <PageHeader title="Generate Report" subtitle="Build a branded report from any dashboard combination" />
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
        <Panel title="Scheduled Reports">
          <ul className="text-sm flex flex-col gap-3">
            {scheduled.map(r => (
              <li key={r.id} className="p-3 rounded-md border border-border">
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {r.frequency} · next {formatDate(r.next_run)} · {r.format} · {r.recipients.length} recipients
                </div>
              </li>
            ))}
            {scheduled.length === 0 && <div className="text-xs text-muted-foreground italic">No scheduled reports</div>}
          </ul>
        </Panel>

        <Panel title="Compose new report">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wider">
              <span>Report title</span>
              <input
                className="bg-muted border border-border rounded-md h-9 px-3 text-sm"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </label>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider mb-2">Dashboards</div>
                {DASHBOARDS.map(s => (
                  <label key={s} className="flex items-center gap-2 text-sm py-1.5">
                    <input
                      type="checkbox"
                      checked={sections.includes(s)}
                      onChange={() => toggleSection(s)}
                      className="accent-accent"
                    /> {s}
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-xs uppercase tracking-wider">
                  <span>Date range</span>
                  <select
                    className="bg-muted border border-border rounded-md h-9 px-3 text-sm"
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                  >
                    <option>Last quarter</option>
                    <option>Last month</option>
                    <option>Last week</option>
                    <option>Year to date</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs uppercase tracking-wider">
                  <span>Format</span>
                  <select
                    className="bg-muted border border-border rounded-md h-9 px-3 text-sm"
                    value={format}
                    onChange={e => setFormat(e.target.value)}
                  >
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>PNG</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm mt-1"><input type="checkbox" defaultChecked className="accent-accent" /> Include AI recommendations</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="accent-accent" /> CHIETA branded cover</label>
                <button
                  className="mt-3 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={handleGenerate}
                  disabled={generateReport.isPending || sections.length === 0}
                >
                  <Download className="size-4" /> {generateReport.isPending ? "Generating…" : "Generate Now"}
                </button>
                {generateReport.isSuccess && (
                  <div className="text-xs text-success">Report "{generateReport.data.title}" generated successfully.</div>
                )}
                {generateReport.isError && (
                  <div className="text-xs text-danger">Failed to generate report. Please try again.</div>
                )}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Report History" subtitle={historyLoading ? "Loading…" : `${history.length} reports`}>
        <table className="w-full text-xs">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Report</th><th className="text-left">By</th><th className="text-left">Date</th><th className="text-left">Format</th><th className="text-right">Date Range</th><th></th></tr></thead>
          <tbody>{history.slice(0, 8).map(r => (
            <tr key={r.id} className="border-t border-border">
              <td className="py-2">{r.title}</td>
              <td>{r.generated_by}</td>
              <td>{formatDate(r.generated_at)}</td>
              <td>{r.format}</td>
              <td className="text-right">{r.date_range}</td>
              <td className="text-right"><button className="text-primary text-xs" title={r.storage_key}>Download</button></td>
            </tr>
          ))}</tbody>
        </table>
      </Panel>
    </>
  );
}
