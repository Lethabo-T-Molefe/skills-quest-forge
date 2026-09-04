import { useMemo, useState } from "react";
import { AreaTrend, VBar, Donut } from "./charts";
import { PbiCard, PbiKpiCard } from "./powerbi-card";
import { PBI_COLORS, PBI_FONT, PBI_TEXT, PBI_SUBTEXT, PBI_BORDER, PBI_CANVAS_BG } from "@/lib/powerbi-theme";
import type { PowerBiDemoData } from "@/lib/api/powerbi";

// A small interactive mock "report" — slicers, KPI cards, charts and a
// table — all styled after Power BI's actual visual chrome (Fluent card
// shadow, Segoe UI, the default categorical palette), not the CHIETA brand
// theme used everywhere else in the app. It slices/aggregates the flat demo
// dataset client-side, the way a real embedded report queries its dataset.

function SlicerPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 text-[11px] rounded-sm border transition-colors"
      style={{
        fontFamily: PBI_FONT,
        borderColor: active ? PBI_COLORS[0] : PBI_BORDER,
        background: active ? PBI_COLORS[0] : "#fff",
        color: active ? "#fff" : PBI_TEXT,
      }}
    >
      {label}
    </button>
  );
}

function ProvinceSlicer({ provinces, selected, onToggle, onReset }: {
  provinces: string[]; selected: Set<string>; onToggle: (p: string) => void; onReset: () => void;
}) {
  return (
    <PbiCard title="Province" subtitle="Slicer — click to filter, click again to clear">
      <div className="flex flex-wrap gap-1.5 pb-1">
        <SlicerPill label="All" active={selected.size === 0} onClick={onReset} />
        {provinces.map((p) => (
          <SlicerPill key={p} label={p} active={selected.has(p)} onClick={() => onToggle(p)} />
        ))}
      </div>
    </PbiCard>
  );
}

