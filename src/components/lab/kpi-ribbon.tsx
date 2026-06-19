import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Sparkline } from "./sparkline";
import { InfoHint, type InfoContent } from "./info-hint";

export type Kpi = { label: string; value: number; suffix?: string; trend: number; spark: number[]; info?: InfoContent };

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function format(n: number, decimals: number) {
  return decimals ? n.toFixed(1) : Math.round(n).toLocaleString();
}

export function KpiCard({ kpi, i }: { kpi: Kpi; i: number }) {
  const isFloat = (kpi.suffix ?? "").includes("%");
  const v = useCountUp(kpi.value);
  const up = kpi.trend >= 0;
  return (
    <div
      className="sw-card bg-card p-4 flex flex-col gap-2 fade-up"
      style={{ animationDelay: `${i * 70}ms` }}
    >
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {kpi.label}
        {kpi.info && <InfoHint title={kpi.label} content={kpi.info} />}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="font-display text-3xl font-extrabold tracking-tight">
          {format(v, isFloat ? 1 : 0)}<span className="text-primary">{kpi.suffix}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${up ? "text-success" : "text-danger"}`}>
          {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {Math.abs(kpi.trend).toFixed(1)}%
        </div>
      </div>
      <Sparkline data={kpi.spark} color={up ? "var(--success)" : "var(--danger)"} />
    </div>
  );
}

export function KpiRibbon({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className={`grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-${kpis.length}`}>
      {kpis.map((k, i) => <KpiCard key={k.label} kpi={k} i={i} />)}
    </div>
  );
}
