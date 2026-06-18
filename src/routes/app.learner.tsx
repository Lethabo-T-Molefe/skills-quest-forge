import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { AreaTrend, HBar, VBar } from "@/components/lab/charts";
import { enrolmentTrend, learnerCohorts, PROVINCES } from "@/lib/mock-data";

export const Route = createFileRoute("/app/learner")({ component: Page });

const kpis = [
  { label: "Total Enrolled", value: 84230, trend: 6.4, spark: [40,42,45,48,55,60,68,78,84] },
  { label: "Total Completed", value: 56740, trend: 7.1, spark: [25,30,33,38,42,47,50,54,56] },
  { label: "Completion Rate", value: 67.4, suffix:"%", trend: 2.1, spark: [60,62,64,65,66,67,67,67,67] },
  { label: "Drop-off Rate", value: 14.8, suffix:"%", trend: -1.4, spark: [18,17,16,16,15,15,15,14,14] },
  { label: "Learners at Risk", value: 3120, trend: 9.2, spark: [2200,2400,2600,2800,2900,3000,3100,3120] },
  { label: "Gender Parity Index", value: 0.96, suffix:"", trend: 1.0, spark: [0.88,0.9,0.91,0.93,0.94,0.95,0.96] as any },
];

const provinceRank = PROVINCES.map((p,i)=>({province:p, spend: 78-i*4}));
const topProviders = Array.from({length:10}).map((_,i)=>({province:`Provider ${String.fromCharCode(65+i)}`, spend: 90-i*5}));
const dropout = Array.from({length:8}).map((_,i)=>({month:`Q${(i%4)+1}-${24+Math.floor(i/4)}`, Learnerships: 10+i, Skills: 8+i*0.6, Bursaries: 5+i*0.4 }));

function Page() {
  return (
    <>
      <PageHeader title="Learner Intelligence" subtitle="Enrolment, completion and risk · FY 2026" />
      <KpiRibbon kpis={kpis as any} />

      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        <Panel title="Enrolment & Completion Trend"><AreaTrend data={enrolmentTrend} keys={["Enrolled","Completed"]} /></Panel>
        <Panel title="Province Performance Ranking"><HBar data={provinceRank} x="spend" y="province" color="var(--success)" /></Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Completion Rate by Provider · top 10"><HBar data={topProviders} x="spend" y="province" /></Panel>
        <Panel title="Dropout Trend by Programme"><VBar data={dropout} x="month" keys={["Learnerships","Skills","Bursaries"]} /></Panel>
      </div>

      <Panel title="Learner Completion Risk Model" subtitle="ML predictions for current cohorts · anonymised">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr><th className="text-left py-2">Cohort</th><th className="text-left">Programme</th><th className="text-left">Province</th><th className="text-right">Enrolled</th><th className="text-right">Predicted Completions</th><th>Risk</th><th className="text-right">Confidence</th></tr>
            </thead>
            <tbody>
              {learnerCohorts.map(c=>(
                <tr key={c.cohort} className="border-t border-border">
                  <td className="py-2 font-mono">{c.cohort}</td><td>{c.programme}</td><td>{c.province}</td>
                  <td className="text-right">{c.enrolled}</td><td className="text-right">{c.predicted}</td>
                  <td><Badge tone={c.risk==="High"?"danger":c.risk==="Medium"?"warn":"success"}>{c.risk}</Badge></td>
                  <td className="text-right">{c.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
