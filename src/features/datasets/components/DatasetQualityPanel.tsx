import { Lock } from "lucide-react";
import { Panel } from "@/components";
import { formatNumber } from "@/lib/format";
import type { Dataset } from "../types";

/** Quality metrics plus the per-column profile table. */
export function DatasetQualityPanel({ dataset }: { dataset: Dataset }) {
  const q = dataset.quality;

  return (
    <Panel>
      <h2 className="heading-2">Quality profile</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Measured on all <span className="num">{formatNumber(dataset.rows)}</span> rows when the data arrived.
      </p>
      <div className="num mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        {[
          ["Completeness", `${q.completeness}%`],
          ["Type conformance", `${q.conformance}%`],
          ["Duplicate rows", formatNumber(q.duplicates)],
          ["Outliers", formatNumber(q.outliers)],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface-raised p-4">
            <p className="font-sans text-xs text-muted-foreground">{k}</p>
            <p className="mt-1 font-display text-2xl font-light">{v}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-8 text-sm font-semibold">Columns</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-strong text-left text-xs text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Column</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 pr-4 font-medium">Missing</th>
              <th className="py-2 pr-4 font-medium">Distinct</th>
              <th className="py-2 font-medium">Sample</th>
            </tr>
          </thead>
          <tbody className="num">
            {dataset.columns.map((c) => (
              <tr key={c.name} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-4 font-sans font-medium">
                  <span className="flex items-center gap-1.5">
                    {c.name}
                    {c.masked ? <Lock className="size-3.5 text-signal-strong" strokeWidth={1.75} /> : null}
                  </span>
                </td>
                <td className="py-2.5 pr-4 font-sans text-muted-foreground">{c.type}</td>
                <td className={`py-2.5 pr-4 ${c.missingPct > 5 ? "text-signal-strong" : "text-muted-foreground"}`}>
                  {c.missingPct}%
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground">{formatNumber(c.distinct)}</td>
                <td className="py-2.5 text-muted-foreground">{c.sample}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Columns marked with a lock were detected as personal information and masked before this data became
        readable.
      </p>
    </Panel>
  );
}
