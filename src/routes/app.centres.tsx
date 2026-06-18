import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { LineTrend, HBar } from "@/components/lab/charts";
import { ProvinceHeatMap } from "@/components/lab/sa-map";
import { PROVINCES } from "@/lib/mock-data";

export const Route = createFileRoute("/app/centres")({ component: Page });

const kpis = [
  { label: "Active Centres", value: 47, trend: 11.9, spark: [38,40,42,44,45,46,47] },
  { label: "Learners Served", value: 28420, trend: 14.6, spark: [20000,22000,23500,25000,26500,27500,28420] },
  { label: "Avg Utilisation", value: 78.2, suffix:"%", trend: 4.1, spark: [65,68,70,72,74,76,78] },
  { label: "Top Centre", value: 96, suffix:"%", trend: 1.0, spark: [88,90,92,93,94,95,96] },
  { label: "Lowest Centre", value: 34, suffix:"%", trend: -3.5, spark: [50,46,42,40,38,36,34] },
  { label: "Forecast Demand", value: 32400, trend: 13.9, spark: [25000,26500,28000,29500,31000,32400] },
];

const heat = PROVINCES.map((p,i)=>({province:p, value: 90 - i*6}));
const ranked = Array.from({length:12}).map((_,i)=>({province:`Centre ${String.fromCharCode(65+i)}`, spend: 95-i*5}));
const forecast = Array.from({length:18}).map((_,i)=>({month:`M${i+1}`, Actual: i<12 ? 70+Math.sin(i/2)*10+i : null, Forecast: i>=11 ? 80+(i-11)*2 : null }));

function Page() {
  return (
    <>
      <PageHeader title="Smart Skills Centres" subtitle="47 active centres across 9 provinces" />
      <KpiRibbon kpis={kpis as any} />

      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        <Panel title="National Centre Footprint" subtitle="Utilisation by province"><ProvinceHeatMap data={heat} /></Panel>
        <Panel title="Centre Utilisation Ranking · top 12"><HBar data={ranked} x="spend" y="province" color="var(--success)" /></Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Utilisation Heatmap · last 12 months">
          <div className="grid grid-cols-12 gap-1">
            {Array.from({length:84}).map((_,i)=>{
              const v = (Math.sin(i/3) + 1)/2;
              return <div key={i} className="aspect-square rounded" style={{background: `color-mix(in oklab, var(--success) ${v*100}%, var(--muted))`}} />;
            })}
          </div>
          <div className="text-xs text-muted-foreground mt-3">7 centres × 12 months · darker = higher utilisation</div>
        </Panel>
        <Panel title="Demand Forecast" subtitle="Historical + 6-month AI forecast">
          <LineTrend data={forecast} keys={["Actual","Forecast"]} dashedLast />
        </Panel>
      </div>
    </>
  );
}
