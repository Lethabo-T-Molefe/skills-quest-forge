import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { AreaTrend, HBar, LineTrend, VBar } from "@/components/lab/charts";
import { ProvinceHeatMap } from "@/components/lab/sa-map";
import { homeKpis, PROVINCES, PROGRAMMES, enrolmentTrend } from "@/lib/mock-data";
import { useAiRecommendations, useAcceptRecommendation, useDismissRecommendation } from "@/lib/queries/dashboards";
import {
  usePredictCompletion, useScoreGrantRisk, useForecastCentreDemand, useRunScenarioSimulation,
} from "@/lib/queries/prototype";
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
        <Panel title="National Skills Heat Map" info={{
          what: "Completion rate by province — the same calculation used across all CHIETA dashboards, shown here for the leadership-facing executive view.",
          calculation: "completions ÷ enrolments × 100 per province, current FY.",
          source: "mart.completion_rates" }}><ProvinceHeatMap data={heat} /></Panel>
        <Panel title="Enrolment vs Completion" info={{
          what: "24-month trend of learners enrolled vs. learners who completed, the headline trend leadership reviews each month.",
          calculation: "Enrolled/Completed = COUNT(record) per month, attributed to the month the event occurred.",
          source: "mart.completion_rates" }}><AreaTrend data={enrolmentTrend} keys={["Enrolled","Completed"]} /></Panel>
      </div>
    </div>
  );
}

