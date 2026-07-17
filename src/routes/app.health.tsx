import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { LineTrend, VBar } from "@/components/lab/charts";
import { useSystemHealth } from "@/lib/queries/operations";

export const Route = createFileRoute("/app/health")({ component: Page });

function Page() {
  const { data: health, isLoading } = useSystemHealth();

  const cpu = (health?.metrics ?? []).map(m => ({ month: m.hour_label, CPU: m.cpu, Memory: m.memory }));
  const latency = (health?.latency_percentiles ?? []).map(p => ({ month: p.label, spend: p.ms }));
  const services = health?.services ?? [];
  const errors = health?.recent_errors ?? [];

  return (
    <>
      <PageHeader title="System Health" subtitle="Live infrastructure & service status" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map(s => {
          const ok = s.status === "Operational";
          return (
            <div key={s.name} className="sw-card bg-card p-4">
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${ok ? "bg-success animate-pulse" : "bg-danger"}`} />
                <span className="text-sm font-medium">{s.name}</span>
              </div>
              <div className="font-display text-2xl font-bold mt-2">{s.status}</div>
              <div className="text-xs text-muted-foreground">Uptime 99.98% · 30d</div>
            </div>
          );
        })}
        {services.length === 0 && isLoading && (
          <div className="text-xs text-muted-foreground italic">Loading service status…</div>
        )}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="CPU & Memory · last 24h"><LineTrend data={cpu} keys={["CPU", "Memory"]} /></Panel>
        <Panel title="Query Response Time (ms)"><VBar data={latency} x="month" keys={["spend"]} /></Panel>
      </div>
      <Panel title="Recent Errors">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Timestamp</th><th>Severity</th><th>Service</th><th>Message</th></tr></thead>
          <tbody>
            {errors.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-2 font-mono">{new Date(r.ts).toISOString().slice(0, 16).replace("T", " ")}</td>
                <td><Badge tone={r.severity === "Error" ? "danger" : r.severity === "Warn" ? "warn" : "info"}>{r.severity}</Badge></td>
                <td>{r.service}</td>
                <td className="text-muted-foreground">{r.message}</td>
              </tr>
            ))}
            {errors.length === 0 && !isLoading && (
              <tr><td colSpan={4} className="py-6 text-center text-muted-foreground italic">No recent errors</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
