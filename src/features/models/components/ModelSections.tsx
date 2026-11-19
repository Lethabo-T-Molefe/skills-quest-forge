import { Chip, Notice } from "@/components";
import type { ColumnPlan, Drift, Fairness, ModelCard } from "../types";
import { pct } from "../format";

const roleLabels: Record<ColumnPlan["role"], string> = {
  feature: "Used",
  target: "Outcome",
  protected: "Audited only",
  key: "Record key",
  time: "Time",
  excluded: "Left out",
};

/** Each column's role in the model and the reason, and which columns the model relies on most. */
export function FeaturePlanTable({
  plan,
  importance,
}: {
  plan: ColumnPlan[];
  importance?: ModelCard["importance"];
}) {
  const top = (importance ?? []).filter((item) => item.aucDrop > 0).slice(0, 8);
  const widest = Math.max(...top.map((item) => item.aucDrop), 0.0001);
  return (
    <div className="space-y-6">
      {top.length > 0 ? (
        <section aria-labelledby="importance-heading">
          <h3 id="importance-heading" className="text-sm font-medium">
            What the model relies on
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            How much the test ROC-AUC drops when a column's values are shuffled.
          </p>
          <ul className="mt-3 space-y-2">
            {top.map((item) => (
              <li
                key={item.column}
                className="grid grid-cols-[10rem_minmax(0,1fr)_3.5rem] items-center gap-2 text-sm"
              >
                <span className="truncate">{item.label}</span>
                <span className="h-2 bg-surface-alt">
                  <span
                    className="block h-2 bg-signal"
                    style={{ width: `${(item.aucDrop / widest) * 100}%` }}
                  />
                </span>
                <span className="num text-right text-xs">{item.aucDrop.toFixed(3)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="mb-2 text-left text-xs text-muted-foreground">
            Personal information and protected attributes are never used to score anyone.
          </caption>
          <thead>
            <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
              <th scope="col" className="px-3 py-2 font-medium">
                Column
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Role
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Why
              </th>
            </tr>
          </thead>
          <tbody>
            {plan.map((column) => (
              <tr key={column.name} className="border-b border-border align-top">
                <th scope="row" className="px-3 py-2 text-left font-medium">
                  {column.label}
                </th>
                <td className="px-3 py-2">
                  <Chip
                    tone={
                      column.role === "feature"
                        ? "ok"
                        : column.role === "excluded"
                          ? "neutral"
                          : "warn"
                    }
                  >
                    {roleLabels[column.role]}
                  </Chip>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {column.reason}
                  {column.warning ? (
                    <span className="mt-1 block text-warning">{column.warning}</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Who gets flagged, and whose outcomes the model misses, per protected group. */
export function FairnessTable({ fairness }: { fairness: Fairness }) {
  if (!fairness.audited) {
    return (
      <Notice tone="warn" title="No protected attributes were audited">
        This model was trained without naming protected attributes, so nobody has checked whether it
        treats groups differently. Ask the curator to retrain it with them before approving.
      </Notice>
    );
  }
  return (
    <div className="space-y-6">
      {fairness.criterion ? (
        <p className="text-sm text-muted-foreground">{fairness.criterion}</p>
      ) : null}
      {fairness.flags.length > 0 ? (
        <Notice tone="signal" title="Flags raised">
          <ul className="list-disc space-y-1 pl-4">
            {fairness.flags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </Notice>
      ) : (
        <Notice tone="info" title="No flags raised">
          Selection rates and missed outcomes were within the guides for every group large enough to
          judge.
        </Notice>
      )}
      {(fairness.attributes ?? []).map((attribute) => (
        <section key={attribute.attribute} aria-label={attribute.label}>
          <h3 className="text-sm font-medium">{attribute.label}</h3>
          <p className="text-xs text-muted-foreground">
            Lowest selection rate is {pct(attribute.selectionRateRatio, 0)} of the highest · recall
            gap{" "}
            {attribute.recallGap === null
              ? "—"
              : `${(attribute.recallGap * 100).toFixed(0)} points`}
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-3 py-2 font-medium">
                    Group
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Records
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Outcome rate
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Flagged
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Recall
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Missed
                  </th>
                </tr>
              </thead>
              <tbody className="num">
                {attribute.groups.map((group) => (
                  <tr key={group.group} className="border-b border-border">
                    <th scope="row" className="px-3 py-2 text-left font-medium">
                      {group.group}
                      {group.tooSmall ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          too small to judge
                        </span>
                      ) : null}
                    </th>
                    <td className="px-3 py-2">{group.n}</td>
                    <td className="px-3 py-2">{pct(group.prevalence)}</td>
                    <td className="px-3 py-2">{pct(group.selectionRate)}</td>
                    <td className="px-3 py-2">{pct(group.recall)}</td>
                    <td className="px-3 py-2">{pct(group.falseNegativeRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

const driftTone = { stable: "ok", watch: "warn", drift: "signal" } as const;

/** How far today's records have moved from the ones the model learned from. */
export function DriftPanel({
  drift,
  checkedAt,
}: {
  drift: Drift | null;
  checkedAt?: string | undefined;
}) {
  if (!drift) {
    return (
      <p className="text-sm text-muted-foreground">
        Drift is measured each time the model scores records. It has not scored any yet.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={driftTone[drift.status]}>
          {drift.status === "drift"
            ? "Drifted"
            : drift.status === "watch"
              ? "Worth watching"
              : "Stable"}
        </Chip>
        <span className="text-xs text-muted-foreground">
          {drift.guide}
          {checkedAt ? ` Checked ${new Date(checkedAt).toLocaleString()}.` : ""}
        </span>
      </div>
      <ul className="divide-y divide-border border border-border">
        {drift.columns.map((column) => (
          <li
            key={column.column}
            className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
          >
            <span>{column.label}</span>
            <span className="flex items-center gap-2">
              <span className="num text-xs">PSI {column.psi.toFixed(3)}</span>
              <Chip tone={driftTone[column.status]}>{column.status}</Chip>
            </span>
          </li>
        ))}
      </ul>
      {drift.status === "drift" ? (
        <p className="text-sm text-muted-foreground">
          The records being scored now differ from the training records. Scores may be less
          reliable; retrain the model on recent data and review it again.
        </p>
      ) : null}
    </div>
  );
}