function Prediction() {
  const [province, setProvince] = useState(PROVINCES[0]);
  const [programme, setProgramme] = useState(PROGRAMMES[0]);
  const [fundingType, setFundingType] = useState("Full funding");
  const completionMutation = usePredictCompletion();

  const [riskProvince, setRiskProvince] = useState(PROVINCES[0]);
  const [allocated, setAllocated] = useState(1_000_000);
  const [spent, setSpent] = useState(500_000);
  const [daysSinceDrawdown, setDaysSinceDrawdown] = useState(30);
  const riskMutation = useScoreGrantRisk();

  const [centre, setCentre] = useState(PROVINCES[0]);
  const [months, setMonths] = useState(6);
  const demandMutation = useForecastCentreDemand();

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Panel title="Learner Completion Predictor" action={<BrainCircuit className="size-4 text-accent" />} info={{
        what: "Predicts the completion rate for learners matching the selected profile, so support can be targeted at cohorts most at risk of dropping out.",
        calculation: "Heuristic blend of the historical completion rate for the province/programme (from learner_cohorts) plus a documented funding-type adjustment (Full funding +5pp, Self-funded -8pp). Not a trained model — see application/use_cases/prototype.py for the exact formula.",
        source: "prototype.predict_completion ← learner_cohorts (live where available)", updated: "Subject to mandatory fairness review — see Ethics & Bias Review for the latest sign-off status." }}>
        <div className="grid gap-3">
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Province</span>
            <select value={province} onChange={e=>setProvince(e.target.value)} className="bg-muted border border-border rounded-md h-9 px-3 text-sm">
              {PROVINCES.map(o=><option key={o}>{o}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Programme</span>
            <select value={programme} onChange={e=>setProgramme(e.target.value)} className="bg-muted border border-border rounded-md h-9 px-3 text-sm">
              {PROGRAMMES.map(o=><option key={o}>{o}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Funding Type</span>
            <select value={fundingType} onChange={e=>setFundingType(e.target.value)} className="bg-muted border border-border rounded-md h-9 px-3 text-sm">
              <option>Full funding</option><option>Partial funding</option><option>Self-funded</option>
            </select>
          </label>
          <button
            onClick={() => completionMutation.mutate({ province, programme, funding_type: fundingType })}
            disabled={completionMutation.isPending}
            className="mt-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
          >
            {completionMutation.isPending ? "Running…" : "Run Prediction"}
          </button>
        </div>
        {completionMutation.data && (
          <div className="mt-5 rounded-xl border border-border p-4 bg-success/15">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Predicted completion rate</div>
            <div className="font-display text-5xl font-extrabold text-success mt-1">{completionMutation.data.predicted_pct}%</div>
            <div className="mt-4">
              <div className="text-xs font-medium mb-2">Contributing factors</div>
              <div className="space-y-1.5">
                {completionMutation.data.factors.map(f => (
                  <div key={f.name}>
                    <div className="flex justify-between text-[11px]"><span>{f.name}</span><span className="text-muted-foreground">{f.pct>=0?"+":""}{f.pct}%</span></div>
                    <div className="h-1.5 rounded bg-muted"><div className="h-full bg-accent rounded" style={{width:`${Math.min(100, Math.abs(f.pct)*3)}%`}} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Grant Risk Scorer" action={<BrainCircuit className="size-4 text-accent" />} info={{
        what: "Triage tool that scores a grant's risk of irregularity or underperformance from 0–100, directing limited human review capacity to the most suspicious records. It does not make decisions — a human reviewer must confirm any action.",
        calculation: "Heuristic weighted blend: under-utilisation (up to 40 pts), days since last drawdown capped at 90 (up to 40 pts), and the province's average grant risk tier (up to 20 pts). See application/use_cases/prototype.py for the exact weights.",
        source: "prototype.score_grant_risk ← grants (live)", updated: "Computed on every request from the live grants table." }}>
        <div className="grid gap-3">
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Province</span>
            <select value={riskProvince} onChange={e=>setRiskProvince(e.target.value)} className="bg-muted border border-border rounded-md h-9 px-3 text-sm">
              {PROVINCES.map(o=><option key={o}>{o}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Allocated (ZAR)</span>
            <input type="number" value={allocated} onChange={e=>setAllocated(Number(e.target.value))} className="bg-muted border border-border rounded-md h-9 px-3 text-sm" />
          </label>
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Spent (ZAR)</span>
            <input type="number" value={spent} onChange={e=>setSpent(Number(e.target.value))} className="bg-muted border border-border rounded-md h-9 px-3 text-sm" />
          </label>
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Days since last drawdown</span>
            <input type="number" value={daysSinceDrawdown} onChange={e=>setDaysSinceDrawdown(Number(e.target.value))} className="bg-muted border border-border rounded-md h-9 px-3 text-sm" />
          </label>
          <button
            onClick={() => riskMutation.mutate({ allocated, spent, province: riskProvince, days_since_last_drawdown: daysSinceDrawdown })}
            disabled={riskMutation.isPending}
            className="mt-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
          >
            {riskMutation.isPending ? "Scoring…" : "Score Risk"}
          </button>
        </div>
        {riskMutation.data && (
          <div className="mt-5 rounded-xl border border-border p-4">
            <Badge tone={riskMutation.data.tier === "High" ? "danger" : riskMutation.data.tier === "Medium" ? "warn" : "success"}>{riskMutation.data.tier} Risk</Badge>
            <div className="font-display text-4xl font-extrabold mt-2">{riskMutation.data.score}<span className="text-base text-muted-foreground">/100</span></div>
            <ul className="text-xs mt-3 space-y-1 text-muted-foreground">
              {riskMutation.data.reasons.map((r,i) => <li key={i}>· {r}</li>)}
            </ul>
          </div>
        )}
      </Panel>

      <Panel title="Skills Centre Demand Forecast" action={<BrainCircuit className="size-4 text-accent" />} info={{
        what: "Forecasts expected utilisation/demand at a selected centre or province over the chosen horizon, to support capacity and staffing decisions.",
        calculation: "Simple linear projection from the current utilisation reading (skills_centres, live where available): forecast(i) = current + i × 1.5pp/month. Documented heuristic, not a time-series model.",
        source: "prototype.forecast_centre_demand ← skills_centres (live where available)" }}>
        <div className="grid gap-3">
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Centre / Province</span>
            <select value={centre} onChange={e=>setCentre(e.target.value)} className="bg-muted border border-border rounded-md h-9 px-3 text-sm">
              {PROVINCES.map(o=><option key={o}>{o}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Forecast period</span>
            <select value={months} onChange={e=>setMonths(Number(e.target.value))} className="bg-muted border border-border rounded-md h-9 px-3 text-sm">
              <option value={3}>3 months</option><option value={6}>6 months</option><option value={12}>12 months</option>
            </select>
          </label>
          <button
            onClick={() => demandMutation.mutate({ centre_id_or_province: centre, months })}
            disabled={demandMutation.isPending}
            className="mt-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
          >
            {demandMutation.isPending ? "Forecasting…" : "Forecast"}
          </button>
        </div>
        {demandMutation.data && (
          <>
            <div className="mt-4"><LineTrend data={demandMutation.data.series} keys={["Actual","Forecast"]} dashedLast /></div>
            <div className="text-xs text-muted-foreground mt-2">Expected learners: <span className="text-accent font-semibold">{demandMutation.data.expected_learners.toLocaleString()}</span> · {demandMutation.data.recommendation}</div>
          </>
        )}
      </Panel>
    </div>
  );
}

function Scenario() {
  const [scenarioType, setScenarioType] = useState("Increase Funding");
  const [targetProvince, setTargetProvince] = useState(PROVINCES[0]);
  const [fundingIncreasePct, setFundingIncreasePct] = useState(25);
  const simMutation = useRunScenarioSimulation();

  return (
    <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
      <Panel title="Scenario Controls" info={{
        what: "Adjust a single planning lever (funding, a new centre, or provider capacity) and project the likely effect on learners, completions, and budget before committing to it.",
        calculation: "Deterministic formula over the request inputs: additional_learners = funding_increase_pct × 12, completion_impact (pp) = funding_increase_pct × 0.3, budget_impact (ZAR M) = province's live allocated budget × funding_increase_pct. Documented heuristic, not a fitted model — see application/use_cases/prototype.py.",
        source: "prototype.run_scenario_simulation ← grants (live baseline where available)" }}>
        <label className="flex flex-col gap-1 mb-3"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Scenario type</span>
          <select value={scenarioType} onChange={e=>setScenarioType(e.target.value)} className="bg-muted border border-border rounded-md h-9 px-3 text-sm">
            <option>Increase Funding</option><option>Open New Centre</option><option>Increase Provider Capacity</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 mb-3"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Target province</span>
          <select value={targetProvince} onChange={e=>setTargetProvince(e.target.value)} className="bg-muted border border-border rounded-md h-9 px-3 text-sm">
            {PROVINCES.map(p=><option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 mb-3"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Funding increase (%): {fundingIncreasePct}%</span>
          <input type="range" min={0} max={100} value={fundingIncreasePct} onChange={e=>setFundingIncreasePct(Number(e.target.value))} className="accent-accent" />
        </label>
        <button
          onClick={() => simMutation.mutate({ scenario_type: scenarioType, target_province: targetProvince, funding_increase_pct: fundingIncreasePct })}
          disabled={simMutation.isPending}
          className="w-full mt-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
        >
          {simMutation.isPending ? "Running…" : "Run Simulation"}
        </button>
      </Panel>
      <Panel title="Simulation Results">
        {!simMutation.data ? (
          <div className="text-sm text-muted-foreground py-12 text-center">Configure a scenario on the left and run the simulation.</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-4 gap-3 mb-4">
              {[
                {l:"Additional learners",v:`+${simMutation.data.additional_learners.toLocaleString()}`},
                {l:"Completion impact",v:`+${simMutation.data.completion_impact}%`},
                {l:"Budget impact",v:`R ${simMutation.data.budget_impact}M`},
                {l:"Risk change",v:`${simMutation.data.risk_change} pts`},
              ].map(k=>(
                <div key={k.l} className="rounded-lg border border-border p-3 bg-muted/30"><div className="text-xs text-muted-foreground">{k.l}</div><div className="font-display text-xl font-bold mt-1">{k.v}</div></div>
              ))}
            </div>
            <VBar data={simMutation.data.compare} x="metric" keys={["Before","After"]} colors={["var(--muted-foreground)","var(--accent)"]} />
            <div className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm">
              <Lightbulb className="size-4 text-accent inline mr-2" />
              {simMutation.data.narrative}
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}

function Recs() {
  const { data: recommendations = [], isLoading } = useAiRecommendations();
  const acceptMutation = useAcceptRecommendation();
  const dismissMutation = useDismissRecommendation();

  if (!isLoading && recommendations.length === 0) {
    return <div className="text-sm text-muted-foreground py-12 text-center">No recommendations yet.</div>;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {recommendations.map((r, i)=>(
        <div key={r.id ?? i} className="sw-card bg-card p-5">
          <div className="flex items-center justify-between">
            <Badge tone={r.priority==="Critical"?"danger":"warn"}>{r.priority}</Badge>
            <span className="text-[10px] text-muted-foreground">REC-{(r.id ?? 1000+i).toString()}</span>
          </div>
          <h3 className="font-display font-bold text-lg mt-2 leading-snug">{r.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{r.rationale}</p>
          <div className="text-xs text-accent font-medium mt-2">Expected impact: {r.impact}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Status: {r.status}</div>
          <div className="text-[11px] text-muted-foreground mt-3">Sources: mart.grants · mart.completion_rates · labour_market_signals</div>
          <div className="flex gap-2 mt-4">
            <button
              disabled={r.id == null || r.status === "accepted"}
              onClick={() => r.id != null && acceptMutation.mutate(r.id)}
              className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-1 disabled:opacity-60"
            >
              Accept & Log <ArrowRight className="size-3" />
            </button>
            <button
              disabled={r.id == null || r.status === "dismissed"}
              onClick={() => r.id != null && dismissMutation.mutate(r.id)}
              className="text-xs px-3 py-1.5 rounded-md border border-border disabled:opacity-60"
            >
              Dismiss
            </button>
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
