import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/format";

const tick = { fontSize: 12, fill: "#5d6468" };
const tooltipStyle = {
  background: "#FCFCF7",
  border: "1px solid rgba(57,62,65,0.14)",
  borderRadius: 0,
  fontSize: 13,
};

/**
 * A small chart for dashboards. Axes, grid and tooltip are written out in each chart rather than
 * shared through a fragment, because Recharts ignores children wrapped in a fragment.
 */
export function MiniChart({
  type,
  points,
  className = "h-64",
  format = formatNumber,
  axisFormat = format,
  seriesName = "Value",
}: {
  type: "bar" | "line" | "area";
  /** A null value is a gap: the period exists but has no figure. */
  points: { name: string; value: number | null }[];
  /** Height of the chart area. */
  className?: string;
  /** How a value is written in the tooltip. */
  format?: (value: number) => string;
  /** How a value is written on the axis, where space is tight. */
  axisFormat?: (value: number) => string;
  seriesName?: string;
}) {
  const formatTick = (value: number) => axisFormat(value);
  const formatTooltip = (value: unknown): [string, string] => [
    typeof value === "number" ? format(value) : String(value),
    seriesName,
  ];

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "bar" ? (
          <BarChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={false} />
            <YAxis
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={formatTick}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={formatTooltip}
              cursor={{ fill: "rgba(57,62,65,0.06)" }}
            />
            <Bar dataKey="value" fill="#E94F37" />
          </BarChart>
        ) : type === "area" ? (
          <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={false} />
            <YAxis
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={formatTick}
              domain={["auto", "auto"]}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#393E41"
              fill="#E94F37"
              fillOpacity={0.18}
            />
          </AreaChart>
        ) : (
          <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={false} />
            <YAxis
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={formatTick}
              domain={["auto", "auto"]}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
            <Line type="monotone" dataKey="value" stroke="#E94F37" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
