import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { VBar, LineTrend, Donut, HBar } from "@/components/lab/charts";
import { ProvinceHeatMap } from "@/components/lab/sa-map";
import { grantRecords, grantByProvince, PROVINCES } from "@/lib/mock-data";

export const Route = createFileRoute("/app/grants")({ component: Page });

const kpis = [
  { label: "DG Allocated", value: 1240, suffix: "M", trend: 3.2, spark: [800,900,1000,1100,1200,1240],
    info: { what: "Total Discretionary Grant (DG) budget approved for the current financial year.", calculation: "SUM(grant_amount_zar) WHERE grant_type = 'DG' AND status IN ('Approved','Active','Closed').", source: "mart.grant_spending_summary" } },
  { label: "MG Allocated", value: 642, suffix: "M", trend: 1.4, spark: [500,520,560,600,620,642],
    info: { what: "Total Mandatory Grant (MG) budget — the 20% of skills levy returned to qualifying employers — approved for the current financial year.", calculation: "SUM(grant_amount_zar) WHERE grant_type = 'MG' AND status IN ('Approved','Active','Closed').", source: "mart.grant_spending_summary" } },
  { label: "Total Spent", value: 1410, suffix: "M", trend: 8.1, spark: [900,1000,1100,1200,1300,1410],
    info: { what: "Combined DG + MG disbursements confirmed to date in the current financial year.", calculation: "SUM(spent) across all grants, confirmed disbursements only.", source: "mart.grant_spending_summary" } },
  { label: "Under-utilisation", value: 12.4, suffix: "%", trend: -2.3, spark: [18,17,16,14,13,12],
    info: { what: "Share of allocated grant budget that remains unspent and is at risk of being clawed back or reallocated.", calculation: "1 − (SUM(spent) ÷ SUM(allocated)), across active grants.", source: "mart.grant_utilisation" } },
  { label: "Zero-drawdown providers", value: 24, suffix: "", trend: -6.0, spark: [40,38,34,30,27,24],
    info: { what: "Providers with an approved, active grant who have made no drawdown claims in the last 90 days — a leading indicator of stalled implementation.", calculation: "COUNT(DISTINCT provider_id) WHERE status='Active' AND days_since_last_drawdown > 90.", source: "mart.grant_utilisation" } },
  { label: "High-risk grants", value: 31, suffix: "", trend: 4.0, spark: [22,25,27,28,30,31],
    info: { what: "Grants flagged 'High' by the Grant Risk Scorer — typically driven by claim anomalies, provider accreditation issues, or below-average completion rates.", calculation: "COUNT(grant_id) WHERE risk_score >= 70 (Isolation Forest anomaly score, scaled 0–100).", source: "mart.risk_scores ← Grant Risk Scorer model" } },
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
        <Panel title="Funding by Province" subtitle="Utilisation %" info={{
          what: "Grant utilisation rate by province — how much of each province's allocated funding has actually been disbursed.",
          calculation: "SUM(spent) ÷ SUM(allocated) × 100, grouped by employer/provider province.",
          source: "mart.grant_spending_summary" }}>
          <ProvinceHeatMap data={heat} />
        </Panel>
        <Panel title="Budget vs Actual" subtitle="ZAR M by province" info={{
          what: "Compares approved budget against actual confirmed spend for the top provinces, to spot over- or under-spending.",
          calculation: "Budget = SUM(allocated). Actual = SUM(spent), confirmed disbursements only.",
          source: "mart.grant_spending_summary" }}>
          <VBar data={budgetActual} x="province" keys={["Budget","Actual"]} />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel title="Top 10 Programmes by Funding" info={{
          what: "The ten qualification/programme categories receiving the most grant funding this financial year.",
          calculation: "SUM(grant_amount_zar), grouped by programme, ranked descending, top 10 shown.",
          source: "mart.grant_spending_summary" }}><HBar data={topProgs} x="spend" y="province" /></Panel>
        <Panel title="Monthly Spend Trend" info={{
          what: "Cumulative grant spend by month for the current financial year.",
          calculation: "SUM(spent) per calendar month, running total.",
          source: "mart.grant_spending_summary" }}><LineTrend data={monthly} keys={["Spent"]} /></Panel>
        <Panel title="Grant Risk Distribution" info={{
          what: "Proportion of active grants in each risk tier, as scored by the Grant Risk Scorer anomaly detection model.",
          calculation: "Low = score < 40, Medium = 40–69, High ≥ 70, on a 0–100 anomaly score derived from claim patterns, accreditation history, and utilisation.",
          source: "mart.risk_scores ← Grant Risk Scorer (Isolation Forest)" }}>
          <Donut data={[{name:"Low",value:62},{name:"Medium",value:27},{name:"High",value:11}]} />
        </Panel>
      </div>

      <Panel title="Grant Records" subtitle={`${grantRecords.length} grants`} info={{
        what: "Row-level detail for every grant currently tracked, including allocation, spend, utilisation, and the risk tier assigned by the Grant Risk Scorer.",
        calculation: "Util % = spent ÷ allocated × 100 per grant. Risk tier reflects the latest weekly anomaly-detection scoring run.",
        source: "clean.grants · mart.risk_scores", updated: "Risk scores recompute weekly; financial figures refresh daily." }}>
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
