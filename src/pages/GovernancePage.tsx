import { Link } from "@tanstack/react-router";
import { Chip, EmptyState, Notice } from "@/components";
import { canApprove, hasPermission, useCurrentUser } from "@/features/auth";
import { DatasetDecision, useDatasets } from "@/features/datasets";
import { RowPolicies } from "@/features/policies";
import { MainLayout } from "@/layouts/MainLayout";
import { formatNumber } from "@/lib/format";

export function GovernancePage() {
  const datasets = useDatasets();
  const user = useCurrentUser();
  const pending = datasets.filter((item) => item.status === "pending");
  // Cleaned datasets can be decided now; raw ones are listed after them so the queue is complete.
  const queue = [...pending].sort(
    (a, b) => Number(a.layer === "bronze") - Number(b.layer === "bronze"),
  );
  const mayDecide = canApprove(user);

  return (
    <MainLayout
      title="Approvals"
      description="Nothing can be analysed until a steward approves it. Review each dataset's quality and classification, then decide. The decision, who made it and why are recorded."
    >
      {!mayDecide ? (
        <Notice className="mb-5" tone="warn" title="You can look, but not decide">
          Only stewards and administrators can approve or reject datasets.
        </Notice>
      ) : null}

      {queue.length === 0 ? (
        <EmptyState
          title="Nothing is waiting for a decision"
          body="New uploads and connected tables will appear here for review."
        />
      ) : (
        <ul className="divide-y divide-border border border-border bg-surface-raised">
          {queue.map((dataset) => (
            <li key={dataset.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
              <div className="min-w-0 flex-1 basis-72">
                <Link
                  to="/datasets/$datasetId"
                  params={{ datasetId: dataset.id }}
                  className="font-display text-lg underline-offset-4 hover:underline"
                >
                  {dataset.name}
                </Link>
                <p className="mt-0.5 text-sm text-muted-foreground">{dataset.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip tone={dataset.layer === "bronze" ? "warn" : "neutral"}>
                    {dataset.layerLabel}
                  </Chip>
                  <Chip
                    tone={dataset.classification === "restricted-personal" ? "signal" : "neutral"}
                  >
                    {dataset.classificationLabel}
                  </Chip>
                  <Chip>Owner · {dataset.owner}</Chip>
                </div>
              </div>
              <dl className="num grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="font-sans text-xs text-muted-foreground">Complete</dt>
                  <dd>{(dataset.quality.afterCleaning ?? dataset.quality).completeness}%</dd>
                </div>
                <div>
                  <dt className="font-sans text-xs text-muted-foreground">Repeats</dt>
                  <dd>
                    {formatNumber((dataset.quality.afterCleaning ?? dataset.quality).duplicates)}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-xs text-muted-foreground">Rows</dt>
                  <dd>{formatNumber(dataset.rows)}</dd>
                </div>
              </dl>
              {mayDecide ? <DatasetDecision dataset={dataset} size="sm" /> : null}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Classification is mandatory and decides how data may be used. Personal columns stay masked
        after approval.
      </p>

      {hasPermission(user, "manage_policies") ? (
        <div className="mt-10 border-t border-border pt-8">
          <RowPolicies />
        </div>
      ) : null}
    </MainLayout>
  );
}
