import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { LineTrend, HBar } from "@/components/lab/charts";
import { ProvinceHeatMap } from "@/components/lab/sa-map";
import { PROVINCES } from "@/lib/mock-data";
import { useCentreUtilisationHeatmap, useSkillsCentres } from "@/lib/queries/skills-centres";

export const Route = createFileRoute("/app/centres")({ component: Page });

const kpis = [
  { label: "Active Centres", value: 47, trend: 11.9, spark: [38,40,42,44,45,46,47],
    info: { what: "Smart Skills Centres currently operational and reporting utilisation data.", calculation: "COUNT(centre_id) WHERE operational_status = 'Active'.", source: "mart.centre_utilisation_summary" } },
  { label: "Learners Served", value: 28420, trend: 14.6, spark: [20000,22000,23500,25000,26500,27500,28420],
    info: { what: "Total unique learners who attended at least one session across all Smart Skills Centres this financial year.", calculation: "COUNT(DISTINCT learner_id) WHERE attendance_record exists in current FY.", source: "mart.centre_utilisation_summary" } },
  { label: "Avg Utilisation", value: 78.2, suffix:"%", trend: 4.1, spark: [65,68,70,72,74,76,78],
    info: { what: "Average booked capacity across all active centres — how full centres are running relative to their maximum throughput.", calculation: "AVG(booked_sessions ÷ available_capacity × 100) across all active centres.", source: "mart.centre_utilisation_summary" } },
  { label: "Top Centre", value: 96, suffix:"%", trend: 1.0, spark: [88,90,92,93,94,95,96],
    info: { what: "Utilisation rate of the single best-performing centre this period.", calculation: "MAX(utilisation_rate) across all active centres.", source: "mart.centre_utilisation_summary" } },
  { label: "Lowest Centre", value: 34, suffix:"%", trend: -3.5, spark: [50,46,42,40,38,36,34],
    info: { what: "Utilisation rate of the lowest-performing centre — a candidate for the Smart Skills Centre Utilisation Optimiser.", calculation: "MIN(utilisation_rate) across all active centres.", source: "mart.centre_utilisation_summary" } },
  { label: "Forecast Demand", value: 32400, trend: 13.9, spark: [25000,26500,28000,29500,31000,32400],
    info: { what: "Projected learner sessions across all centres for the next 6 months.", calculation: "Illustrative example figure — not yet wired to a live forecast. The real Skills Centre Demand Forecast endpoint (POST /prototype/predict/centre-demand, see the Prototype page) is a documented linear heuristic, not a trained time-series model.", source: "Illustrative — see /app/prototype for the real (heuristic) forecast endpoint" } },
];

// Illustrative example series — not sourced from the real forecast endpoint (see the KPI info above).
const forecast = Array.from({length:18}).map((_,i)=>({month:`M${i+1}`, Actual: i<12 ? 70+Math.sin(i/2)*10+i : null, Forecast: i>=11 ? 80+(i-11)*2 : null }));

function Page() {
  const { data: utilisation = [] } = useCentreUtilisationHeatmap();
  const { data: centres = [] } = useSkillsCentres();

  const heat = utilisation.length > 0
    ? utilisation.map(u => ({ province: u.province, value: u.avg_utilisation }))
    : PROVINCES.map((p,i)=>({province:p, value: 90 - i*6}));

  const ranked = [...centres]
    .sort((a,b) => b.utilisation_pct - a.utilisation_pct)
    .slice(0, 12)
    .map(c => ({ province: c.name, spend: c.utilisation_pct }));

  return (
    <>
      <PageHeader title="Smart Skills Centres" subtitle="47 active centres across 9 provinces" />
      <KpiRibbon kpis={kpis as any} />

      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        <Panel title="National Centre Footprint" subtitle="Utilisation by province" info={{
          what: "Average Smart Skills Centre utilisation by province, used to identify geographic coverage gaps and over/under-served regions.",
          calculation: "AVG(utilisation_pct) across centres, grouped by province.",
          source: "skills_centres (live), grouped by province" }}><ProvinceHeatMap data={heat} /></Panel>
        <Panel title="Centre Utilisation Ranking · top 12" info={{
          what: "The 12 centres with the highest booked-capacity utilisation, ranked descending.",
          calculation: "utilisation_pct per centre, current snapshot.",
          source: "skills_centres (live)" }}><HBar data={ranked} x="spend" y="province" color="var(--success)" /></Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Utilisation Heatmap · last 12 months" info={{
          what: "Month-by-month utilisation intensity for a sample of 7 centres — darker cells indicate fuller booking, used to spot seasonal peak/trough patterns.",
          calculation: "utilisation_rate per centre per month, normalised 0–1 for colour intensity.",
          source: "mart.centre_utilisation_summary, pivoted by centre × month" }}>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({length:84}).map((_,i)=>{
              const v = (Math.sin(i/3) + 1)/2;
              return <div key={i} className="aspect-square rounded" style={{background: `color-mix(in oklab, var(--success) ${v*100}%, var(--muted))`}} />;
            })}
          </div>
          <div className="text-xs text-muted-foreground mt-3">7 centres × 12 months · darker = higher utilisation</div>
        </Panel>
        <Panel title="Demand Forecast" subtitle="Illustrative example — see Prototype for the real forecast" info={{
          what: "Illustrative historical + forecast series for layout purposes. The real forecast (POST /prototype/predict/centre-demand) is a documented linear heuristic — current utilisation + i × 1.5pp/month — not a trained time-series model; try it on the Prototype page's Prediction Engine tab.",
          calculation: "Example data only; dashed segment marks where a forecast would begin.",
          source: "Illustrative — real endpoint: /app/prototype" }}>
          <LineTrend data={forecast} keys={["Actual","Forecast"]} dashedLast />
        </Panel>
      </div>
    </>
  );
}
