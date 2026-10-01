import { Lock } from "lucide-react";
import { TableFrame } from "@/components";
import { formatNumber } from "@/lib/format";
import type { Dataset, DatasetQuality } from "../types";

type Measure = { key: keyof Omit<DatasetQuality, "afterCleaning">; label: string; hint: string };

const measures: Measure[] = [
  { key: "completeness", label: "Completeness", hint: "Cells that are filled in" },
  { key: "conformance", label: "Type conformance", hint: "Values that match their column type" },
  { key: "duplicates", label: "Duplicate rows", hint: "Rows that repeat another row" },
  { key: "outliers", label: "Outliers", hint: "Values far from the rest" },
];

function show(key: Measure["key"], value: number) {
  return key === "completeness" || key === "conformance" ? `${value}%` : formatNumber(value);
}

/** The four headline quality measures when the data arrived, and after cleaning once a recipe has run. */
export function DatasetQualitySummary({ dataset }: { dataset: Dataset }) {
  const q = dataset.quality;
  const after = q.afterCleaning;
  return (
    <div>
      <dl className="num grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
        {measures.map((measure) => (
          <div key={measure.key} className="bg-surface-raised p-4" title={measure.hint}>
            <dt className="font-sans text-xs text-muted-foreground">{measure.label}</dt>
            <dd className="mt-1 font-display text-2xl font-light">
              {show(measure.key, q[measure.key] ?? 0)}
            </dd>
            {after ? (
              <dd className="mt-1 font-sans text-xs text-muted-foreground">
                After cleaning: {show(measure.key, after[measure.key] ?? 0)}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">
        Measured on all <span className="num">{formatNumber(dataset.rows)}</span> rows when the data
        arrived.
      </p>
    </div>
  );
}

/** Per-column profile: type, emptiness, distinct values and a masked sample. */
export function DatasetColumnsTable({ dataset }: { dataset: Dataset }) {
  return (
    <div>
      <TableFrame label="Columns">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
              <th scope="col" className="px-4 py-2.5 font-medium">
                Column
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Type
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Missing
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Distinct
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Sample
              </th>
            </tr>
          </thead>
          <tbody className="num">
            {dataset.columns.map((c) => (
              <tr key={c.name} className="border-b border-border last:border-0">
                <th scope="row" className="px-4 py-2 text-left font-sans font-medium">
                  <span className="flex items-center gap-1.5">
                    {c.name}
                    {c.masked ? (
                      <Lock
                        className="size-3.5 text-signal-strong"
                        strokeWidth={1.75}
                        aria-label="Masked"
                      />
                    ) : null}
                  </span>
                </th>
                <td className="px-4 py-2 font-sans text-muted-foreground">{c.type}</td>
                <td
                  className={`px-4 py-2 ${c.missingPct > 5 ? "text-signal-strong" : "text-muted-foreground"}`}
                >
                  {c.missingPct}%
                </td>
                <td className="px-4 py-2 text-muted-foreground">{formatNumber(c.distinct)}</td>
                <td className="px-4 py-2 text-muted-foreground">{c.sample ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableFrame>
      <p className="mt-2 text-xs text-muted-foreground">
        A lock means the column was detected as personal information and masked before anyone could
        read it. Missing values above 5% are highlighted.
      </p>
    </div>
  );
}
