import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { AreaTrend, HBar, LineTrend, VBar } from "@/components/lab/charts";
import { ProvinceHeatMap } from "@/components/lab/sa-map";
import { homeKpis, PROVINCES, PROGRAMMES, aiRecommendations, enrolmentTrend } from "@/lib/mock-data";
import { Sparkles, Presentation, Download, ArrowRight, BrainCircuit, Lightbulb } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/prototype")({ component: Page });

const TABS = ["Executive View", "Prediction Engine", "Scenario Simulator", "Recommendations", "Export"] as const;
type Tab = typeof TABS[number];

function Page() {
  const [tab, setTab] = useState<Tab>("Executive View");

  return (
    <div className="relative -m-6 p-6 bg-gradient-to-br from-background via-card to-background">
      <div className="absolute top-4 right-6"><Badge tone="accent">PROTOTYPE</Badge></div>

      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent">
          <Sparkles className="size-3.5" /> CHIETA Intelligence
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">CHIETA Skills Intelligence & Decision Support</h1>
        <p className="text-sm text-muted-foreground mt-1">Powered by real CHIETA data · AI-assisted · Leadership-ready</p>
      </div>

      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab===t ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "Executive View" && <ExecView />}
      {tab === "Prediction Engine" && <Prediction />}
      {tab === "Scenario Simulator" && <Scenario />}
      {tab === "Recommendations" && <Recs />}
      {tab === "Export" && <Export />}
    </div>
  );
}

function ExecView() {
  const heat = PROVINCES.map((p,i)=>({province:p, value: 78 - i*4}));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button className="text-sm px-3 py-2 rounded-md bg-accent text-accent-foreground inline-flex items-center gap-2"><Presentation className="size-4" /> Present Mode</button>
      </div>
      <KpiRibbon kpis={homeKpis} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="National Skills Heat Map"><ProvinceHeatMap data={heat} /></Panel>
        <Panel title="Enrolment vs Completion"><AreaTrend data={enrolmentTrend} keys={["Enrolled","Completed"]} /></Panel>
      </div>
    </div>
  );
}

