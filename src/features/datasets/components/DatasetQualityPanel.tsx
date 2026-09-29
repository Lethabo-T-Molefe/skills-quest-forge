import { Lock } from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { Dataset } from "../types";

/** The four headline quality measures, taken when the data arrived. */
export function DatasetQualitySummary({ dataset }: { dataset: Dataset }) {
  const q = dataset.quality;
  return (
    <div>
      <div className="num grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
        {[
          ["Completeness", `${q.completeness}%`, "Cells that are filled in"],
          ["Type conformance", `${q.conformance}%`, "Values that match their column type"],
          ["Duplicate rows", formatNumber(q.duplicates), "Rows that repeat another row"],
          ["Outliers", formatNumber(q.outliers), "Values far from the rest"],
        ].map(([label, value, hint]) => (
          <div key={label} className="bg-surface-raised p-4" title={hint}>
            <p className="font-sans text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-light">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Measured on all <span className="num">{formatNumber(dataset.rows)}</span> rows when the data arrived.
      </p>
    </div>
  );
}

/** Per-column profile: type, emptiness, distinct values and a masked sample. */
export function DatasetColumnsTable({ dataset }: { dataset: Dataset }) {
  return (
    <div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Column</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Missing</th>
              <th className="px-4 py-2.5 font-medium">Distinct</th>
              <th className="px-4 py-2.5 font-medium">Sample</th>
            </tr>
          </thead>
          <tbody className="num bg-surface-raised">
            {dataset.columns.map((c) => (
              <tr key={c.name} className="border-b border-border last:border-0">
                <td className="px-4 py-2 font-sans font-medium">
                  <span className="flex items-center gap-1.5">
                    {c.name}
                    {c.masked ? <Lock className="size-3.5 text-signal-strong" strokeWidth={1.75} aria-label="Masked" /> : null}
                  </span>
                </td>
                <td className="px-4 py-2 font-sans text-muted-foreground">{c.type}</td>
                <td className={`px-4 py-2 ${c.missingPct > 5 ? "text-signal-strong" : "text-muted-foreground"}`}>
                  {c.missingPct}%
                </td>
                <td className="px-4 py-2 text-muted-foreground">{formatNumber(c.distinct)}</td>
                <td className="px-4 py-2 text-muted-foreground">{c.sample}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        A lock means the column was detected as personal information and masked before anyone could read it. Missing
        values above 5% are highlighted.
      </p>
    </div>
  );
}
