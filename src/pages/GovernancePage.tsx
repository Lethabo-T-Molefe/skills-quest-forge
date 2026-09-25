import { toast } from "sonner";
import { Chip, HelpTip, Notice, Panel, QuietButton, SignalButton } from "@/components";
import { canApprove, useCurrentUser } from "@/features/auth";
import { classificationLabel, useDatasets } from "@/features/datasets";
import { MainLayout } from "@/layouts/MainLayout";

export function GovernancePage() {
  const datasets = useDatasets();
  const user = useCurrentUser();
  const pending = datasets.filter((item) => item.status === "pending");

  return (
    <MainLayout
      label="steward queue"
      title="Approvals and classification"
      intro="A dataset moves through pending, approved or rejected. Until a Steward approves it, it is not queryable in the cleaned or analytics layers. The decision, the deciding member and the reason are recorded."
    >
      {pending.length > 0 ? (
        <Notice tone="warn" title={`${pending.length} dataset${pending.length === 1 ? "" : "s"} waiting`}>
          Until a Steward approves a file, it stays out of explorer, the assistant and gold dashboards.
        </Notice>
      ) : null}
      <div className={pending.length > 0 ? "mt-6" : ""}>
      {pending.length === 0 ? (
        <Panel>
          <p className="text-sm">Nothing is waiting for a decision.</p>
        </Panel>
      ) : (
        <div className="space-y-3">
          {pending.map((dataset) => (
            <Panel key={dataset.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="label-paren">({dataset.layer})</p>
                  <h2 className="heading-2 mt-1">{dataset.name}</h2>
                  <p className="mt-2 max-w-[68ch] text-sm text-muted-foreground">{dataset.description}</p>
                </div>
                <Chip tone="warn">{dataset.status}</Chip>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip>{classificationLabel[dataset.classification]}</Chip>
                <Chip>Owner · {dataset.owner}</Chip>
                <Chip>{dataset.sourceName}</Chip>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <SignalButton
                  disabled={!canApprove(user)}
                  onClick={() => toast.success(`${dataset.name} approved. The decision was written to the audit log.`)}
                >
                  Approve
                </SignalButton>
                <QuietButton
                  disabled={!canApprove(user)}
                  onClick={() => toast.error(`${dataset.name} rejected. The reason will be stored with the decision.`)}
                >
                  Reject
                </QuietButton>
              </div>
            </Panel>
          ))}
        </div>
      )}
      </div>
      <div className="mt-6">
        <HelpTip>
          Classification is mandatory and drives how the data may be used. Restricted-personal columns stay masked
          before promotion.
        </HelpTip>
      </div>
    </MainLayout>
  );
}
