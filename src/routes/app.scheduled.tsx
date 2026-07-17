import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { useScheduledReports, useToggleScheduledReport } from "@/lib/queries/reports";

export const Route = createFileRoute("/app/scheduled")({ component: Page });

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function Page() {
  const { data: scheduled = [], isLoading } = useScheduledReports();
  const toggle = useToggleScheduledReport();

  return (
    <>
      <PageHeader title="Scheduled Reports" subtitle="Recurring report subscriptions" />
      <Panel title="Active schedules" subtitle={isLoading ? "Loading…" : `${scheduled.length} schedules`}>
        <table className="w-full text-sm">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider">
            <tr><th className="text-left py-2">Report</th><th>Frequency</th><th>Next run</th><th>Recipients</th><th>Format</th><th>Status</th></tr>
          </thead>
          <tbody>
            {scheduled.map(r => (
              <tr key={r.id} className="border-t border-border">
                <td className="py-2">{r.name}</td>
                <td>{r.frequency}</td>
                <td>{formatDateTime(r.next_run)}</td>
                <td>{r.recipients.length}</td>
                <td>{r.format}</td>
                <td>
                  <button
                    onClick={() => toggle.mutate({ id: r.id, enabled: !r.enabled })}
                    disabled={toggle.isPending}
                  >
                    <Badge tone={r.enabled ? "success" : "muted"}>{r.enabled ? "Enabled" : "Disabled"}</Badge>
                  </button>
                </td>
              </tr>
            ))}
            {scheduled.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="py-6 text-center text-muted-foreground italic">No scheduled reports</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
