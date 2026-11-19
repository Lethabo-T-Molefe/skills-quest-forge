import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Chip, Notice, SelectMenu } from "@/components";
import type { PredictionModel } from "@/features/predictions";
import { errorMessage } from "@/lib/api";
import { scoredQuery } from "../api/models";
import { pct } from "../format";

const bandTone = { High: "signal", Watch: "warn", Low: "neutral" } as const;

/**
 * Who a trained model flags, under the viewer's own row filter: counts by group (groups under five are
 * hidden) and the highest scores with their reasons. Records carry a pseudonym, never a name or ID number.
 */
export function ScoredRecordsPanel({ model }: { model: PredictionModel }) {
  const [by, setBy] = useState<string | undefined>(undefined);
  const view = useQuery(scoredQuery(model.id, by));
  const data = view.data;

  if (view.isLoading) return <p className="text-sm text-muted-foreground">Loading scores…</p>;
  if (view.error)
    return (
      <Notice tone="signal" title="Scores unavailable">
        {errorMessage(view.error)}
      </Notice>
    );
  if (!data || !data.scored) {
    return (
      <Notice tone="info" title="Not scored yet">
        {data?.message ?? "This model has not scored any records yet."} A Model Curator or Data
        Steward runs it from the{" "}
        <Link to="/models/$modelId" params={{ modelId: model.id }} className="underline">
          model's page
        </Link>
        .
      </Notice>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">{data.title}</h2>
          <p className="text-sm text-muted-foreground">
            <span className="num">{String(data.flagged)}</span> of{" "}
            <span className="num">{data.total?.toLocaleString()}</span> {data.entity}s flagged by{" "}
            <Link to="/models/$modelId" params={{ modelId: model.id }} className="underline">
              {model.label}
            </Link>
            {data.scoredAt ? ` · scored ${new Date(data.scoredAt).toLocaleDateString()}` : ""}
            {data.rowPolicy ? " · your role's row filter applies" : ""}
          </p>
        </div>
        {data.dimensions && data.dimensions.length > 0 ? (
          <SelectMenu
            label="Group by"
            size="sm"
            value={data.groupedBy ?? data.dimensions[0] ?? ""}
            onValueChange={setBy}
            options={data.dimensions.map((d) => ({ value: d, label: d.replaceAll("_", " ") }))}
          />
        ) : null}
      </div>

      {data.groups.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
                <th scope="col" className="px-3 py-2 font-medium">
                  {(data.groupedBy ?? "").replaceAll("_", " ")}
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Scored
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Flagged
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Average likelihood
                </th>
              </tr>
            </thead>
            <tbody className="num">
              {data.groups.map((group) => (
                <tr key={group.group} className="border-b border-border">
                  <th scope="row" className="px-3 py-2 text-left font-medium">
                    {group.group}
                  </th>
                  <td className="px-3 py-2">{group.records.toLocaleString()}</td>
                  <td className="px-3 py-2">{String(group.flagged)}</td>
                  <td className="px-3 py-2">{pct(group.averageScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {data.recordsShown && data.records.length > 0 ? (
        <section aria-labelledby="top-records">
          <h3 id="top-records" className="text-sm font-medium">
            Highest likelihood first
          </h3>
          <ul className="mt-2 divide-y divide-border border border-border">
            {data.records.slice(0, 20).map((record) => (
              <li key={record.record} className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="num text-sm font-medium">{record.record}</span>
                  <Chip tone={bandTone[record.band]}>{record.band}</Chip>
                  <span className="num text-xs text-muted-foreground">{pct(record.score)}</span>
                  {Object.entries(record)
                    .filter(([key]) => !["record", "score", "band", "drivers"].includes(key))
                    .map(([key, value]) => (
                      <span key={key} className="text-xs text-muted-foreground">
                        {String(value)}
                      </span>
                    ))}
                </div>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                  {record.drivers.map((driver) => (
                    <li key={driver}>{driver}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {data.note ? <p className="text-xs text-muted-foreground">{data.note}</p> : null}
    </div>
  );
}
