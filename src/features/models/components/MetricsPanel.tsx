import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { pct } from "../format";
import type { Baseline, ModelMetrics } from "../types";

const tick = { fontSize: 11, fill: "#5d6468" };
const tooltipStyle = {
  background: "#FCFCF7",
  border: "1px solid rgba(57,62,65,0.14)",
  borderRadius: 0,
  fontSize: 12,
};

const fixed = (value: number | null | undefined, digits = 3) =>
  value === null || value === undefined ? "—" : value.toFixed(digits);

function Curve({
  title,
  points,
  x,
  y,
  diagonal,
}: {
  title: string;
  points: [number, number][];
  x: string;
  y: string;
  diagonal?: boolean;
}) {
  const data = points.map(([a, b]) => ({ x: a, y: b }));
  return (
    <figure className="border border-border p-3">
      <figcaption className="mb-2 text-xs font-medium">{title}</figcaption>
      <div className="h-52" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 12, left: 0 }}>
            <CartesianGrid stroke="currentColor" strokeOpacity={0.08} />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 1]}
              tick={tick}
              tickLine={false}
              label={{ value: x, position: "insideBottom", offset: -6, fontSize: 11 }}
            />
            <YAxis type="number" domain={[0, 1]} tick={tick} tickLine={false} width={36} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: unknown) => (typeof value === "number" ? value.toFixed(3) : "")}
              labelFormatter={(value: unknown) =>
                `${x} ${typeof value === "number" ? value.toFixed(3) : ""}`
              }
            />
            {diagonal ? (
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: 1, y: 1 },
                ]}
                stroke="#8A8F93"
                strokeDasharray="4 4"
              />
            ) : null}
            <Line
              dataKey="y"
              name={y}
              stroke="#E94F37"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/** Performance on records the model never saw, beside baselines that need no learning. */
export function MetricsPanel({
  metrics,
  baselines,
  threshold,
}: {
  metrics: ModelMetrics;
  baselines: Record<string, Baseline>;
  threshold: number | null;
}) {
  const at = metrics.atThreshold;
  const rows: { label: string; roc: number; pr?: number | undefined; model?: boolean }[] = [
    { label: "This model", roc: metrics.rocAuc, pr: metrics.prAuc, model: true },
    ...Object.values(baselines).map((b) => ({ label: b.label, roc: b.rocAuc, pr: b.prAuc })),
  ];
  return (
    <div className="space-y-5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="mb-2 text-left text-xs text-muted-foreground">
            Measured on a held-out fifth of the labelled records. ROC-AUC: how well it ranks those
            with the outcome above those without (0.5 is chance). PR-AUC: precision across recall,
            which matters when the outcome is the minority.
          </caption>
          <thead>
            <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
              <th scope="col" className="px-3 py-2 font-medium">
                Compared with
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                ROC-AUC
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                PR-AUC
              </th>
            </tr>
          </thead>
          <tbody className="num">
            {rows.map((row) => (
              <tr
                key={row.label}
                className={`border-b border-border ${row.model ? "font-medium" : ""}`}
              >
                <th scope="row" className="px-3 py-2 text-left font-[inherit]">
                  {row.label}
                </th>
                <td className="px-3 py-2">{fixed(row.roc)}</td>
                <td className="px-3 py-2">{fixed(row.pr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-border p-3">
          <dt className="text-xs text-muted-foreground">Cross-validated ROC-AUC</dt>
          <dd className="num mt-1 font-display text-2xl font-light">
            {fixed(metrics.crossValidation.rocAuc.mean)}
            <span className="ml-1 text-sm text-muted-foreground">
              ± {fixed(metrics.crossValidation.rocAuc.sd)}
            </span>
          </dd>
        </div>
        <div className="border border-border p-3">
          <dt className="text-xs text-muted-foreground">Recall at the threshold</dt>
          <dd className="num mt-1 font-display text-2xl font-light">{pct(at.recall)}</dd>
          <p className="text-xs text-muted-foreground">of records with the outcome are flagged</p>
        </div>
        <div className="border border-border p-3">
          <dt className="text-xs text-muted-foreground">Precision at the threshold</dt>
          <dd className="num mt-1 font-display text-2xl font-light">{pct(at.precision)}</dd>
          <p className="text-xs text-muted-foreground">of flagged records have the outcome</p>
        </div>
        <div className="border border-border p-3">
          <dt className="text-xs text-muted-foreground">Flagged · Brier score</dt>
          <dd className="num mt-1 font-display text-2xl font-light">{pct(at.flaggedShare)}</dd>
          <p className="text-xs text-muted-foreground">
            threshold {fixed(threshold)} · Brier {fixed(metrics.brier)}
          </p>
        </div>
      </dl>

      <div className="grid gap-4 md:grid-cols-2">
        <Curve
          title="ROC curve: true positive rate against false positive rate"
          points={metrics.roc}
          x="False positive rate"
          y="True positive rate"
          diagonal
        />
        <Curve
          title="Calibration: observed share against predicted likelihood"
          points={metrics.calibration}
          x="Predicted"
          y="Observed"
          diagonal
        />
      </div>
      <p className="text-xs text-muted-foreground">
        On the test records: {at.tp} correctly flagged, {at.fn} missed, {at.fp} flagged without the
        outcome, {at.tn} correctly not flagged.
      </p>
    </div>
  );
}
