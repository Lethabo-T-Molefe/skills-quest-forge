import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { useReportHistory } from "@/lib/queries/reports";

export const Route = createFileRoute("/app/history")({ component: Page });

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function Page() {
  const { data: reports = [], isLoading } = useReportHistory();
  return (
    <>
      <PageHeader title="Report History" />
      <Panel title="All generated reports" subtitle={isLoading ? "Loading…" : `${reports.length} reports`}>
        <table className="w-full text-sm">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider">
            <tr><th className="text-left py-2">Report</th><th>By</th><th>Date</th><th>Format</th><th>Date Range</th><th></th></tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} className="border-t border-border">
                <td className="py-2">{r.title}</td>
                <td>{r.generated_by}</td>
                <td>{formatDate(r.generated_at)}</td>
                <td>{r.format}</td>
                <td>{r.date_range}</td>
                <td><button className="text-primary text-xs" title={r.storage_key}>Download</button></td>
              </tr>
            ))}
            {reports.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="py-6 text-center text-muted-foreground italic">No reports generated yet</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
