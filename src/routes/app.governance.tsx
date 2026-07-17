import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { Lock } from "lucide-react";
import {
  usePopiaScorecard,
  usePiiRegister,
  useRetentionPolicies,
  useDatasetApprovals,
  useReviewDatasetApproval,
} from "@/lib/queries/governance";

export const Route = createFileRoute("/app/governance")({ component: Page });

function statusTone(s: string) {
  return s === "Pass" || s === "Approved" || s === "Applied" ? "success"
    : s === "Watch" || s === "Pending" || s === "Review pending" ? "warn"
    : s === "Rejected" ? "danger" : "muted";
}

function Page() {
  const { data: popiaScorecard = [] } = usePopiaScorecard();
  const { data: piiRegister = [] } = usePiiRegister();
  const { data: retentionPolicy = [] } = useRetentionPolicies();
  const { data: datasetApprovals = [] } = useDatasetApprovals();
  const reviewApproval = useReviewDatasetApproval();
  const passCount = popiaScorecard.filter(c => c.status === "Pass").length;
  return (
    <>
      <PageHeader title="Data Governance & POPIA Compliance" subtitle="Data Governance Addendum · D2 compliance artefact" actions={
        <Badge tone="info">Last reviewed 14 Jun 2026</Badge>
      } />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["POPIA controls passing", `${passCount}/${popiaScorecard.length}`],
          ["Datasets classified", "8/8"],
          ["PII fields under control", piiRegister.length.toString()],
          ["Pending dataset approvals", datasetApprovals.filter(d => d.status === "Pending").length.toString()],
        ].map(([l, v]) => (
          <div key={l} className="sw-card bg-card p-4">
            <div className="text-xs text-muted-foreground">{l}</div>
            <div className="font-display text-3xl font-extrabold mt-1">{v}</div>
          </div>
        ))}
      </div>

      <Panel title="POPIA Compliance Scorecard" subtitle="Required controls per Section 3.5 of the Data Governance Addendum" action={<Lock className="size-4 text-accent" />} info={{
        what: "Pass/Watch/Fail status for each control POPIA requires CHIETA to demonstrate before personal data can be processed in the Data Lab.",
        calculation: "Each control is independently verified during the D7 security scan and re-checked on every release; 'Watch' means the control passes but has an open remediation item.",
        source: "D2 Data Governance Addendum · D7 security scan results", updated: "Re-verified on every production release." }}>
        <table className="w-full text-sm">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider">
            <tr><th className="text-left py-2">Control</th><th className="text-left">Note</th><th>Status</th></tr>
          </thead>
          <tbody>
            {popiaScorecard.map(c => (
              <tr key={c.control} className="border-t border-border">
                <td className="py-2 font-medium">{c.control}</td>
                <td className="text-muted-foreground text-xs">{c.note}</td>
                <td><Badge tone={statusTone(c.status)}>{c.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="PII Field Classification Register" subtitle="Sensitive field handling across all datasets" info={{
          what: "Every personal or sensitive field found across CHIETA's datasets, its classification tier, and the protective action applied before it can be used for analysis.",
          calculation: "Classification follows POPIA's definitions: Direct identifier, Quasi-identifier, Sensitive financial, or Special personal information — each tier maps to a mandatory minimum action (mask, hash, pseudonymise, or aggregate-only).",
          source: "Data Sensitivity Register, compiled during dataset profiling" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr><th className="text-left py-2">Field</th><th className="text-left">Dataset</th><th className="text-left">Classification</th><th className="text-left">Action</th><th>Status</th></tr>
              </thead>
              <tbody>
                {piiRegister.map(p => (
                  <tr key={p.field} className="border-t border-border">
                    <td className="py-2 font-medium">{p.field}</td>
                    <td className="text-muted-foreground">{p.dataset}</td>
                    <td className="text-muted-foreground">{p.classification}</td>
                    <td className="text-muted-foreground">{p.action}</td>
                    <td><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Dataset Approval Queue" subtitle="Data Steward sign-off required before use">
          <ul className="flex flex-col divide-y divide-border">
            {datasetApprovals.map(d => (
              <li key={d.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{d.dataset}</div>
                  <div className="text-xs text-muted-foreground">{d.owner} · submitted {d.submitted} · steward {d.steward}</div>
                </div>
                {d.status === "Pending" ? (
                  <div className="flex items-center gap-2">
                    <button
                      className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted"
                      disabled={reviewApproval.isPending}
                      onClick={() => reviewApproval.mutate({ id: d.id, status: "Approved" })}
                    >
                      Approve
                    </button>
                    <button
                      className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted"
                      disabled={reviewApproval.isPending}
                      onClick={() => reviewApproval.mutate({ id: d.id, status: "Rejected" })}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Data Retention Policy">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground uppercase text-[10px] tracking-wider">
            <tr><th className="text-left py-2">Data category</th><th className="text-left">Retention period</th><th className="text-left">Deletion trigger</th></tr>
          </thead>
          <tbody>
            {retentionPolicy.map(r => (
              <tr key={r.category} className="border-t border-border">
                <td className="py-2 font-medium">{r.category}</td>
                <td className="text-muted-foreground">{r.retention}</td>
                <td className="text-muted-foreground">{r.trigger}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
