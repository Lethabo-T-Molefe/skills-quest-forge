import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { KpiRibbon } from "@/components/lab/kpi-ribbon";
import { LineTrend, Donut, Gauge } from "@/components/lab/charts";
import {
  useAppTargets,
  useCertificationTrend,
  useProviderAccreditationSummary,
} from "@/lib/queries/etqa";

export const Route = createFileRoute("/app/etqa")({ component: Page });

const kpis = [
  { label: "APP Target Achievement", value: 89.2, suffix:"%", trend: 3.4, spark: [80,82,84,86,87,89],
    info: { what: "Blended performance against the Annual Performance Plan (APP) targets submitted to DHET, across all tracked APP KPIs.", calculation: "AVG(current ÷ prorated year-to-date target × 100) across enrolment, completion, certification, and bursary APP KPIs.", source: "mart.etqa_app_target_summary", updated: "Alert triggers if any KPI falls below 70% of its YTD target." } },
  { label: "Certifications Issued", value: 12480, trend: 12.5, spark: [9000,9500,10000,11000,11800,12480],
    info: { what: "Total certificates issued to learners who met all qualification requirements, current financial year.", calculation: "COUNT(certificate_id) WHERE issue_date in current FY.", source: "mart.etqa_app_target_summary ← ETQA system" } },
  { label: "Providers Accredited", value: 318, trend: 2.6, spark: [300,305,310,313,316,318],
    info: { what: "Training providers currently holding valid (non-suspended) accreditation status.", calculation: "COUNT(provider_id) WHERE accreditation_status = 'Accredited'.", source: "clean.provider_accreditation" } },
  { label: "Assessments Completed", value: 22115, trend: 6.1, spark: [18000,19000,20000,21000,21500,22115],
    info: { what: "Learner assessments marked and finalised this financial year, across all qualifications.", calculation: "COUNT(assessment_id) WHERE status = 'Completed'.", source: "clean.etqa_assessments" } },
  { label: "Outstanding Assessments", value: 1240, trend: -8.2, spark: [1800,1700,1500,1400,1300,1240],
    info: { what: "Submitted assessments still awaiting moderation or final sign-off — a backlog indicator for ETQA capacity planning.", calculation: "COUNT(assessment_id) WHERE status = 'Submitted' AND moderation_date IS NULL.", source: "clean.etqa_assessments" } },
  { label: "Compliance Rate", value: 96.4, suffix:"%", trend: 1.1, spark: [93,94,94,95,96,96],
    info: { what: "Share of providers and assessments meeting all ETQA quality and accreditation requirements.", calculation: "compliant_records ÷ total_records × 100 across provider audits and assessment moderation checks.", source: "mart.etqa_app_target_summary" } },
];

function Page() {
  const { data: appTargets = [] } = useAppTargets();
  const { data: certificationTrend = [] } = useCertificationTrend();
  const { data: providerAccreditation = [] } = useProviderAccreditationSummary();

  const certTrend = certificationTrend.map(p => ({ month: p.month, Certifications: p.certifications }));
  const accreditationDonut = providerAccreditation.map(p => ({ name: p.status, value: p.count }));

  return (
    <>
      <PageHeader title="ETQA Performance" subtitle="Education, training & quality assurance · FY 2026" />
      <KpiRibbon kpis={kpis as any} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="APP Target Achievement" subtitle="Annual Performance Plan targets" info={{
          what: "Progress against four key APP targets submitted to DHET, each shown as % achieved against its year-to-date prorated target.",
          calculation: "current_value ÷ prorated_ytd_target × 100, recalculated daily as new data lands.",
          source: "app_targets (live)" }}>
          <div className="grid grid-cols-2 gap-4">
            {appTargets.map(t=>(
              <div key={t.id} className="rounded-lg border border-border p-4 text-center">
                <div className="text-xs text-muted-foreground mb-2">{t.name}</div>
                <Gauge value={t.achievement_pct} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Certification Trend" info={{
          what: "Monthly count of certificates issued, used to track momentum toward the annual certification target.",
          calculation: "COUNT(certificate_id) per month, current financial year.",
          source: "certification_trend (live)" }}><LineTrend data={certTrend} keys={["Certifications"]} /></Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Provider Accreditation Status" info={{
          what: "Breakdown of all registered providers by current accreditation standing.",
          calculation: "COUNT(provider_id), grouped by accreditation_status.",
          source: "bronze.providers (warehouse, live)" }}>
          <Donut data={accreditationDonut} />
        </Panel>
        <Panel title="ETQA Scorecard" info={{
          what: "Baseline vs. current performance for the five core ETQA targets, with status derived from % achieved.",
          calculation: "% Ach. = current ÷ baseline × 100. Status: On track ≥100%, Watch 90–99%, Off track <90%.",
          source: "mart.etqa_app_target_summary" }}>
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
