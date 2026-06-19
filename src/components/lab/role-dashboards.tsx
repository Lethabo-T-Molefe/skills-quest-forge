import { Link } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { AreaTrend, HBar } from "@/components/lab/charts";
import {
  homeKpis, riskAlerts, recentActivity, aiRecommendations, datasets, datasetApprovals,
  popiaScorecard, biasModels, explainabilityFactors, pipelineRuns, mlExperiments, tasks,
  grantByProvince, enrolmentTrend, auditLog,
} from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { ROLE_BLURB, ROLE_IDENTITY } from "@/lib/roles";
import {
  ArrowRight, Sparkles, Users, Database, ShieldCheck, Activity, FlaskConical,
  Award, GitBranch, ScrollText,
} from "lucide-react";
import type { ReactNode } from "react";

function StatTile({ label, value, tone }: { label: string; value: string; tone?: "danger" | "warn" | "success" }) {
  const color = tone === "danger" ? "text-danger" : tone === "warn" ? "text-accent" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="sw-card bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-display text-3xl font-extrabold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function QuickLinks({ links }: { links: { label: string; to: string; icon: ReactNode }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map(l => (
        <Link key={l.to} to={l.to} className="sw-pill-white !py-2 !px-3 !shadow-none border-ink text-xs">
          {l.icon} {l.label}
        </Link>
      ))}
    </div>
  );
}

function statusTone(s: string) {
  return s === "Success" || s === "Production" || s === "Approved" || s === "Pass" ? "success"
    : s === "Warning" || s === "Staging" || s === "Pending" || s === "Watch" ? "warn"
    : s === "Failed" || s === "Rejected" || s === "Fail" ? "danger" : "muted";
}

export function RoleDashboard() {
  const { role } = useRole();
  switch (role) {
    case "System Admin": return <AdminDashboard />;
    case "Data Steward": return <StewardDashboard />;
    case "Data Engineer": return <EngineerDashboard />;
    case "Data Analyst": return <AnalystDashboard />;
    case "Data Scientist": return <ScientistDashboard />;
    case "Student Dev": return <StudentDashboard />;
    case "Viewer / Exec": return <ExecDashboard />;
    case "Auditor": return <AuditorDashboard />;
  }
}

function RoleHeader({ title }: { title: string }) {
  const { role } = useRole();
  return <PageHeader title={title} subtitle={`${ROLE_IDENTITY[role].name} · ${ROLE_BLURB[role]}`} />;
}

