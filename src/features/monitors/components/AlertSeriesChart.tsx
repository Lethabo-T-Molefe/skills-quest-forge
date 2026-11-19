import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { siteConfig } from "@/config/site";
import type { Detector, SeriesPoint } from "../types";

const tick = { fontSize: 12, fill: "#5d6468" };
const tooltipStyle = {
  background: "#FCFCF7",
  border: "1px solid rgba(57,62,65,0.14)",
  borderRadius: 0,
  fontSize: 13,
};

/** Small rates (0.021) keep three significant figures; counts are written whole. */
function formatValue(value: number) {
  const digits = Math.abs(value) < 1 ? 3 : Math.abs(value) < 100 ? 1 : 0;
  return value.toLocaleString(siteConfig.locale, { maximumFractionDigits: digits });
}

function monthLabel(month: string) {
  const [year, mon] = month.split("-");
  const date = new Date(Number(year), Number(mon) - 1, 1);
  return date.toLocaleDateString(siteConfig.locale, { month: "short", year: "2-digit" });
}

/**
 * The months behind an alert: the actual value, the level the detector expected, and the band around it.
 * An unusual month is drawn as a filled dot. The same figures are listed in a table for screen readers.
 */
export function AlertSeriesChart({
  series,
  detector,
  metric,
}: {
  series: SeriesPoint[];
  detector: Detector | null;
  metric: string;
}) {
  if (series.length === 0) return null;
  const data = series.map((point) => ({
    ...point,
    name: monthLabel(point.month),
    band: point.low !== null && point.high !== null ? [point.low, point.high] : null,
  }));
  const banded = data.some((point) => point.band !== null);

  return (
    <figure>
      <div className="h-72 w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={false} minTickGap={16} />
            <YAxis
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={formatValue}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: unknown, name: string) => {
                if (Array.isArray(value)) {
                  return [
                    `${formatValue(value[0] as number)} – ${formatValue(value[1] as number)}`,
                    name,
                  ];
                }
                return [typeof value === "number" ? formatValue(value) : String(value), name];
              }}
            />
            {banded ? (
              <Area
                dataKey="band"
                name="Expected range"
                stroke="none"
                fill="#393E41"
                fillOpacity={0.1}
                connectNulls={false}
                isAnimationActive={false}
              />
            ) : null}
            {banded ? (
              <Line
                dataKey="expected"
                name="Expected"
                stroke="#393E41"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ) : null}
            <Line
              dataKey="value"
              name="Actual"
              stroke="#E94F37"
              strokeWidth={2}
              isAnimationActive={false}
              dot={(props: { cx?: number; cy?: number; index?: number }) => {
                const point = props.index !== undefined ? data[props.index] : undefined;
                const unusual = point?.anomaly ?? false;
                return (
                  <circle
                    key={`dot-${props.index}`}
                    cx={props.cx}
                    cy={props.cy}
                    r={unusual ? 6 : 2.5}
                    fill={unusual ? "#E94F37" : "#FCFCF7"}
                    stroke="#E94F37"
                    strokeWidth={unusual ? 2 : 1.5}
                  />
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        {detector?.methodLabel ?? "The months behind this alert."}
        {detector?.z !== null && detector?.z !== undefined
          ? ` The flagged month sits ${Math.abs(detector.z).toFixed(1)} robust standard deviations ${
              detector.z > 0 ? "above" : "below"
            } its expected level (the alert threshold is ${detector.k}).`
          : ""}
      </figcaption>
      <table className="sr-only">
        <caption>{metric} by month, with the expected level</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Actual</th>
            <th scope="col">Expected</th>
            <th scope="col">Expected range</th>
            <th scope="col">Unusual</th>
          </tr>
        </thead>
        <tbody>
          {series.map((point) => (
            <tr key={point.month}>
              <td>{point.month}</td>
              <td>{formatValue(point.value)}</td>
              <td>{point.expected === null ? "—" : formatValue(point.expected)}</td>
              <td>
                {point.low === null || point.high === null
                  ? "—"
                  : `${formatValue(point.low)} to ${formatValue(point.high)}`}
              </td>
              <td>{point.anomaly ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
