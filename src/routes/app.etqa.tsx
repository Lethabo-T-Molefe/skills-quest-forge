import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { LineTrend, Donut, Gauge } from "@/components/lab/charts";

export const Route = createFileRoute("/app/etqa")({ component: Page });

const kpis = [
  { label: "APP Target Achievement", value: 89.2, suffix:"%", trend: 3.4, spark: [80,82,84,86,87,89] },
  { label: "Certifications Issued", value: 12480, trend: 12.5, spark: [9000,9500,10000,11000,11800,12480] },
  { label: "Providers Accredited", value: 318, trend: 2.6, spark: [300,305,310,313,316,318] },
  { label: "Assessments Completed", value: 22115, trend: 6.1, spark: [18000,19000,20000,21000,21500,22115] },
  { label: "Outstanding Assessments", value: 1240, trend: -8.2, spark: [1800,1700,1500,1400,1300,1240] },
  { label: "Compliance Rate", value: 96.4, suffix:"%", trend: 1.1, spark: [93,94,94,95,96,96] },
];

const certTrend = Array.from({length:8}).map((_,i)=>({ month:`Q${(i%4)+1}-${24+Math.floor(i/4)}`, Certifications: 2000+i*350 }));

function Page() {
  return (
    <>
      <PageHeader title="ETQA Performance" subtitle="Education, training & quality assurance · FY 2026" />
      <KpiRibbon kpis={kpis as any} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="APP Target Achievement" subtitle="Annual Performance Plan targets">
          <div className="grid grid-cols-2 gap-4">
            {[{n:"Learners enrolled",v:92},{n:"Certifications",v:88},{n:"Provider audits",v:76},{n:"Compliance",v:96}].map(t=>(
              <div key={t.n} className="rounded-lg border border-border p-4 text-center">
                <div className="text-xs text-muted-foreground mb-2">{t.n}</div>
                <Gauge value={t.v} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Certification Trend"><LineTrend data={certTrend} keys={["Certifications"]} /></Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Provider Accreditation Status">
          <Donut data={[{name:"Accredited",value:280},{name:"Conditional",value:28},{name:"Suspended",value:10}]} />
        </Panel>
        <Panel title="ETQA Scorecard">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Target</th><th className="text-right">Baseline</th><th className="text-right">Current</th><th className="text-right">% Ach.</th><th>Status</th></tr></thead>
            <tbody>{[
              { t:"Learners certified", b:10000, c:12480, ach:124 },
              { t:"Providers audited", b:300, c:280, ach:93 },
              { t:"APP achievement", b:85, c:89, ach:105 },
              { t:"Assessment turnaround (days)", b:14, c:11, ach:127 },
              { t:"Compliance rate", b:95, c:96, ach:101 },
            ].map(r=>(
              <tr key={r.t} className="border-t border-border">
                <td className="py-2">{r.t}</td><td className="text-right">{r.b}</td><td className="text-right">{r.c}</td><td className="text-right">{r.ach}%</td>
                <td><Badge tone={r.ach>=100?"success":r.ach>=90?"warn":"danger"}>{r.ach>=100?"On track":r.ach>=90?"Watch":"Off track"}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </Panel>
      </div>
    </>
  );
}
