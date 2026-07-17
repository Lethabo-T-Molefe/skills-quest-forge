import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { VBar } from "@/components/lab/charts";
import { Scale, CheckCircle2 } from "lucide-react";
import {
  useBiasModels,
  useFairnessMetrics,
  useDisparateImpact,
  useExplainability,
  useSignOffModel,
} from "@/lib/queries/ethics";

export const Route = createFileRoute("/app/ethics")({ component: Page });

function statusTone(s: string) {
  if (s === "Pass" || s === "Approved" || s === "Reviewed") return "success";
  if (s === "Pending review") return "warn";
  if (s === "Fail") return "danger";
  return "muted";
}

function Page() {
  const { data: biasModels = [] } = useBiasModels();
  const primaryModel = biasModels[0];
  const { data: fairnessMetrics = [] } = useFairnessMetrics(primaryModel?.id);
  const { data: disparateImpact = [] } = useDisparateImpact(primaryModel?.id);
  const { data: explainabilityFactors = [] } = useExplainability(primaryModel?.id);
  const signOff = useSignOffModel();

  return (
    <>
      <PageHeader title="Ethics & Bias Review" subtitle="Mandatory fairness assessment for any model affecting individuals" actions={
        <Badge tone="danger">Non-negotiable requirement</Badge>
      } />

      <Panel title="Models Under Review" action={<Scale className="size-4 text-accent" />}>
        <ul className="flex flex-col divide-y divide-border">
          {biasModels.map(m => (
            <li key={m.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{m.model}</div>
                <div className="text-xs text-muted-foreground">Owner {m.owner} · last reviewed {m.last_reviewed} · {m.reviewer}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={statusTone(m.status)}>{m.status}</Badge>
                {m.status === "Pending review" && (
                  <button
                    className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted"
                    disabled={signOff.isPending}
                    onClick={() => signOff.mutate(m.id)}
                  >
                    Sign off
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title={`Fairness Metrics${primaryModel ? ` — ${primaryModel.model}` : ""}`} subtitle="Demographic parity & equalised odds across protected attributes" info={{
          what: "Tests whether the model's predictions are equally accurate and equally favourable across protected groups, not just accurate on average.",
          calculation: "Demographic Parity gap = |P(positive prediction | group A) − P(positive prediction | group B)|. Equalised Odds gap = the same comparison restricted to true-outcome-matched subgroups. A gap above the 5pp threshold fails.",
          source: "Fairlearn bias assessment, run before every model promotion to production" }}>
          <table className="w-full text-sm">
            <thead className="text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr><th className="text-left py-2">Attribute</th><th className="text-left">Metric</th><th className="text-right">Gap</th><th>Status</th></tr>
            </thead>
            <tbody>
              {fairnessMetrics.map((f) => (
                <tr key={f.id} className="border-t border-border">
                  <td className="py-2 font-medium">{f.attribute}</td>
                  <td className="text-muted-foreground">{f.metric}</td>
                  <td className="text-right">{f.gap}pp <span className="text-muted-foreground">/ {f.threshold}pp</span></td>
                  <td><Badge tone={statusTone(f.status)}>{f.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-muted-foreground mt-3">Threshold breach on <span className="text-danger font-medium">Province · Demographic Parity</span> — remediation plan required before this attribute can be re-approved.</div>
        </Panel>

        <Panel title="Disparate Impact Analysis" subtitle="Predicted vs. actual completion rate by province">
          <VBar data={disparateImpact} x="province" keys={["predicted", "actual"]} colors={["var(--primary)", "var(--accent)"]} />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Explainability Summary" subtitle="Top contributing features · SHAP">
          <div className="space-y-3">
            {explainabilityFactors.map(f => (
              <div key={f.id}>
                <div className="flex justify-between text-xs mb-1"><span className="font-medium">{f.feature}</span><span className="text-muted-foreground">{f.pct}%</span></div>
                <div className="h-2 rounded bg-muted"><div className="h-full bg-accent rounded" style={{ width: `${f.pct * 3}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Sign-off Checklist" subtitle="Required before any production deployment">
          <ul className="flex flex-col gap-2.5 text-sm">
            {[
              "Protected attributes identified in training data",
              "Bias testing run across all protected attribute groups",
              "Disparate impact measured against defined threshold",
              "Explainability summary produced for decision-affecting use",
              "Remediation plan documented for any threshold breach",
              "Reviewed by Data Steward and Information Officer",
            ].map((c, i) => (
              <li key={c} className="flex items-start gap-2">
                <CheckCircle2 className={`size-4 mt-0.5 shrink-0 ${i < 4 ? "text-success" : "text-muted-foreground/40"}`} />
                <span className={i < 4 ? "" : "text-muted-foreground"}>{c}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
