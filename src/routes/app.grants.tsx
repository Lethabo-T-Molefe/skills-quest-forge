import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { VBar, LineTrend, Donut, HBar } from "@/components/lab/charts";
import { ProvinceHeatMap } from "@/components/lab/sa-map";
import { grantRecords, grantByProvince, PROVINCES } from "@/lib/mock-data";

export const Route = createFileRoute("/app/grants")({ component: Page });

const kpis = [
  { label: "DG Allocated", value: 1240, suffix: "M", trend: 3.2, spark: [800,900,1000,1100,1200,1240] },
  { label: "MG Allocated", value: 642, suffix: "M", trend: 1.4, spark: [500,520,560,600,620,642] },
  { label: "Total Spent", value: 1410, suffix: "M", trend: 8.1, spark: [900,1000,1100,1200,1300,1410] },
  { label: "Under-utilisation", value: 12.4, suffix: "%", trend: -2.3, spark: [18,17,16,14,13,12] },
  { label: "Zero-drawdown providers", value: 24, suffix: "", trend: -6.0, spark: [40,38,34,30,27,24] },
  { label: "High-risk grants", value: 31, suffix: "", trend: 4.0, spark: [22,25,27,28,30,31] },
];

const heat = PROVINCES.map((p,i)=>({province:p, value: 95 - i*5}));
const budgetActual = PROVINCES.slice(0,6).map((p,i)=>({province:p, Budget: 200+i*40, Actual: 180+i*35}));
const monthly = Array.from({length:12}).map((_,i)=>({month:`M${i+1}`, Spent: 80+i*8}));
const topProgs = ["Welders L3","Process Ops L4","Lab Tech L5","Apprentice Mech","Chem Eng Bursary","Boilermaker","Production Sup","SHE Officer","Maintenance Tech","Quality L4"].map((p,i)=>({province:p, spend: 200-i*15}));

function Page() {
  return (
    <>
      <PageHeader title="Grants Intelligence" subtitle="Discretionary & Mandatory grants · FY 2026" actions={
        <>
          <select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>FY 2026</option></select>
          <select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>All provinces</option></select>
          <select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>DG + MG</option></select>
        </>
      } />

      <KpiRibbon kpis={kpis as any} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Funding by Province" subtitle="Utilisation %">
          <ProvinceHeatMap data={heat} />
        </Panel>
        <Panel title="Budget vs Actual" subtitle="ZAR M by province">
          <VBar data={budgetActual} x="province" keys={["Budget","Actual"]} />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel title="Top 10 Programmes by Funding"><HBar data={topProgs} x="spend" y="province" /></Panel>
        <Panel title="Monthly Spend Trend"><LineTrend data={monthly} keys={["Spent"]} /></Panel>
        <Panel title="Grant Risk Distribution">
          <Donut data={[{name:"Low",value:62},{name:"Medium",value:27},{name:"High",value:11}]} />
        </Panel>
      </div>

      <Panel title="Grant Records" subtitle={`${grantRecords.length} grants`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr><th className="text-left py-2">Grant</th><th className="text-left">Provider</th><th className="text-left">Province</th><th className="text-left">Programme</th><th className="text-right">Allocated</th><th className="text-right">Spent</th><th className="text-right">Util %</th><th>Risk</th><th>Status</th></tr>
            </thead>
            <tbody>
              {grantRecords.map(r=>{
                const util = Math.round((r.spent/r.allocated)*100);
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2 font-mono">{r.id}</td><td>{r.provider}</td><td>{r.province}</td><td>{r.programme}</td>
                    <td className="text-right">R {r.allocated.toLocaleString()}</td>
                    <td className="text-right">R {r.spent.toLocaleString()}</td>
                    <td className="text-right">{util}%</td>
                    <td><Badge tone={r.risk==="High"?"danger":r.risk==="Medium"?"warn":"success"}>{r.risk}</Badge></td>
                    <td><Badge tone={r.status==="Active"?"success":r.status==="Closed"?"muted":"warn"}>{r.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
