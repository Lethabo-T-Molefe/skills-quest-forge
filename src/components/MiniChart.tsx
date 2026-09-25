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

export function MiniChart({
  type,
  points,
}: {
  type: "bar" | "line" | "area";
  points: { name: string; value: number }[];
}) {
  const common = (
    <>
      <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
      <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
      <Tooltip
        contentStyle={{
          background: "#FCFCF7",
          border: "1px solid rgba(57,62,65,0.14)",
          borderRadius: 0,
          fontSize: 13,
        }}
      />
    </>
  );

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === "bar" ? (
          <BarChart data={points}>
            {common}
            <Bar dataKey="value" fill="#E94F37" radius={[0, 0, 0, 0]} />
          </BarChart>
        ) : type === "area" ? (
          <AreaChart data={points}>
            {common}
            <Area type="monotone" dataKey="value" stroke="#393E41" fill="#E94F37" fillOpacity={0.18} />
          </AreaChart>
        ) : (
          <LineChart data={points}>
            {common}
            <Line type="monotone" dataKey="value" stroke="#E94F37" strokeWidth={2} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
