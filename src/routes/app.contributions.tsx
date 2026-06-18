import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { Award } from "lucide-react";
export const Route = createFileRoute("/app/contributions")({ component: Page });
function Page() {
  return (<><PageHeader title="My Contributions" subtitle="R. Mahlangu · Student Developer · CPUT" />
    <div className="grid sm:grid-cols-3 gap-4">
      {[["Tasks completed","42"],["Hours logged","186"],["Badges earned","3"]].map(([l,v])=>(
        <div key={l} className="sw-card bg-card p-4">
          <div className="text-xs text-muted-foreground">{l}</div>
          <div className="font-display text-3xl font-bold mt-1">{v}</div>
        </div>
      ))}
    </div>
    <Panel title="Badges">
      <div className="flex gap-4">
        {[
          {n:"Bronze", c:"oklch(0.6 0.1 50)"},
          {n:"Silver", c:"oklch(0.78 0.02 240)"},
          {n:"Gold", c:"oklch(0.82 0.16 80)"},
          {n:"Platinum", c:"oklch(0.85 0.05 200)", muted:true},
        ].map(b=>(
          <div key={b.n} className="text-center">
            <div className={`size-16 rounded-full grid place-items-center border-2 border-border ${b.muted?"opacity-30":""}`} style={{background:b.c}}>
              <Award className="size-7 text-background" />
            </div>
            <div className="text-xs mt-2 font-medium">{b.n}</div>
          </div>
        ))}
      </div>
    </Panel>
    <Panel title="Activity log">
      <table className="w-full text-sm"><thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Sprint</th><th className="text-left">Task</th><th className="text-right">Hours</th><th>PR</th><th>Reviewed by</th><th>Status</th></tr></thead>
      <tbody>{Array.from({length:6}).map((_,i)=>(
        <tr key={i} className="border-t border-border"><td className="py-2">Sprint {12-i}</td><td>Data cleaning module</td><td className="text-right">{12-i}</td><td className="font-mono text-xs">#PR-{420+i}</td><td>S. Naidoo</td><td><Badge tone="success">Merged</Badge></td></tr>
      ))}</tbody></table>
    </Panel></>);
}