function ProgrammeSlicer({ programmes, value, onChange }: {
  programmes: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <PbiCard title="Programme" subtitle="Slicer">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[12px] px-2 py-1.5 rounded-sm border bg-white"
        style={{ fontFamily: PBI_FONT, borderColor: PBI_BORDER, color: PBI_TEXT }}
      >
        <option value="All">All programmes</option>
        {programmes.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
    </PbiCard>
  );
}

type ReportPage = "overview" | "grants";

function PageTabs({ page, onChange }: { page: ReportPage; onChange: (p: ReportPage) => void }) {
  const tabs: { id: ReportPage; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "grants", label: "Grants & Centres" },
  ];
  return (
    <div className="flex gap-1 px-1">
      {tabs.map((t) => {
        const active = page === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="px-3.5 py-1.5 text-[12px] rounded-t-[3px] border border-b-0"
            style={{
              fontFamily: PBI_FONT,
              borderColor: PBI_BORDER,
              background: active ? "#fff" : "#EDEBE9",
              color: active ? PBI_COLORS[0] : PBI_SUBTEXT,
              fontWeight: active ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

type CentreRow = {
  centre: string; province: string; programme: string;
  learners: number; completions: number; completionRate: number; certRate: number;
};

function CentreTable({ rows }: { rows: CentreRow[] }) {
  const headers = ["Centre", "Province", "Programme", "Learners", "Completions", "Completion %", "Certification %"];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]" style={{ fontFamily: PBI_FONT }}>
        <thead>
          <tr style={{ background: "#FAF9F8" }}>
            {headers.map((h, i) => (
              <th
                key={h}
                className={`px-2.5 py-1.5 font-semibold whitespace-nowrap ${i >= 3 ? "text-right" : "text-left"}`}
                style={{ color: PBI_SUBTEXT, borderBottom: `1px solid ${PBI_BORDER}` }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.centre}>
              <td className="px-2.5 py-1.5" style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{r.centre}</td>
              <td className="px-2.5 py-1.5" style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{r.province}</td>
              <td className="px-2.5 py-1.5" style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{r.programme}</td>
              <td className="px-2.5 py-1.5 text-right" style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{r.learners.toLocaleString()}</td>
              <td className="px-2.5 py-1.5 text-right" style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{r.completions.toLocaleString()}</td>
              <td className="px-2.5 py-1.5 text-right" style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{(r.completionRate * 100).toFixed(0)}%</td>
              <td className="px-2.5 py-1.5 text-right" style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{(r.certRate * 100).toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PowerBiReport({ demo }: { demo: PowerBiDemoData }) {
  const [selectedProvinces, setSelectedProvinces] = useState<Set<string>>(new Set());
  const [programme, setProgramme] = useState("All");
  const [page, setPage] = useState<ReportPage>("overview");

  function toggleProvince(p: string) {
    setSelectedProvinces((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  }

  const filteredRows = useMemo(
    () => demo.rows.filter((r) =>
      (selectedProvinces.size === 0 || selectedProvinces.has(r.province)) &&
      (programme === "All" || r.programme === programme)
    ),
    [demo.rows, selectedProvinces, programme],
  );

  const kpis = useMemo(() => {
    const learners = filteredRows.reduce((a, r) => a + r.learners, 0);
    const completions = filteredRows.reduce((a, r) => a + r.completions, 0);
    const certified = filteredRows.reduce((a, r) => a + r.certified, 0);
    const allocated = filteredRows.reduce((a, r) => a + r.grant_allocated, 0);
    const spent = filteredRows.reduce((a, r) => a + r.grant_spent, 0);
    const centresInView = new Set(filteredRows.map((r) => r.centre)).size;
    return {
      learners, completions, centresInView,
      completionRate: learners ? completions / learners : 0,
      certRate: completions ? certified / completions : 0,
      utilisation: allocated ? spent / allocated : 0,
    };
  }, [filteredRows]);

  const trendData = useMemo(() => {
    const byMonth = new Map<number, { month: string; Completions: number }>();
    for (const r of filteredRows) {
      const entry = byMonth.get(r.month_index) ?? { month: r.month, Completions: 0 };
      entry.Completions += r.completions;
      byMonth.set(r.month_index, entry);
    }
    return [...byMonth.entries()].sort(([a], [b]) => a - b).map(([, v]) => v);
  }, [filteredRows]);

  const provinceData = useMemo(() => {
    const byProvince = new Map<string, number>();
    for (const r of filteredRows) byProvince.set(r.province, (byProvince.get(r.province) ?? 0) + r.learners);
    return demo.provinces.filter((p) => byProvince.has(p)).map((p) => ({ province: p, Learners: byProvince.get(p)! }));
  }, [filteredRows, demo.provinces]);

  const programmeData = useMemo(() => {
    const byProgramme = new Map<string, number>();
    for (const r of filteredRows) byProgramme.set(r.programme, (byProgramme.get(r.programme) ?? 0) + r.learners);
    return [...byProgramme.entries()].map(([name, value]) => ({ name, value }));
  }, [filteredRows]);

  const grantsData = useMemo(() => {
    const byProgramme = new Map<string, { programme: string; Allocated: number; Spent: number }>();
    for (const r of filteredRows) {
      const entry = byProgramme.get(r.programme) ?? { programme: r.programme, Allocated: 0, Spent: 0 };
      entry.Allocated += r.grant_allocated;
      entry.Spent += r.grant_spent;
      byProgramme.set(r.programme, entry);
    }
    return [...byProgramme.values()];
  }, [filteredRows]);

  const centreRows = useMemo((): CentreRow[] => {
    const byCentre = new Map<string, { centre: string; province: string; programme: string; learners: number; completions: number; certified: number }>();
    for (const r of filteredRows) {
      const entry = byCentre.get(r.centre) ?? { centre: r.centre, province: r.province, programme: r.programme, learners: 0, completions: 0, certified: 0 };
      entry.learners += r.learners;
      entry.completions += r.completions;
      entry.certified += r.certified;
      byCentre.set(r.centre, entry);
    }
    return [...byCentre.values()]
      .map((c) => ({
        ...c,
        completionRate: c.learners ? c.completions / c.learners : 0,
        certRate: c.completions ? c.certified / c.completions : 0,
      }))
      .sort((a, b) => b.completionRate - a.completionRate);
  }, [filteredRows]);

  return (
    <div className="rounded-[2px] p-3 flex flex-col gap-3" style={{ background: PBI_CANVAS_BG, fontFamily: PBI_FONT }}>
      <div className="grid md:grid-cols-[2fr_1fr] gap-3">
        <ProvinceSlicer
          provinces={demo.provinces}
          selected={selectedProvinces}
          onToggle={toggleProvince}
          onReset={() => setSelectedProvinces(new Set())}
        />
        <ProgrammeSlicer programmes={demo.programmes} value={programme} onChange={setProgramme} />
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <PbiKpiCard label="Learners" value={kpis.learners.toLocaleString()} />
        <PbiKpiCard label="Completions" value={kpis.completions.toLocaleString()} />
        <PbiKpiCard label="Completion Rate" value={`${(kpis.completionRate * 100).toFixed(0)}%`} />
        <PbiKpiCard label="Certification Rate" value={`${(kpis.certRate * 100).toFixed(0)}%`} />
        <PbiKpiCard label="Centres in View" value={String(kpis.centresInView)} />
      </div>

      {page === "overview" ? (
        <div className="grid md:grid-cols-2 gap-3">
          <PbiCard title="Completions Trend" subtitle="By month">
            <AreaTrend data={trendData} keys={["Completions"]} colors={[PBI_COLORS[0]]} />
          </PbiCard>
          <PbiCard title="Learners by Province" subtitle="Reflects current slicers">
            <VBar data={provinceData} x="province" keys={["Learners"]} colors={[PBI_COLORS[0]]} />
          </PbiCard>
          <PbiCard title="Learners by Programme" subtitle="Share of total" className="md:col-span-2">
            <Donut data={programmeData} colors={PBI_COLORS} />
          </PbiCard>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <PbiCard title="Grant Allocated vs Spent" subtitle="By programme">
            <VBar data={grantsData} x="programme" keys={["Allocated", "Spent"]} colors={[PBI_COLORS[1], PBI_COLORS[0]]} />
          </PbiCard>
          <PbiCard title="Skills Centre Performance" subtitle="Sorted by completion rate">
            <CentreTable rows={centreRows} />
          </PbiCard>
        </div>
      )}

      <PageTabs page={page} onChange={setPage} />
    </div>
  );
}