function Prediction() {
  const [pred, setPred] = useState<number | null>(null);
  const factors = [
    { name: "Province (Gauteng)", pct: 24 },
    { name: "Programme: Learnerships", pct: 19 },
    { name: "Provider track record", pct: 17 },
    { name: "Funding type: DG", pct: 12 },
    { name: "Cohort size", pct: 8 },
  ];
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Panel title="Learner Completion Predictor" action={<BrainCircuit className="size-4 text-accent" />}>
        <div className="grid gap-3">
          {["Province","Programme","Provider","Gender","Funding Type"].map(l => (
            <label key={l} className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">{l}</span>
              <select className="bg-muted border border-border rounded-md h-9 px-3 text-sm">
                {(l==="Province"?PROVINCES:l==="Programme"?PROGRAMMES:["Skills Co.","TechAcademy SA","TradesFirst"]).map(o=><option key={o}>{o}</option>)}
              </select>
            </label>
          ))}
          <button onClick={()=>setPred(74)} className="mt-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">Run Prediction</button>
        </div>
        {pred !== null && (
          <div className="mt-5 rounded-xl border border-border p-4 bg-success/15">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Predicted completion probability</div>
            <div className="font-display text-5xl font-extrabold text-success mt-1">{pred}%</div>
            <div className="text-xs text-muted-foreground mt-2">High-confidence range 70–78% · n=1,240 similar cohorts</div>
            <div className="mt-4">
              <div className="text-xs font-medium mb-2">Top contributing factors (SHAP)</div>
              <div className="space-y-1.5">
                {factors.map(f => (
                  <div key={f.name}>
                    <div className="flex justify-between text-[11px]"><span>{f.name}</span><span className="text-muted-foreground">+{f.pct}%</span></div>
                    <div className="h-1.5 rounded bg-muted"><div className="h-full bg-accent rounded" style={{width:`${f.pct*3}%`}} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Grant Risk Scorer" action={<BrainCircuit className="size-4 text-accent" />}>
        <div className="grid gap-3">
          {["Province","Provider","Programme Type"].map(l => (
            <label key={l} className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">{l}</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>Gauteng</option></select></label>
          ))}
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Budget (ZAR)</span><input type="range" defaultValue={50} className="accent-accent" /></label>
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Previous Completion Rate</span><input type="range" defaultValue={68} className="accent-accent" /></label>
        </div>
        <div className="mt-5 rounded-xl border border-border p-4">
          <Badge tone="warn">Medium Risk</Badge>
          <div className="font-display text-4xl font-extrabold mt-2">52<span className="text-base text-muted-foreground">/100</span></div>
          <ul className="text-xs mt-3 space-y-1 text-muted-foreground">
            <li>· Provider has 2 conditional accreditations in last 18 months</li>
            <li>· Programme dropout rate 6pp above sector average</li>
            <li>· Province under-utilisation 14% in prior FY</li>
          </ul>
        </div>
      </Panel>

      <Panel title="Skills Centre Demand Forecast" action={<BrainCircuit className="size-4 text-accent" />}>
        <div className="grid gap-3">
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Centre</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>Sasolburg Smart Centre</option></select></label>
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Forecast period</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>6 months</option><option>3</option><option>12</option></select></label>
        </div>
        <div className="mt-4"><LineTrend data={Array.from({length:18}).map((_,i)=>({month:`M${i+1}`, Actual: i<12?70+i:null, Forecast: i>=11?80+(i-11)*2:null}))} keys={["Actual","Forecast"]} dashedLast /></div>
        <div className="text-xs text-muted-foreground mt-2">Expected learners: <span className="text-accent font-semibold">2,420</span> · Recommend +1 facilitator</div>
      </Panel>
    </div>
  );
}

function Scenario() {
  const [ran, setRan] = useState(false);
  const compare = [
    { metric:"Enrolled", Before: 8400, After: 11200 },
    { metric:"Completed", Before: 5670, After: 7820 },
    { metric:"Spend (M)", Before: 240, After: 295 },
  ];
  return (
    <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
      <Panel title="Scenario Controls">
        <label className="flex flex-col gap-1 mb-3"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Scenario type</span>
          <select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>Increase Funding</option><option>Open New Centre</option><option>Increase Provider Capacity</option></select>
        </label>
        <label className="flex flex-col gap-1 mb-3"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Target province</span>
          <select className="bg-muted border border-border rounded-md h-9 px-3 text-sm">{PROVINCES.map(p=><option key={p}>{p}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 mb-3"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Funding increase (%)</span>
          <input type="range" defaultValue={25} className="accent-accent" />
        </label>
        <button onClick={()=>setRan(true)} className="w-full mt-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">Run Simulation</button>
      </Panel>
      <Panel title="Simulation Results">
        {!ran ? (
          <div className="text-sm text-muted-foreground py-12 text-center">Configure a scenario on the left and run the simulation.</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-4 gap-3 mb-4">
              {[{l:"Additional learners",v:"+2,800"},{l:"Completion impact",v:"+12%"},{l:"Budget impact",v:"R 55M"},{l:"Risk change",v:"-4 pts"}].map(k=>(
                <div key={k.l} className="rounded-lg border border-border p-3 bg-muted/30"><div className="text-xs text-muted-foreground">{k.l}</div><div className="font-display text-xl font-bold mt-1">{k.v}</div></div>
              ))}
            </div>
            <VBar data={compare} x="metric" keys={["Before","After"]} colors={["var(--muted-foreground)","var(--accent)"]} />
            <div className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm">
              <Lightbulb className="size-4 text-accent inline mr-2" />
              A 25% funding increase to KZN is expected to onboard 2,800 additional learners and lift completion by 12pp, with a moderate budget impact of R 55M.
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}

function Recs() {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {[...aiRecommendations, ...aiRecommendations.slice(0,2)].map((r,i)=>(
        <div key={i} className="sw-card bg-card p-5">
          <div className="flex items-center justify-between"><Badge tone={r.priority==="Critical"?"danger":"warn"}>{r.priority}</Badge><span className="text-[10px] text-muted-foreground">REC-{(1000+i).toString()}</span></div>
          <h3 className="font-display font-bold text-lg mt-2 leading-snug">{r.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{r.rationale}</p>
          <div className="text-xs text-accent font-medium mt-2">Expected impact: {r.impact}</div>
          <div className="text-[11px] text-muted-foreground mt-3">Sources: mart.grants · mart.completion_rates · labour_market_signals</div>
          <div className="flex gap-2 mt-4">
            <button className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-1">Accept & Log <ArrowRight className="size-3" /></button>
            <button className="text-xs px-3 py-1.5 rounded-md border border-border">Dismiss</button>
            <button className="text-xs px-3 py-1.5 rounded-md border border-border">Explore Data</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Export() {
  return (
    <Panel title="Generate Leadership Report">
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-2">Include sections</div>
          {["Executive KPIs","Prediction Engine outputs","Scenario simulations","Recommendations","Audit summary"].map(s=>(
            <label key={s} className="flex items-center gap-2 text-sm py-1.5"><input type="checkbox" defaultChecked className="accent-accent" /> {s}</label>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Format</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>PDF (branded)</option><option>Excel</option><option>PNG slides</option></select></label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider"><span>Date range</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>Last quarter</option></select></label>
          <button className="mt-4 px-3 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium inline-flex items-center justify-center gap-2"><Download className="size-4"/> Generate Report</button>
        </div>
      </div>
    </Panel>
  );
}
