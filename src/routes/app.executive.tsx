import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { LineTrend, HBar } from "@/components/lab/charts";
import { ProvinceHeatMap } from "@/components/lab/sa-map";
import { homeKpis, grantByProvince, aiRecommendations } from "@/lib/mock-data";
import { Download } from "lucide-react";

export const Route = createFileRoute("/app/executive")({ component: Page });

const utilTrend = Array.from({length:12}).map((_,i)=>({ month: `M${i+1}`, Allocated: 100+i*4, Spent: 80+i*3 + (i%3)*4, Remaining: 20-i*0.5 }));
const heatData = ["Gauteng","KwaZulu-Natal","Western Cape","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"].map((p,i)=>({province:p, value: 78 - i*4}));
const programmeRate = ["Learnerships","Skills Programmes","Internships","Bursaries","Apprenticeships"].map((p,i)=>({province:p, spend: 75 - i*7}));

function Page() {
  return (
    <>
      <PageHeader title="Executive Cockpit" subtitle="National view · FY 2026" actions={
        <>
          <select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>FY 2026</option></select>
          <select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>All provinces</option></select>
          <button className="text-sm px-3 py-2 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-2"><Download className="size-4"/> Export</button>
        </>
      } />

      <KpiRibbon kpis={homeKpis} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="National Skills Heat Map" subtitle="Completion rate by province">
          <ProvinceHeatMap data={heatData} />
        </Panel>
        <Panel title="Grant Utilisation Trend" subtitle="Allocated vs Spent vs Remaining (ZAR M)">
          <LineTrend data={utilTrend} keys={["Allocated","Spent","Remaining"]} />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel title="Completion Rate by Programme">
          <HBar data={programmeRate} x="spend" y="province" />
        </Panel>
        <Panel title="Risk Summary" subtitle="Likelihood × Impact matrix">
          <div className="grid grid-cols-3 grid-rows-3 gap-1.5 aspect-square text-[10px]">
            {Array.from({length:9}).map((_,i)=>{
              const row = Math.floor(i/3), col = i%3;
              const tone = (row+col) > 3 ? "bg-danger/40" : (row+col) > 1 ? "bg-accent/40" : "bg-success/30";
              const flag = [0,4,5,8].includes(i);
              return <div key={i} className={`rounded ${tone} relative grid place-items-center text-foreground/70 font-medium`}>{flag && <div className="size-3 rounded-full bg-danger" />}</div>;
            })}
          </div>
        </Panel>
        <Panel title="AI Recommendations">
          <ul className="space-y-2">
            {aiRecommendations.map(r=>(
              <li key={r.title} className="rounded-md border border-border p-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium">{r.title}</span>
                  <Badge tone={r.priority==="Critical"?"danger":"warn"}>{r.priority}</Badge>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{r.rationale}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
