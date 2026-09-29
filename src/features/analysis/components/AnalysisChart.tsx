import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalysisResult } from "../types";

const palette = ["#E94F37", "#393E41", "#4E7A5E", "#9A7B2C", "#8A8F93"];
const tick = { fontSize: 11, fill: "#5d6468" };
const tooltipStyle = {
  background: "#FCFCF7",
  border: "1px solid rgba(57,62,65,0.14)",
  borderRadius: 0,
  fontSize: 13,
};
const grid = <CartesianGrid stroke="currentColor" strokeOpacity={0.08} />;

/** One chart per method: histogram, ranked bars, lines, scatter with a fitted line, or signed contributions. */
export function AnalysisChart({ result }: { result: AnalysisResult }) {
  const { visual, format, axisFormat } = result;
  const formatTooltip = (value: unknown) => (typeof value === "number" ? format(value) : String(value ?? "—"));

  if (
    (visual.kind === "bars" || visual.kind === "contribution" || visual.kind === "histogram") &&
    (visual.kind === "histogram" ? visual.bins : visual.points).length === 0
  ) {
    return <p className="p-6 text-sm text-muted-foreground">Nothing to chart with these settings.</p>;
  }

  return (
    <div className="h-full min-h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {visual.kind === "histogram" ? (
          <BarChart data={visual.bins} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            {grid}
            <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={false} interval={0} />
            <YAxis tick={tick} tickLine={false} axisLine={false} width={36} allowDecimals={false} tickFormatter={axisFormat} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatTooltip(value), "Values in range"]} />
            <Bar dataKey="value" fill="#393E41" />
          </BarChart>
        ) : visual.kind === "bars" || visual.kind === "contribution" ? (
          <BarChart
            data={visual.points}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
          >
            {grid}
            <XAxis type="number" tick={tick} tickLine={false} axisLine={false} tickFormatter={axisFormat} />
            <YAxis type="category" dataKey="name" tick={tick} tickLine={false} axisLine={false} width={116} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatTooltip(value), result.title]} cursor={{ fill: "rgba(57,62,65,0.06)" }} />
            {visual.kind === "contribution" ? <ReferenceLine x={0} stroke="#393E41" strokeOpacity={0.5} /> : null}
            {visual.kind === "bars" && visual.reference !== undefined ? (
              <ReferenceLine x={visual.reference} stroke="#393E41" strokeDasharray="4 4" label={{ value: "Average", fontSize: 11, position: "top" }} />
            ) : null}
            <Bar dataKey="value" maxBarSize={28}>
              {visual.points.map((point) => (
                <Cell
                  key={point.name}
                  fill={visual.kind === "contribution" ? ((point.value ?? 0) < 0 ? "#E94F37" : "#393E41") : "#E94F37"}
                />
              ))}
            </Bar>
          </BarChart>
        ) : visual.kind === "lines" ? (
          <LineChart data={visual.points} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            {grid}
            <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={false} />
            <YAxis tick={tick} tickLine={false} axisLine={false} width={52} tickFormatter={axisFormat} domain={["auto", "auto"]} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatTooltip(value), String(name)]} />
            {visual.series.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
            {visual.series.map((series, index) => (
              <Line
                key={series}
                type="monotone"
                dataKey={series}
                stroke={palette[index % palette.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        ) : (
          <ScatterChart margin={{ top: 8, right: 16, bottom: 20, left: 0 }}>
            {grid}
            <XAxis
              type="number"
              dataKey="x"
              name={visual.xLabel}
              tick={tick}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={visual.axisX}
              label={{ value: visual.xLabel, position: "insideBottom", offset: -12, fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={visual.yLabel}
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={52}
              domain={["auto", "auto"]}
              tickFormatter={visual.axisY}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as { name: string; x: number; y: number } | undefined;
                if (!active || !point) return null;
                return (
                  <div style={tooltipStyle} className="px-3 py-2">
                    <p className="font-medium">{point.name}</p>
                    <p>
                      {visual.xLabel}: {visual.formatX(point.x)}
                    </p>
                    <p>
                      {visual.yLabel}: {visual.formatY(point.y)}
                    </p>
                  </div>
                );
              }}
            />
            {visual.fit ? (
              <ReferenceLine
                segment={[
                  { x: visual.fit.x1, y: visual.fit.y1 },
                  { x: visual.fit.x2, y: visual.fit.y2 },
                ]}
                stroke="#393E41"
                strokeDasharray="5 4"
                ifOverflow="extendDomain"
              />
            ) : null}
            <Scatter data={visual.points} fill="#E94F37" fillOpacity={0.75} isAnimationActive={false} />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