function AdminDashboard() {
  const pending = datasetApprovals.filter(d => d.status === "Pending").length;
  return (
    <>
      <RoleHeader title="System Admin Console" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Active users" value="8" />
        <StatTile label="Platform uptime" value="99.98%" tone="success" />
        <StatTile label="Pending dataset approvals" value={String(pending)} tone={pending > 0 ? "warn" : "success"} />
        <StatTile label="Open risk alerts" value={String(riskAlerts.length)} tone="danger" />
      </div>
      <QuickLinks links={[
        { label: "User Management", to: "/app/users", icon: <Users className="size-3.5" /> },
        { label: "Role Management", to: "/app/roles", icon: <ShieldCheck className="size-3.5" /> },
        { label: "Audit Logs", to: "/app/audit", icon: <ScrollText className="size-3.5" /> },
        { label: "System Health", to: "/app/health", icon: <Activity className="size-3.5" /> },
      ]} />
      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        <div className="flex flex-col gap-6">
          <Panel title="Platform Health" subtitle="All services operational">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["API", "Database", "Storage", "Auth Service"].map(s => (
                <div key={s} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-success animate-pulse" /><span className="text-xs font-medium">{s}</span></div>
                  <div className="text-[11px] text-muted-foreground mt-1">Operational</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Pending Dataset Approvals" action={<Link to="/app/governance" className="text-xs text-primary hover:underline">View all →</Link>}>
            <ul className="flex flex-col divide-y divide-border">
              {datasetApprovals.map(d => (
                <li key={d.dataset} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="text-sm">{d.dataset}<span className="text-xs text-muted-foreground ml-2">{d.owner}</span></div>
                  <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="flex flex-col gap-6">
          <Panel title="Risk Alerts" action={<Badge tone="danger">{riskAlerts.length} open</Badge>}
            info={{ what: "Automatically surfaced risks where a tracked metric has breached a defined threshold — e.g. a completion-rate drop, a grant with no drawdown activity, or a capacity imbalance.",
              calculation: "Severity is set by how far the metric has moved from its rolling baseline: High = >10% deviation or a hard compliance breach, Medium = 5–10%, Low = <5% or a forecast-only signal.",
              source: "Governance Engine, evaluated nightly against mart.* summary tables" }}>
            <ul className="flex flex-col divide-y divide-border">
              {riskAlerts.slice(0, 4).map(r => (
                <li key={r.title} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.detail}</div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Recent Activity" info={{
            what: "A live feed of user actions across the Data Lab — uploads, dataset approvals, dashboard publishes, role changes, and ML experiment runs.",
            calculation: "Most recent 5 entries from the platform audit log, sorted by timestamp descending.",
            source: "audit.audit_logs" }}>
            <ul className="text-sm flex flex-col gap-2">
              {recentActivity.map((a, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="size-7 rounded-full bg-muted text-foreground grid place-items-center text-[10px] font-bold">{a.who.split(" ").map(x => x[0]).join("")}</div>
                  <div className="flex-1"><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></div>
                  <span className="text-xs text-muted-foreground">{a.when}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function StewardDashboard() {
  const passing = popiaScorecard.filter(c => c.status === "Pass").length;
  const pending = datasetApprovals.filter(d => d.status === "Pending").length;
  return (
    <>
      <RoleHeader title="Data Governance Desk" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Datasets classified" value="8/8" tone="success" />
        <StatTile label="POPIA controls passing" value={`${passing}/${popiaScorecard.length}`} tone="success" />
        <StatTile label="Pending approvals" value={String(pending)} tone={pending > 0 ? "warn" : "success"} />
        <StatTile label="Avg dataset quality" value={`${Math.round(datasets.reduce((s, d) => s + d.score, 0) / datasets.length)}/100`} />
      </div>
      <QuickLinks links={[
        { label: "Data Governance & POPIA", to: "/app/governance", icon: <ShieldCheck className="size-3.5" /> },
        { label: "Data Quality", to: "/app/quality", icon: <Database className="size-3.5" /> },
        { label: "Dataset Catalogue", to: "/app/datasets", icon: <Database className="size-3.5" /> },
      ]} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Dataset Approval Queue" subtitle="Awaiting your sign-off">
          <ul className="flex flex-col divide-y divide-border">
            {datasetApprovals.map(d => (
              <li key={d.dataset} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{d.dataset}</div>
                  <div className="text-xs text-muted-foreground">{d.owner} · submitted {d.submitted}</div>
                </div>
                <Badge tone={statusTone(d.status)}>{d.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="POPIA Compliance Scorecard">
          <ul className="flex flex-col divide-y divide-border">
            {popiaScorecard.map(c => (
              <li key={c.control} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <span className="text-sm">{c.control}</span>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Dataset Quality Overview">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          {datasets.map(d => (
            <div key={d.name} className="rounded-lg border border-border p-3">
              <div className="text-sm font-medium truncate">{d.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{d.classification}</div>
              <div className="h-1.5 rounded bg-muted mt-2 overflow-hidden"><div style={{ width: `${d.score}%`, background: d.score > 80 ? "var(--success)" : d.score > 60 ? "var(--accent)" : "var(--danger)" }} className="h-full" /></div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

function EngineerDashboard() {
  const healthy = pipelineRuns.filter(p => p.status === "Success").length;
  return (
    <>
      <RoleHeader title="Data Engineering Workbench" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Pipelines healthy" value={`${healthy}/${pipelineRuns.length}`} tone={healthy === pipelineRuns.length ? "success" : "warn"} />
        <StatTile label="Datasets ingested" value={String(datasets.length)} />
        <StatTile label="Avg quality score" value={`${Math.round(datasets.reduce((s, d) => s + d.score, 0) / datasets.length)}/100`} />
        <StatTile label="Failed validation rules" value="3" tone="danger" />
      </div>
      <QuickLinks links={[
        { label: "Upload Dataset", to: "/app/upload", icon: <Database className="size-3.5" /> },
        { label: "Data Quality", to: "/app/quality", icon: <ShieldCheck className="size-3.5" /> },
        { label: "Data Lineage", to: "/app/lineage", icon: <GitBranch className="size-3.5" /> },
        { label: "SQL Lab", to: "/app/sql", icon: <Database className="size-3.5" /> },
      ]} />
      <Panel title="Pipeline Runs" subtitle="Last batch · today 02:00">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">DAG</th><th className="text-left">Last run</th><th className="text-left">Duration</th><th className="text-right">Rows</th><th>Status</th></tr></thead>
          <tbody>
            {pipelineRuns.map(p => (
              <tr key={p.dag} className="border-t border-border">
                <td className="py-2 font-medium">{p.dag}</td><td className="text-muted-foreground">{p.lastRun}</td>
                <td className="text-muted-foreground">{p.duration}</td><td className="text-right">{p.rows.toLocaleString()}</td>
                <td><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Panel title="Data Quality by Dataset">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          {datasets.map(d => (
            <div key={d.name} className="rounded-lg border border-border p-3">
              <div className="text-sm font-medium truncate">{d.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{d.rows.toLocaleString()} rows · {d.cols} cols</div>
              <div className="h-1.5 rounded bg-muted mt-2 overflow-hidden"><div style={{ width: `${d.score}%`, background: d.score > 80 ? "var(--success)" : d.score > 60 ? "var(--accent)" : "var(--danger)" }} className="h-full" /></div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

function AnalystDashboard() {
  return (
    <>
      <RoleHeader title="Analyst Workspace" />
      <KpiRibbon kpis={homeKpis} />
      <QuickLinks links={[
        { label: "SQL Lab", to: "/app/sql", icon: <Database className="size-3.5" /> },
        { label: "Data Explorer", to: "/app/explorer", icon: <Database className="size-3.5" /> },
        { label: "My Dashboards", to: "/app/my-dashboards", icon: <Sparkles className="size-3.5" /> },
      ]} />
      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        <div className="flex flex-col gap-6">
          <Panel title="National Skills Performance" subtitle="Enrolment vs completion · last 24 months"
            info={{ what: "Monthly count of learners enrolled vs. learners who completed their programme, across all CHIETA-funded provisioning, over the trailing 24 months.",
              calculation: "Enrolled = COUNT(enrolments) per calendar month. Completed = COUNT(completions) per month, attributed to the month the completion was recorded, not the enrolment month.",
              source: "mart.completion_rates ← clean.learners, clean.enrolments" }}>
            <AreaTrend data={enrolmentTrend} keys={["Enrolled", "Completed"]} />
          </Panel>
          <Panel title="Grant Spend by Province" subtitle="ZAR millions · current FY"
            info={{ what: "Total grant disbursement (DG + MG) by province for the current financial year, plus each province's utilisation rate against its allocated budget.",
              calculation: "spend = SUM(grant_amount_zar) WHERE disbursement confirmed, grouped by employer/provider province. utilisation = spend ÷ allocated.",
              source: "mart.grant_spending_summary ← clean.grants" }}>
            <HBar data={grantByProvince} x="spend" y="province" color="var(--accent)" />
          </Panel>
        </div>
        <div className="flex flex-col gap-6">
          <Panel title="My Saved Dashboards" action={<Link to="/app/my-dashboards" className="text-xs text-primary hover:underline">View all →</Link>}>
            <ul className="flex flex-col divide-y divide-border text-sm">
              {["My Grants Watchlist", "Province Deep-Dive: KZN", "Provider Risk Tracker", "Apprenticeship Pipeline"].map(d => (
                <li key={d} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <span>{d}</span><ArrowRight className="size-3.5 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Recent Activity">
            <ul className="text-sm flex flex-col gap-2">
              {recentActivity.slice(0, 4).map((a, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="size-7 rounded-full bg-muted text-foreground grid place-items-center text-[10px] font-bold">{a.who.split(" ").map(x => x[0]).join("")}</div>
                  <div className="flex-1"><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function ScientistDashboard() {
  const inProd = mlExperiments.filter(e => e.status === "Production").length;
  const pendingBias = biasModels.filter(b => b.status === "Pending review").length;
  return (
    <>
      <RoleHeader title="Data Science Lab" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Models in production" value={String(inProd)} tone="success" />
        <StatTile label="Experiments tracked" value={String(mlExperiments.length)} />
        <StatTile label="Bias reviews pending" value={String(pendingBias)} tone={pendingBias > 0 ? "warn" : "success"} />
        <StatTile label="Learners at risk flagged" value="3,120" tone="danger" />
      </div>
      <QuickLinks links={[
        { label: "Notebooks", to: "/app/notebooks", icon: <FlaskConical className="size-3.5" /> },
        { label: "Prediction Engine", to: "/app/prototype", icon: <Sparkles className="size-3.5" /> },
        { label: "Ethics & Bias Review", to: "/app/ethics", icon: <ShieldCheck className="size-3.5" /> },
      ]} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="ML Experiments" subtitle="MLflow registry">
          <ul className="flex flex-col divide-y divide-border">
            {mlExperiments.map(e => (
              <li key={e.name} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.model} · {e.metric}</div>
                </div>
                <Badge tone={statusTone(e.status)}>{e.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Models Under Ethics Review" action={<Link to="/app/ethics" className="text-xs text-primary hover:underline">Open review →</Link>}>
          <ul className="flex flex-col divide-y divide-border">
            {biasModels.map(m => (
              <li key={m.model} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{m.model}</div>
                  <div className="text-xs text-muted-foreground">Last reviewed {m.lastReviewed}</div>
                </div>
                <Badge tone={statusTone(m.status)}>{m.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Explainability Summary" subtitle="Top contributing features · Learner Completion Predictor">
        <div className="space-y-3 max-w-xl">
          {explainabilityFactors.map(f => (
            <div key={f.feature}>
              <div className="flex justify-between text-xs mb-1"><span className="font-medium">{f.feature}</span><span className="text-muted-foreground">{f.pct}%</span></div>
              <div className="h-2 rounded bg-muted"><div className="h-full bg-accent rounded" style={{ width: `${f.pct * 3}%` }} /></div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

function StudentDashboard() {
  const done = tasks.filter(t => t.status === "Done").length;
  return (
    <>
      <RoleHeader title="Student Workspace" />
      <div className="grid sm:grid-cols-3 gap-4">
        <StatTile label="Tasks completed" value="42" tone="success" />
        <StatTile label="Hours logged" value="186" />
        <StatTile label="Badges earned" value="3" />
      </div>
      <QuickLinks links={[
        { label: "My Tasks", to: "/app/tasks", icon: <Award className="size-3.5" /> },
        { label: "Contributions", to: "/app/contributions", icon: <Award className="size-3.5" /> },
        { label: "SQL Lab (sandbox)", to: "/app/sql", icon: <Database className="size-3.5" /> },
      ]} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Sprint 12 — Data Cleaning" subtitle={`${done}/${tasks.length} tasks done`}>
          <ul className="flex flex-col divide-y divide-border">
            {tasks.map(t => (
              <li key={t.title} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">Due {t.due} · reviewer {t.by}</div>
                </div>
                <Badge tone={t.status === "Done" ? "success" : t.status === "In Progress" ? "warn" : "muted"}>{t.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Onboarding & Mentorship">
          <ul className="flex flex-col gap-2.5 text-sm">
            {["Technical training completed", "Code of conduct & confidentiality agreement signed", "Paired with mentor: S. Naidoo", "First pull request merged", "Capstone topic selection — in progress"].map((c, i) => (
              <li key={c} className="flex items-start gap-2">
                <div className={`size-4 rounded-full mt-0.5 shrink-0 grid place-items-center text-[9px] font-bold ${i < 4 ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>{i < 4 ? "✓" : "·"}</div>
                <span className={i < 4 ? "" : "text-muted-foreground"}>{c}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

function ExecDashboard() {
  return (
    <>
      <RoleHeader title="Leadership Overview" />
      <KpiRibbon kpis={homeKpis} />
      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        <div className="flex flex-col gap-6">
          <Panel title="National Skills Performance" subtitle="Enrolment vs completion · last 24 months"
            info={{ what: "Monthly count of learners enrolled vs. learners who completed their programme, across all CHIETA-funded provisioning, over the trailing 24 months.",
              calculation: "Enrolled = COUNT(enrolments) per calendar month. Completed = COUNT(completions) per month, attributed to the month the completion was recorded, not the enrolment month.",
              source: "mart.completion_rates ← clean.learners, clean.enrolments" }}>
            <AreaTrend data={enrolmentTrend} keys={["Enrolled", "Completed"]} />
          </Panel>
          <Panel title="AI Recommendations" subtitle="Generated by CHIETA Intelligence" action={<Sparkles className="size-4 text-accent" />} info={{
            what: "Suggested interventions generated by the Recommendation Engine by combining signals from the Grant Risk Scorer, Learner Completion Predictor, and labour market data.",
            calculation: "Each recommendation is scored on expected impact and confidence; only recommendations above the confidence threshold and not yet dismissed are shown.",
            source: "mart.grants · mart.completion_rates · labour_market_signals", updated: "Recomputed nightly; impact estimates are model-based projections, not guarantees." }}>
            <ul className="flex flex-col gap-3">
              {aiRecommendations.map(r => (
                <li key={r.title} className="rounded-lg border border-border p-3 bg-muted/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">{r.title}</div>
                    <Badge tone={r.priority === "Critical" ? "danger" : r.priority === "High" ? "warn" : "info"}>{r.priority}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{r.rationale}</div>
                  <div className="text-xs text-accent font-medium mt-2">Impact: {r.impact}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="flex flex-col gap-6">
          <Panel title="Risk Alerts" action={<Badge tone="danger">{riskAlerts.length} open</Badge>}
            info={{ what: "Automatically surfaced risks where a tracked metric has breached a defined threshold — e.g. a completion-rate drop, a grant with no drawdown activity, or a capacity imbalance.",
              calculation: "Severity is set by how far the metric has moved from its rolling baseline: High = >10% deviation or a hard compliance breach, Medium = 5–10%, Low = <5% or a forecast-only signal.",
              source: "Governance Engine, evaluated nightly against mart.* summary tables" }}>
            <ul className="flex flex-col divide-y divide-border">
              {riskAlerts.map(r => (
                <li key={r.title} className="py-3 first:pt-0 last:pb-0">
                  <Badge tone={r.severity === "High" ? "danger" : r.severity === "Medium" ? "warn" : "info"}>{r.severity}</Badge>
                  <div className="text-sm font-medium mt-1.5">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.detail}</div>
                </li>
              ))}
            </ul>
          </Panel>
          <Link to="/app/prototype" className="sw-card bg-card p-5 flex items-center justify-between hover:bg-muted/40 transition-colors">
            <div>
              <div className="font-display font-extrabold uppercase tracking-tight">Skills Intelligence Platform</div>
              <div className="text-xs text-muted-foreground mt-1">Open the leadership prototype demo</div>
            </div>
            <ArrowRight className="size-5 text-accent" />
          </Link>
        </div>
      </div>
    </>
  );
}

function AuditorDashboard() {
  const failed = auditLog.filter(a => a.status === "Failed").length;
  const passing = popiaScorecard.filter(c => c.status === "Pass").length;
  return (
    <>
      <RoleHeader title="Audit & Compliance Console" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Audit events (30d)" value={String(auditLog.length)} />
        <StatTile label="Failed login attempts" value={String(failed)} tone={failed > 0 ? "warn" : "success"} />
        <StatTile label="POPIA controls passing" value={`${passing}/${popiaScorecard.length}`} tone="success" />
        <StatTile label="Open compliance items" value="1" tone="warn" />
      </div>
      <QuickLinks links={[
        { label: "Audit Logs", to: "/app/audit", icon: <ScrollText className="size-3.5" /> },
        { label: "Data Governance & POPIA", to: "/app/governance", icon: <ShieldCheck className="size-3.5" /> },
        { label: "Ethics & Bias Review", to: "/app/ethics", icon: <ShieldCheck className="size-3.5" /> },
        { label: "Data Lineage", to: "/app/lineage", icon: <GitBranch className="size-3.5" /> },
      ]} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Recent Audit Events">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground uppercase text-[10px] tracking-wider"><tr><th className="text-left py-2">Timestamp</th><th className="text-left">User</th><th className="text-left">Action</th><th>Status</th></tr></thead>
            <tbody>
              {auditLog.slice(0, 8).map((a, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-2 font-mono">{a.ts}</td><td>{a.user}</td><td>{a.action}</td>
                  <td><Badge tone={a.status === "Success" ? "success" : "danger"}>{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="POPIA Compliance Scorecard">
          <ul className="flex flex-col divide-y divide-border">
            {popiaScorecard.map(c => (
              <li key={c.control} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <span className="text-sm">{c.control}</span>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
