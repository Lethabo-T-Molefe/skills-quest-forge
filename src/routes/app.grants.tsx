import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { VBar, LineTrend, Donut, HBar } from "@/components/lab/charts";
import { ProvinceHeatMap } from "@/components/lab/sa-map";
import { PROVINCES } from "@/lib/mock-data";
import { useGrants, useGrantUtilisationByProvince } from "@/lib/queries/grants";

export const Route = createFileRoute("/app/grants")({ component: Page });

const budgetActual = PROVINCES.slice(0,6).map((p,i)=>({province:p, Budget: 200+i*40, Actual: 180+i*35}));
const monthly = Array.from({length:12}).map((_,i)=>({month:`M${i+1}`, Spent: 80+i*8}));
const topProgs = ["Welders L3","Process Ops L4","Lab Tech L5","Apprentice Mech","Chem Eng Bursary","Boilermaker","Production Sup","SHE Officer","Maintenance Tech","Quality L4"].map((p,i)=>({province:p, spend: 200-i*15}));

function Page() {
  const { data: grants = [], isLoading } = useGrants();
  const { data: utilisation = [] } = useGrantUtilisationByProvince();

  const heat = utilisation.length > 0
    ? utilisation.map(u => ({ province: u.province, value: u.utilisation }))
    : PROVINCES.map((p,i)=>({province:p, value: 95 - i*5}));

  const dgAllocated = grants.filter(g => g.grant_type === "Discretionary").reduce((s,g)=>s+g.allocated,0);
  const mgAllocated = grants.filter(g => g.grant_type === "Mandatory").reduce((s,g)=>s+g.allocated,0);
  const totalSpent = grants.reduce((s,g)=>s+g.spent,0);
  const riskCounts = { Low: 0, Medium: 0, High: 0 } as Record<string, number>;
  for (const g of grants) riskCounts[g.risk] = (riskCounts[g.risk] ?? 0) + 1;

  const kpis = [
    { label: "DG Allocated", value: Math.round(dgAllocated / 1_000_000), suffix: "M", trend: 3.2, spark: [800,900,1000,1100,1200,1240],
      info: { what: "Total Discretionary Grant (DG) budget approved for the current financial year.", calculation: "SUM(allocated) WHERE grant_type = 'Discretionary'.", source: "grants (live)" } },
    { label: "MG Allocated", value: Math.round(mgAllocated / 1_000_000), suffix: "M", trend: 1.4, spark: [500,520,560,600,620,642],
      info: { what: "Total Mandatory Grant (MG) budget — the 20% of skills levy returned to qualifying employers — approved for the current financial year.", calculation: "SUM(allocated) WHERE grant_type = 'Mandatory'.", source: "grants (live)" } },
    { label: "Total Spent", value: Math.round(totalSpent / 1_000_000), suffix: "M", trend: 8.1, spark: [900,1000,1100,1200,1300,1410],
      info: { what: "Combined DG + MG disbursements confirmed to date in the current financial year.", calculation: "SUM(spent) across all grants.", source: "grants (live)" } },
    { label: "Under-utilisation", value: 12.4, suffix: "%", trend: -2.3, spark: [18,17,16,14,13,12],
      info: { what: "Share of allocated grant budget that remains unspent and is at risk of being clawed back or reallocated.", calculation: "1 − (SUM(spent) ÷ SUM(allocated)), across active grants.", source: "mart.grant_utilisation" } },
    { label: "Zero-drawdown providers", value: 24, suffix: "", trend: -6.0, spark: [40,38,34,30,27,24],
      info: { what: "Providers with an approved, active grant who have made no drawdown claims in the last 90 days — a leading indicator of stalled implementation.", calculation: "COUNT(DISTINCT provider_id) WHERE status='Active' AND days_since_last_drawdown > 90.", source: "mart.grant_utilisation" } },
    { label: "High-risk grants", value: riskCounts.High, suffix: "", trend: 4.0, spark: [22,25,27,28,30,31],
      info: { what: "Grants currently flagged 'High' risk.", calculation: "COUNT(grant_id) WHERE risk = 'High'.", source: "grants (live)" } },
  ];

  const riskDonut = grants.length > 0
    ? [{name:"Low",value:riskCounts.Low},{name:"Medium",value:riskCounts.Medium},{name:"High",value:riskCounts.High}]
    : [{name:"Low",value:62},{name:"Medium",value:27},{name:"High",value:11}];

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
          <Donut data={riskDonut} />
        </Panel>
      </div>

      <Panel title="Grant Records" subtitle={isLoading ? "Loading…" : `${grants.length} grants`} info={{
        what: "Row-level detail for every grant currently tracked, including allocation, spend, utilisation, and risk tier.",
        calculation: "Util % = spent ÷ allocated × 100 per grant.",
        source: "grants (live)", updated: "Reflects the current state of the grants table." }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr><th className="text-left py-2">Grant</th><th className="text-left">Provider</th><th className="text-left">Province</th><th className="text-left">Programme</th><th className="text-right">Allocated</th><th className="text-right">Spent</th><th className="text-right">Util %</th><th>Risk</th><th>Status</th></tr>
            </thead>
            <tbody>
              {grants.map(r=>(
                <tr key={r.id} className="border-t border-border">
                  <td className="py-2 font-mono">DG-{r.id}</td><td>{r.provider}</td><td>{r.province}</td><td>{r.programme}</td>
                  <td className="text-right">R {r.allocated.toLocaleString()}</td>
                  <td className="text-right">R {r.spent.toLocaleString()}</td>
                  <td className="text-right">{r.utilisation_pct}%</td>
                  <td><Badge tone={r.risk==="High"?"danger":r.risk==="Medium"?"warn":"success"}>{r.risk}</Badge></td>
                  <td><Badge tone={r.status==="Active"?"success":r.status==="Closed"?"muted":"warn"}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
