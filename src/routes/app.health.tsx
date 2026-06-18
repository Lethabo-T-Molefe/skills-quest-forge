import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { LineTrend, VBar } from "@/components/lab/charts";

export const Route = createFileRoute("/app/health")({ component: Page });

const cpu = Array.from({length:24}).map((_,i)=>({month:`${i}h`, CPU: 30+Math.sin(i/3)*15+i*0.5, Memory: 45+Math.cos(i/4)*10}));
const latency = [{month:"p50", spend:42},{month:"p95",spend:180},{month:"p99",spend:420}];

function Page() {
  return (
    <>
      <PageHeader title="System Health" subtitle="Live infrastructure & service status" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[["API","Operational"],["Database","Operational"],["Storage","Operational"],["Auth Service","Operational"]].map(([n,s])=>(
          <div key={n} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-success animate-pulse"/><span className="text-sm font-medium">{n}</span></div>
            <div className="font-display text-2xl font-bold mt-2">{s}</div>
            <div className="text-xs text-muted-foreground">Uptime 99.98% · 30d</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="CPU & Memory · last 24h"><LineTrend data={cpu} keys={["CPU","Memory"]} /></Panel>
        <Panel title="Query Response Time (ms)"><VBar data={latency} x="month" keys={["spend"]} /></Panel>
      </div>
      <Panel title="Recent Errors">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Timestamp</th><th>Severity</th><th>Service</th><th>Message</th></tr></thead>
          <tbody>{[
            { t:"2026-06-18 09:14", s:"Warn", svc:"warehouse", m:"Slow query > 2s on mart.cohort_risk" },
            { t:"2026-06-18 04:22", s:"Info", svc:"auth", m:"Token refresh spike" },
            { t:"2026-06-17 22:01", s:"Error", svc:"upload", m:"Virus scan timeout (retried)" },
          ].map(r=>(<tr key={r.t} className="border-t border-border"><td className="py-2 font-mono">{r.t}</td><td><Badge tone={r.s==="Error"?"danger":r.s==="Warn"?"warn":"info"}>{r.s}</Badge></td><td>{r.svc}</td><td className="text-muted-foreground">{r.m}</td></tr>))}</tbody>
        </table>
      </Panel>
    </>
  );
}
