import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";

const grid = "color-mix(in oklab, var(--border) 60%, transparent)";
const axis = "color-mix(in oklab, var(--muted-foreground) 80%, transparent)";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
  fontSize: 12,
};

export function AreaTrend({ data, keys, colors }: { data: any[]; keys: string[]; colors?: string[] }) {
  const cs = colors ?? ["var(--primary)", "var(--accent)"];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -10, right: 6, top: 6, bottom: 0 }}>
        <defs>
          {keys.map((k, i) => (
            <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cs[i % cs.length]} stopOpacity={0.55} />
              <stop offset="100%" stopColor={cs[i % cs.length]} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke={axis} fontSize={11} />
        <YAxis stroke={axis} fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        {keys.map((k, i) => (
          <Area key={k} type="monotone" dataKey={k} stroke={cs[i % cs.length]} strokeWidth={2}
            fill={`url(#grad-${k})`} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function HBar({ data, x, y, color = "var(--primary)" }: { data: any[]; x: string; y: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 26)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 16 }}>
        <CartesianGrid stroke={grid} horizontal={false} />
        <XAxis type="number" stroke={axis} fontSize={11} />
        <YAxis type="category" dataKey={y} stroke={axis} fontSize={11} width={110} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={x} fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VBar({ data, x, keys, colors }: { data: any[]; x: string; keys: string[]; colors?: string[] }) {
  const cs = colors ?? ["var(--primary)", "var(--accent)", "var(--success)"];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -10, right: 6 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey={x} stroke={axis} fontSize={11} />
        <YAxis stroke={axis} fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {keys.map((k, i) => <Bar key={k} dataKey={k} fill={cs[i % cs.length]} radius={[4, 4, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({ data, keys, colors, dashedLast }: { data: any[]; keys: string[]; colors?: string[]; dashedLast?: boolean }) {
  const cs = colors ?? ["var(--primary)", "var(--accent)"];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: -10, right: 6 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke={axis} fontSize={11} />
        <YAxis stroke={axis} fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {keys.map((k, i) => (
          <Line key={k} type="monotone" dataKey={k} stroke={cs[i % cs.length]} strokeWidth={2}
            dot={false} strokeDasharray={dashedLast && i === keys.length - 1 ? "4 4" : "0"} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, colors }: { data: { name: string; value: number }[]; colors?: string[] }) {
  const cs = colors ?? ["var(--success)", "var(--accent)", "var(--danger)"];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={cs[i % cs.length]} stroke="var(--card)" strokeWidth={2} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function Gauge({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(1, value / max);
  const angle = pct * 180;
  const radius = 80, cx = 100, cy = 100;
  const rad = (a: number) => (a - 180) * Math.PI / 180;
  const x = cx + radius * Math.cos(rad(angle));
  const y = cy + radius * Math.sin(rad(angle));
  const large = angle > 180 ? 1 : 0;
  const path = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 ${large} 1 ${x} ${y}`;
  const color = pct > 0.75 ? "var(--success)" : pct > 0.4 ? "var(--accent)" : "var(--danger)";
  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
      <path d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy}`} fill="none" stroke="var(--border)" strokeWidth="16" strokeLinecap="round" />
      <path d={path} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" />
      <text x="100" y="92" textAnchor="middle" fontSize="28" fontWeight="800" fill="var(--foreground)">{value.toFixed(0)}</text>
      <text x="100" y="110" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">/ {max}</text>
    </svg>
  );
}
