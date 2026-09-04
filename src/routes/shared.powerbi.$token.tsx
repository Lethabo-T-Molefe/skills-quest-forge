import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Loader2, LayoutDashboard } from "lucide-react";
import { PbiCard, PbiKpiCard } from "@/components/lab/powerbi-card";
import { AreaTrend, VBar, Donut, ScatterXY, Waterfall, Gauge } from "@/components/lab/charts";
import { PBI_FONT, PBI_TEXT, PBI_SUBTEXT, PBI_BORDER, PBI_CANVAS_BG, PBI_COLORS } from "@/lib/powerbi-theme";
import { useSharedPowerBiReport, useSharedPowerBiDatasetQuery } from "@/lib/queries/powerbi";
import type { PowerBiVisual } from "@/lib/api/powerbi";

// Read-only "publish to web" analog — no login needed, but the token can
// only ever query the dataset(s) its own report references (enforced
// server-side), so it can't become a backdoor into other uploaded data.

export const Route = createFileRoute("/shared/powerbi/$token")({ component: Page });

function fmt(v: unknown): string {
  const n = Number(v);
  if (Number.isNaN(n)) return String(v ?? "—");
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2);
}

function PbiTable({ columns, rows }: { columns: string[]; rows: unknown[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]" style={{ fontFamily: PBI_FONT }}>
        <thead>
          <tr style={{ background: "#FAF9F8" }}>
            {columns.map((c) => (
              <th key={c} className="px-2.5 py-1.5 text-left font-semibold whitespace-nowrap"
                style={{ color: PBI_SUBTEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 100).map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-2.5 py-1.5" style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>
                  {cell === null || cell === undefined ? "—" : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PivotTable({ rows }: { rows: unknown[][] }) {
  const rowKeys = Array.from(new Set(rows.map((r) => String(r[0]))));
  const colKeys = Array.from(new Set(rows.map((r) => String(r[1]))));
  const cell = new Map<string, number>();
  for (const r of rows) cell.set(`${String(r[0])}|${String(r[1])}`, Number(r[2]) || 0);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]" style={{ fontFamily: PBI_FONT }}>
        <thead>
          <tr style={{ background: "#FAF9F8" }}>
            <th className="px-2.5 py-1.5" style={{ borderBottom: `1px solid ${PBI_BORDER}` }} />
            {colKeys.map((c) => <th key={c} className="px-2.5 py-1.5 text-right font-semibold" style={{ color: PBI_SUBTEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rowKeys.map((rk) => (
            <tr key={rk}>
              <td className="px-2.5 py-1.5 font-semibold" style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{rk}</td>
              {colKeys.map((ck) => <td key={ck} className="px-2.5 py-1.5 text-right" style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{fmt(cell.get(`${rk}|${ck}`) ?? 0)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SharedVisual({ token, datasetId, visual, colors }: {
  token: string; datasetId: number; visual: PowerBiVisual; colors: string[];
}) {
  const dateBucketable = visual.type === "bar" || visual.type === "line";
  const opts = useMemo(() => {
    if (visual.type === "scatter") {
      return { xColumn: visual.x_column ?? undefined, yColumn: visual.y_column ?? undefined, limit: 300 };
    }
    const columns = visual.type === "table" ? visual.columns : (visual.value_column ? [visual.value_column] : []);
    return {
      columns,
      groupBy: visual.group_by ?? undefined,
      groupBy2: visual.type === "matrix" ? (visual.group_by_2 ?? undefined) : undefined,
      agg: visual.type === "table" ? undefined : (visual.agg ?? undefined),
      formula: visual.formula ?? undefined,
      dateBucket: dateBucketable ? (visual.date_bucket ?? undefined) : undefined,
      comparePreviousPeriod: dateBucketable ? visual.compare_previous_period : undefined,
      limit: 100,
    };
  }, [visual, dateBucketable]);

  const enabled = visual.type === "scatter" ? !!(visual.x_column && visual.y_column)
    : visual.type === "matrix" ? !!(visual.group_by && visual.group_by_2 && visual.agg)
    : visual.type === "table" ? true
    : !!(visual.group_by || visual.formula || visual.value_column);

  const { data, isLoading, isError } = useSharedPowerBiDatasetQuery(token, datasetId, opts, enabled);

  let body: React.ReactNode = null;
  if (data) {
    if (visual.type === "table") body = <PbiTable columns={data.columns} rows={data.rows} />;
    else if (visual.type === "matrix") body = <PivotTable rows={data.rows} />;
    else if (visual.type === "scatter") {
      body = <ScatterXY data={data.rows.map((r) => ({ x: Number(r[0]) || 0, y: Number(r[1]) || 0 }))} color={colors[0]} />;
    } else if (visual.type === "kpi" || visual.type === "gauge") {
      const value = Number(data.rows[0]?.[0]) || 0;
      body = visual.type === "gauge"
        ? <Gauge value={value} max={Math.max(10, Math.ceil((value * 1.5) / 10) * 10)} />
        : <PbiKpiCard label={visual.title} value={fmt(value)} />;
    } else {
      const chartRows = data.rows.map((r) => ({
        category: dateBucketable && visual.date_bucket ? String(r[0]).slice(0, 10) : String(r[0]),
        [visual.title]: Number(r[1]) || 0,
      }));
      if (visual.type === "waterfall") {
        body = <Waterfall data={chartRows.map((r) => ({ label: r.category, value: Number(r[visual.title]) }))} />;
      } else if (visual.type === "bar") {
        body = <VBar data={chartRows} x="category" keys={[visual.title]} colors={colors} />;
      } else if (visual.type === "line") {
        body = <AreaTrend data={chartRows.map((r) => ({ month: r.category, [visual.title]: r[visual.title] }))} keys={[visual.title]} colors={colors} />;
      } else {
        body = <Donut data={chartRows.map((r) => ({ name: r.category, value: Number(r[visual.title]) }))} colors={colors} />;
      }
    }
  }

  if (visual.type === "kpi" || visual.type === "gauge") {
    return isLoading ? <Loader2 className="size-5 animate-spin" style={{ color: PBI_SUBTEXT }} /> : isError ? <div className="text-xs text-danger">Couldn't load this visual</div> : body;
  }
  return (
    <PbiCard title={visual.title} subtitle={visual.type}>
      {isLoading ? <div className="py-8 flex justify-center"><Loader2 className="size-5 animate-spin" style={{ color: PBI_SUBTEXT }} /></div>
        : isError ? <div className="text-xs text-danger p-2">Couldn't load this visual</div> : body}
    </PbiCard>
  );
}

function Page() {
  const { token } = Route.useParams();
  const { data: report, isLoading, isError } = useSharedPowerBiReport(token);

  return (
    <div className="min-h-screen" style={{ background: PBI_CANVAS_BG, fontFamily: PBI_FONT }}>
      <header className="flex items-center gap-3 px-5 py-3 bg-white" style={{ borderBottom: `1px solid ${PBI_BORDER}` }}>
        <LayoutDashboard className="size-5" style={{ color: PBI_TEXT }} />
        <div className="font-semibold text-sm" style={{ color: PBI_TEXT }}>
          {report?.name ?? "Shared report"}
        </div>
        <span className="text-[11px] ml-2" style={{ color: PBI_SUBTEXT }}>Read-only · shared link</span>
        <Link to="/" className="ml-auto text-[11px] underline" style={{ color: PBI_SUBTEXT }}>chieta data lab</Link>
      </header>

      <main className="p-4 max-w-6xl mx-auto flex flex-col gap-3">
        {isLoading && <div className="py-16 flex justify-center"><Loader2 className="size-6 animate-spin" style={{ color: PBI_SUBTEXT }} /></div>}
        {isError && (
          <div className="text-sm p-6 text-center" style={{ color: PBI_SUBTEXT }}>
            This link is invalid or has been revoked.
          </div>
        )}
        {report && (
          <>
            {(() => {
              const colors = report.theme?.colors ?? PBI_COLORS;
              const kpis = report.visuals.filter((v) => v.type === "kpi" || v.type === "gauge");
              const others = report.visuals.filter((v) => v.type !== "kpi" && v.type !== "gauge");
              return (
                <>
                  {kpis.length > 0 && (
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                      {kpis.map((v, i) => <SharedVisual key={i} token={token} datasetId={report.dataset_id} visual={v} colors={colors} />)}
                    </div>
                  )}
                  {others.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-3">
                      {others.map((v, i) => <SharedVisual key={i} token={token} datasetId={report.dataset_id} visual={v} colors={colors} />)}
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </main>
    </div>
  );
}
