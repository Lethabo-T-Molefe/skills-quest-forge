import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/app/lineage")({ component: Page });

function Stage({ tone, title, items }: { tone: "info"|"warn"|"success"; title: string; items: string[] }) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-muted/30 p-4">
      <Badge tone={tone}>{title}</Badge>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map(i => <li key={i} className="font-mono text-xs px-2 py-1.5 rounded bg-background border border-border">{i}</li>)}
      </ul>
    </div>
  );
}

function Page() {
  return (
    <>
      <PageHeader title="Data Lineage" subtitle="Raw → Cleaned → Analytics flow across CHIETA pipelines" />
      <Panel title="Grants pipeline">
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <Stage tone="info" title="Raw" items={["raw.grants_q3.csv", "raw.providers.csv"]} />
          <div className="grid place-items-center"><ArrowRight className="size-6 text-muted-foreground" /></div>
          <Stage tone="warn" title="Cleaned" items={["clean.grants", "clean.providers", "clean.allocations"]} />
          <div className="grid place-items-center"><ArrowRight className="size-6 text-muted-foreground" /></div>
          <Stage tone="success" title="Analytics Mart" items={["mart.grant_utilisation", "mart.risk_scores", "mart.province_summary"]} />
        </div>
      </Panel>
      <Panel title="Learner pipeline">
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <Stage tone="info" title="Raw" items={["raw.learner_records_2026.csv"]} />
          <div className="grid place-items-center"><ArrowRight className="size-6 text-muted-foreground" /></div>
          <Stage tone="warn" title="Cleaned" items={["clean.learners", "clean.enrolments", "clean.completions"]} />
          <div className="grid place-items-center"><ArrowRight className="size-6 text-muted-foreground" /></div>
          <Stage tone="success" title="Analytics Mart" items={["mart.completion_rates", "mart.cohort_risk", "mart.gender_parity"]} />
        </div>
      </Panel>
    </>
  );
}
