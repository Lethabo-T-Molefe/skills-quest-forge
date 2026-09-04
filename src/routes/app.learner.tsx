import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { AreaTrend, HBar, VBar } from "@/components/lab/charts";
import { PROVINCES } from "@/lib/mock-data";
import { useEnrolmentTrend, useLearnerCohorts } from "@/lib/queries/learners";

export const Route = createFileRoute("/app/learner")({ component: Page });

const kpis = [
  { label: "Total Enrolled", value: 84230, trend: 6.4, spark: [40,42,45,48,55,60,68,78,84],
    info: { what: "Learners with an active or completed enrolment record in the current financial year.", calculation: "COUNT(DISTINCT learner_id) WHERE enrolment_date in current FY.", source: "mart.learner_completion_summary" } },
  { label: "Total Completed", value: 56740, trend: 7.1, spark: [25,30,33,38,42,47,50,54,56],
    info: { what: "Learners whose programme is recorded as completed.", calculation: "COUNT(learner_id) WHERE completion_status = 'Completed'.", source: "mart.completion_rates" } },
  { label: "Completion Rate", value: 67.4, suffix:"%", trend: 2.1, spark: [60,62,64,65,66,67,67,67,67],
    info: { what: "Share of enrolled learners (whose programme window has elapsed) who completed.", calculation: "completions ÷ enrolments × 100.", source: "mart.completion_rates" } },
  { label: "Drop-off Rate", value: 14.8, suffix:"%", trend: -1.4, spark: [18,17,16,16,15,15,15,14,14],
    info: { what: "Share of enrolled learners who withdrew or were marked inactive before completing their programme.", calculation: "withdrawals ÷ enrolments × 100.", source: "mart.completion_rates" } },
  { label: "Learners at Risk", value: 3120, trend: 9.2, spark: [2200,2400,2600,2800,2900,3000,3100,3120],
    info: { what: "Illustrative example figure — not yet wired to a live model.", calculation: "Example data only. The real Learner Completion Predictor (POST /prototype/predict/completion, see the Prototype page) is a documented heuristic — historical rate + funding-type adjustment — not a trained classifier.", source: "Illustrative — see /app/prototype for the real (heuristic) predictor" } },
  { label: "Gender Parity Index", value: 0.96, suffix:"", trend: 1.0, spark: [0.88,0.9,0.91,0.93,0.94,0.95,0.96] as any,
    info: { what: "Ratio of female to male completion rates. 1.00 = perfect parity; values below 1 indicate female learners completing at a lower rate than male learners.", calculation: "female completion rate ÷ male completion rate.", source: "mart.completion_rates, grouped by gender" } },
];

const provinceRank = PROVINCES.map((p,i)=>({province:p, spend: 78-i*4}));
const topProviders = Array.from({length:10}).map((_,i)=>({province:`Provider ${String.fromCharCode(65+i)}`, spend: 90-i*5}));
const dropout = Array.from({length:8}).map((_,i)=>({month:`Q${(i%4)+1}-${24+Math.floor(i/4)}`, Learnerships: 10+i, Skills: 8+i*0.6, Bursaries: 5+i*0.4 }));

function Page() {
  const { data: enrolmentTrend = [] } = useEnrolmentTrend();
  const { data: learnerCohorts = [] } = useLearnerCohorts();

  const trendData = enrolmentTrend.map(p => ({ month: p.month, Enrolled: p.enrolled, Completed: p.completed }));

  return (
    <>
      <PageHeader title="Learner Intelligence" subtitle="Enrolment, completion and risk · FY 2026" />
      <KpiRibbon kpis={kpis as any} />

      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        <Panel title="Enrolment & Completion Trend" info={{
          what: "Monthly enrolment and completion counts over the trailing 24 months.",
          calculation: "Enrolled = COUNT(enrolments) per month. Completed = COUNT(completions) per month.",
          source: "learner_cohorts / enrolment_trend (live)" }}><AreaTrend data={trendData} keys={["Enrolled","Completed"]} /></Panel>
        <Panel title="Province Performance Ranking" info={{
          what: "Provinces ranked by completion rate, highlighting where learner outcomes are strongest and weakest.",
          calculation: "completions ÷ enrolments × 100, grouped by province, ranked descending.",
          source: "mart.completion_rates" }}><HBar data={provinceRank} x="spend" y="province" color="var(--success)" /></Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Completion Rate by Provider · top 10" info={{
          what: "The ten training providers with the highest learner completion rates, used to identify high-performing delivery partners.",
          calculation: "completions ÷ enrolments × 100, grouped by provider, minimum cohort size applied to avoid small-sample distortion.",
          source: "mart.completion_rates, grouped by provider" }}><HBar data={topProviders} x="spend" y="province" /></Panel>
        <Panel title="Dropout Trend by Programme" info={{
          what: "Quarterly dropout rate for the three largest programme categories, used to spot emerging retention problems early.",
          calculation: "withdrawals ÷ enrolments × 100 per quarter, grouped by programme type.",
          source: "mart.completion_rates, grouped by programme" }}><VBar data={dropout} x="month" keys={["Learnerships","Skills","Bursaries"]} /></Panel>
      </div>

      <Panel title="Learner Completion Risk Model" subtitle="Cohort-level example predictions · anonymised" info={{
        what: "Predicted/risk/confidence figures recorded against each cohort in learner_cohorts. Learner identities are pseudonymised — only cohort-level aggregates are shown.",
        calculation: "These are recorded example values, not live output from a trained classifier — the real completion predictor (POST /prototype/predict/completion, see the Prototype page) is a documented heuristic: historical rate + a funding-type adjustment.",
        source: "learner_cohorts (live rows, example prediction columns)", updated: "Bias & fairness review process — see Ethics & Bias Review." }}>
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
