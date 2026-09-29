import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Chip, EmptyState, QuietButton, SignalButton } from "@/components";
import { canApprove, useCurrentUser } from "@/features/auth";
import { classificationLabel, layerLabels, useDatasets } from "@/features/datasets";
import { MainLayout } from "@/layouts/MainLayout";
import { formatNumber } from "@/lib/format";

export function GovernancePage() {
  const datasets = useDatasets();
  const user = useCurrentUser();
  const pending = datasets.filter((item) => item.status === "pending");
  const mayDecide = canApprove(user);

  return (
    <MainLayout
      title="Approvals"
      description="Nothing can be analysed until a steward approves it. Review each dataset's quality and classification, then decide. The decision, who made it and why are recorded."
    >
      {!mayDecide ? (
        <p className="mb-4 text-sm text-warning">Only stewards and administrators can approve or reject datasets.</p>
      ) : null}

      {pending.length === 0 ? (
        <EmptyState title="Nothing is waiting for a decision" body="New uploads and connected tables will appear here for review." />
      ) : (
        <ul className="divide-y divide-border border border-border bg-surface-raised">
          {pending.map((dataset) => (
            <li key={dataset.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
              <div className="min-w-0 flex-1 basis-72">
                <Link
                  to="/datasets/$datasetId"
                  params={{ datasetId: dataset.id }}
                  className="font-display text-lg underline-offset-4 hover:underline"
                >
                  {dataset.name}
                </Link>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{dataset.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip>{layerLabels[dataset.layer]}</Chip>
                  <Chip tone={dataset.classification === "restricted-personal" ? "signal" : "neutral"}>
                    {classificationLabel[dataset.classification]}
                  </Chip>
                  <Chip>Owner · {dataset.owner}</Chip>
                </div>
              </div>
              <dl className="num grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Complete</dt>
                  <dd>{dataset.quality.completeness}%</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Repeats</dt>
                  <dd>{formatNumber(dataset.quality.duplicates)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Rows</dt>
                  <dd>{formatNumber(dataset.rows)}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2">
                <QuietButton
                  disabled={!mayDecide}
                  onClick={() => toast.error(`${dataset.name} rejected`, { description: "The reason is stored with the decision." })}
                >
                  Reject
                </QuietButton>
                <SignalButton
                  disabled={!mayDecide}
                  onClick={() =>
                    toast.success(`${dataset.name} approved`, { description: "The decision was written to the audit trail." })
                  }
                >
                  Approve
                </SignalButton>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Classification is mandatory and decides how data may be used. Personal columns stay masked after approval.
      </p>
    </MainLayout>
  );
}
