import { useMemo, useRef, useState } from "react";
import {
  Plus, Trash2, Loader2, FolderOpen, Save, UploadCloud, Sparkles, Share2, Bookmark,
  Copy, X,
} from "lucide-react";
import { PbiCard, PbiKpiCard } from "./powerbi-card";
import { AreaTrend, VBar, Donut, ScatterXY, Waterfall, Gauge } from "./charts";
import {
  PBI_FONT, PBI_TEXT, PBI_SUBTEXT, PBI_BORDER, PBI_CANVAS_BG, PRESET_THEMES,
} from "@/lib/powerbi-theme";
import { useDatasetsForAnalysis } from "@/lib/queries/statistics";
import { useUploadDataset } from "@/lib/queries/datasets";
import { useAskQuestion } from "@/lib/queries/ai-analyst";
import type { AskResult } from "@/lib/api/ai-analyst";
import {
  usePowerBiReports, useCreatePowerBiReport, useUpdatePowerBiReport, useDeletePowerBiReport,
  usePowerBiDatasetQuery, useSharePowerBiReport, useRevokePowerBiShareLink,
} from "@/lib/queries/powerbi";
import { ROLES, type Role } from "@/lib/roles";
import type {
  PowerBiAgg, PowerBiVisual, PowerBiVisualType, PowerBiFilter, PowerBiDateBucket,
  PowerBiFormula, PowerBiFormulaOp, PowerBiBookmark,
} from "@/lib/api/powerbi";

// The Report Builder — pick any of your own uploaded datasets (Dataset
// Catalogue / Upload Dataset), drop fields into a visual, choose a visual
// type, save. Every visual queries the warehouse live via
// GET /powerbi/datasets/:id/query (or, once shared, its read-only public
// counterpart) — no separate copy of the data — the way a real Power BI
// report queries its dataset. Same PBI visual chrome as the Skills Analytics
// preview (powerbi-report.tsx), via the shared PbiCard.

type VisualTypeMeta = {
  value: PowerBiVisualType;
  label: string;
  needsGroupBy: boolean;
  needsGroupBy2: boolean;
  needsColumns: boolean;
  needsXY: boolean;
  isSlicer: boolean;
  supportsDateBucket: boolean;
  supportsFormula: boolean;
};

const VISUAL_TYPES: VisualTypeMeta[] = [
  { value: "kpi", label: "Card (single number)", needsGroupBy: false, needsGroupBy2: false, needsColumns: false, needsXY: false, isSlicer: false, supportsDateBucket: false, supportsFormula: true },
  { value: "gauge", label: "Gauge", needsGroupBy: false, needsGroupBy2: false, needsColumns: false, needsXY: false, isSlicer: false, supportsDateBucket: false, supportsFormula: true },
  { value: "bar", label: "Bar chart", needsGroupBy: true, needsGroupBy2: false, needsColumns: false, needsXY: false, isSlicer: false, supportsDateBucket: true, supportsFormula: true },
  { value: "line", label: "Line chart", needsGroupBy: true, needsGroupBy2: false, needsColumns: false, needsXY: false, isSlicer: false, supportsDateBucket: true, supportsFormula: true },
  { value: "waterfall", label: "Waterfall", needsGroupBy: true, needsGroupBy2: false, needsColumns: false, needsXY: false, isSlicer: false, supportsDateBucket: false, supportsFormula: true },
  { value: "donut", label: "Donut chart", needsGroupBy: true, needsGroupBy2: false, needsColumns: false, needsXY: false, isSlicer: false, supportsDateBucket: false, supportsFormula: true },
  { value: "scatter", label: "Scatter plot", needsGroupBy: false, needsGroupBy2: false, needsColumns: false, needsXY: true, isSlicer: false, supportsDateBucket: false, supportsFormula: false },
  { value: "matrix", label: "Matrix (pivot table)", needsGroupBy: true, needsGroupBy2: true, needsColumns: false, needsXY: false, isSlicer: false, supportsDateBucket: false, supportsFormula: true },
  { value: "table", label: "Table", needsGroupBy: false, needsGroupBy2: false, needsColumns: true, needsXY: false, isSlicer: false, supportsDateBucket: false, supportsFormula: false },
  { value: "slicer", label: "Slicer", needsGroupBy: true, needsGroupBy2: false, needsColumns: false, needsXY: false, isSlicer: true, supportsDateBucket: false, supportsFormula: false },
];
const AGGS: PowerBiAgg[] = ["sum", "avg", "count", "min", "max"];
const DATE_BUCKETS: PowerBiDateBucket[] = ["day", "week", "month", "quarter", "year"];
const FORMULA_OPS: PowerBiFormulaOp[] = ["+", "-", "*", "/"];
const UPLOAD_ACCEPTED = ".csv,.tsv,.json,.xlsx";

function fmt(v: unknown): string {
  const n = Number(v);
  if (Number.isNaN(n)) return String(v ?? "—");
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2);
}

function formatRuleColor(value: number, rules: PowerBiVisual["format_rules"]): string | undefined {
  for (const r of rules ?? []) {
    const passes =
      r.operator === "gt" ? value > r.value :
      r.operator === "gte" ? value >= r.value :
      r.operator === "lt" ? value < r.value :
      r.operator === "lte" ? value <= r.value :
      value === r.value;
    if (passes) return r.color;
  }
  return undefined;
}

function PbiTable({ columns, rows }: { columns: string[]; rows: unknown[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]" style={{ fontFamily: PBI_FONT }}>
        <thead>
          <tr style={{ background: "#FAF9F8" }}>
            {columns.map((c) => (
              <th key={c} className="px-2.5 py-1.5 text-left font-semibold whitespace-nowrap"
                style={{ color: PBI_SUBTEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>
                {c}
              </th>
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
  const rowKeys = useMemo(() => Array.from(new Set(rows.map((r) => String(r[0])))), [rows]);
  const colKeys = useMemo(() => Array.from(new Set(rows.map((r) => String(r[1])))), [rows]);
  const cell = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(`${String(r[0])}|${String(r[1])}`, Number(r[2]) || 0);
    return m;
  }, [rows]);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]" style={{ fontFamily: PBI_FONT }}>
        <thead>
          <tr style={{ background: "#FAF9F8" }}>
            <th className="px-2.5 py-1.5" style={{ borderBottom: `1px solid ${PBI_BORDER}` }} />
            {colKeys.map((c) => (
              <th key={c} className="px-2.5 py-1.5 text-right font-semibold whitespace-nowrap"
                style={{ color: PBI_SUBTEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowKeys.map((rk) => (
            <tr key={rk}>
              <td className="px-2.5 py-1.5 font-semibold whitespace-nowrap"
                style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>{rk}</td>
              {colKeys.map((ck) => (
                <td key={ck} className="px-2.5 py-1.5 text-right"
                  style={{ color: PBI_TEXT, borderBottom: `1px solid ${PBI_BORDER}` }}>
                  {fmt(cell.get(`${rk}|${ck}`) ?? 0)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VisualPreview({
  datasetId, visual, activeFilters, colors, onRemove, onFilter,
}: {
  datasetId: number; visual: PowerBiVisual; activeFilters: PowerBiFilter[]; colors: string[];
  onRemove?: () => void; onFilter?: (f: PowerBiFilter) => void;
}) {
  const meta = VISUAL_TYPES.find((t) => t.value === visual.type)!;
  const dateBucketable = visual.type === "bar" || visual.type === "line";

  const queryOpts = useMemo(() => {
    if (meta.isSlicer) {
      return { distinctColumn: visual.group_by ?? undefined, limit: 100 };
    }
    if (visual.type === "scatter") {
      return {
        xColumn: visual.x_column ?? undefined, yColumn: visual.y_column ?? undefined,
        filters: activeFilters, limit: 300,
      };
    }
    const columns = visual.type === "table" ? visual.columns : (visual.value_column ? [visual.value_column] : []);
    return {
      columns,
      groupBy: visual.group_by ?? undefined,
      groupBy2: visual.type === "matrix" ? (visual.group_by_2 ?? undefined) : undefined,
      agg: visual.type === "table" ? undefined : (visual.agg ?? undefined),
      formula: meta.supportsFormula ? (visual.formula ?? undefined) : undefined,
      dateBucket: dateBucketable ? (visual.date_bucket ?? undefined) : undefined,
      comparePreviousPeriod: dateBucketable ? visual.compare_previous_period : undefined,
      filters: activeFilters,
      limit: 100,
      join: visual.type === "table" ? (visual.join ?? undefined) : undefined,
    };
  }, [visual, activeFilters, meta, dateBucketable]);

  const enabled = meta.isSlicer ? !!visual.group_by
    : visual.type === "scatter" ? !!(visual.x_column && visual.y_column)
    : visual.type === "matrix" ? !!(visual.group_by && visual.group_by_2 && visual.agg)
    : visual.type === "table" ? true
    : !!(visual.group_by || visual.formula || visual.value_column);

  const { data, isLoading, isError, error } = usePowerBiDatasetQuery(datasetId, queryOpts, enabled);

  const canCrossFilter = !!onFilter && !!visual.group_by && !(dateBucketable && visual.date_bucket);

  const body = useMemo(() => {
    if (!data) return null;

    if (meta.isSlicer) {
      return (
        <div className="flex flex-wrap gap-1.5 pb-1">
          {data.rows.map((r) => {
            const val = r[0];
            const active = activeFilters.some((f) => f.column === visual.group_by && f.value === val);
            return (
              <button
                key={String(val)}
                onClick={() => onFilter?.({ column: visual.group_by as string, op: "eq", value: val })}
                className="px-2.5 py-1 text-[11px] rounded-sm border transition-colors"
                style={{
                  borderColor: active ? colors[0] : PBI_BORDER,
                  background: active ? colors[0] : "#fff",
                  color: active ? "#fff" : PBI_TEXT,
                }}
              >
                {String(val)}
              </button>
            );
          })}
        </div>
      );
    }

    if (visual.type === "table") return <PbiTable columns={data.columns} rows={data.rows} />;
    if (visual.type === "matrix") return <PivotTable rows={data.rows} />;

    if (visual.type === "scatter") {
      const points = data.rows.map((r) => ({ x: Number(r[0]) || 0, y: Number(r[1]) || 0 }));
      return <ScatterXY data={points} xLabel={visual.x_column ?? undefined} yLabel={visual.y_column ?? undefined} color={colors[0]} />;
    }

    if (visual.type === "kpi" || visual.type === "gauge") {
      const value = Number(data.rows[0]?.[0]) || 0;
      const color = formatRuleColor(value, visual.format_rules);
      if (visual.type === "gauge") {
        const max = Math.max(10, Math.ceil(value * 1.5 / 10) * 10);
        return <Gauge value={value} max={max} />;
      }
      return <PbiKpiCard label={visual.title} value={fmt(value)} color={color} />;
    }

    // bar / line / waterfall / donut
    if (dateBucketable && visual.date_bucket && visual.compare_previous_period) {
      const buckets = Array.from(new Set(data.rows.map((r) => String(r[0]))));
      const chartRows = buckets.map((b) => {
        const cur = data.rows.find((r) => String(r[0]) === b && r[1] === "current");
        const prev = data.rows.find((r) => String(r[0]) === b && r[1] === "previous");
        return {
          period: b.slice(0, 10),
          [visual.title]: Number(cur?.[2]) || 0,
          [`${visual.title} (prior period)`]: prev ? Number(prev[2]) : null,
        };
      });
      if (visual.type === "line") {
        return <AreaTrend data={chartRows.map((r) => ({ month: r.period, ...r }))}
          keys={[visual.title, `${visual.title} (prior period)`]} colors={colors} />;
      }
      return <VBar data={chartRows} x="period" keys={[visual.title, `${visual.title} (prior period)`]} colors={colors} />;
    }

    const chartRows = data.rows.map((r) => ({
      category: dateBucketable && visual.date_bucket ? String(r[0]).slice(0, 10) : String(r[0]),
      raw: r[0],
      [visual.title]: Number(r[1]) || 0,
    }));

    if (visual.type === "waterfall") {
      return <Waterfall data={chartRows.map((r) => ({ label: r.category, value: Number(r[visual.title]) }))} />;
    }
    if (visual.type === "bar") {
      return (
        <VBar
          data={chartRows} x="category" keys={[visual.title]} colors={colors}
          onSegmentClick={canCrossFilter ? (cat) => {
            const row = chartRows.find((r) => r.category === cat);
            if (row) onFilter?.({ column: visual.group_by as string, op: "eq", value: row.raw });
          } : undefined}
        />
      );
    }
    if (visual.type === "line") {
      return <AreaTrend data={chartRows.map((r) => ({ month: r.category, [visual.title]: r[visual.title] }))} keys={[visual.title]} colors={colors} />;
    }
    // donut
    return (
      <Donut
        data={chartRows.map((r) => ({ name: r.category, value: Number(r[visual.title]) }))}
        colors={colors}
        onSegmentClick={canCrossFilter ? (name) => {
          const row = chartRows.find((r) => r.category === name);
          if (row) onFilter?.({ column: visual.group_by as string, op: "eq", value: row.raw });
        } : undefined}
      />
    );
  }, [data, meta, visual, colors, activeFilters, canCrossFilter, onFilter, dateBucketable]);

  // Smart narrative — a plain-language one-liner for the latest period vs.
  // the one before it, computed from data already fetched for the chart.
  const narrative = useMemo(() => {
    if (!data || !dateBucketable || !visual.date_bucket || !visual.compare_previous_period) return null;
    // The very last bucket in the series can be a "previous"-only row (the
    // prior series is shifted forward by one bucket to overlay the chart) —
    // anchor on the latest bucket that actually has a "current" value.
    const currentRows = data.rows.filter((r) => r[1] === "current");
    if (currentRows.length === 0) return null;
    const latestCur = [...currentRows].sort((a, b) => String(a[0]).localeCompare(String(b[0])))[currentRows.length - 1];
    const latestBucket = String(latestCur[0]);
    const prev = data.rows.find((r) => String(r[0]) === latestBucket && r[1] === "previous");
    const curVal = Number(latestCur[2]);
    const prevVal = Number(prev?.[2]);
    if (Number.isNaN(curVal)) return null;
    if (!prev || Number.isNaN(prevVal) || prevVal === 0) {
      return `Latest period: ${fmt(curVal)} — no prior period to compare.`;
    }
    const pct = ((curVal - prevVal) / Math.abs(prevVal)) * 100;
    const dir = pct > 0 ? "up" : pct < 0 ? "down" : "flat vs";
    return `Latest period: ${fmt(curVal)} — ${dir} ${Math.abs(pct).toFixed(0)}% vs previous period (${fmt(prevVal)}).`;
  }, [data, dateBucketable, visual.date_bucket, visual.compare_previous_period]);

  const action = onRemove ? (
    <button onClick={onRemove} className="p-1 rounded-md" style={{ color: PBI_SUBTEXT }}>
      <Trash2 className="size-3.5" />
    </button>
  ) : undefined;

  if (visual.type === "kpi" || visual.type === "gauge") {
    return isLoading ? (
      <div className="py-6 flex justify-center"><Loader2 className="size-5 animate-spin" style={{ color: PBI_SUBTEXT }} /></div>
    ) : isError ? (
      <div className="text-xs text-danger p-2">{(error as Error).message}</div>
    ) : (
      body ?? <div className="text-xs p-2" style={{ color: PBI_SUBTEXT }}>Set up the fields above</div>
    );
  }

  return (
    <PbiCard title={visual.title} subtitle={meta.label} action={action}>
      {isLoading ? (
        <div className="py-8 flex justify-center"><Loader2 className="size-5 animate-spin" style={{ color: PBI_SUBTEXT }} /></div>
      ) : isError ? (
        <div className="text-xs text-danger p-2">{(error as Error).message}</div>
      ) : (
        <>
          {body ?? <div className="text-xs p-2" style={{ color: PBI_SUBTEXT }}>Set up the fields above</div>}
          {narrative && <div className="text-[11px] px-1 pt-1.5" style={{ color: PBI_SUBTEXT }}>{narrative}</div>}
        </>
      )}
    </PbiCard>
  );
}

export function PowerBiBuilder() {
  const { data: datasets = [] } = useDatasetsForAnalysis();
  const { data: reports = [] } = usePowerBiReports();
  const createReport = useCreatePowerBiReport();
  const updateReport = useUpdatePowerBiReport();
  const deleteReport = useDeletePowerBiReport();
  const shareReport = useSharePowerBiReport();
  const revokeShare = useRevokePowerBiShareLink();
  const uploadDataset = useUploadDataset();
  const askQuestion = useAskQuestion();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [reportId, setReportId] = useState<number | null>(null);
  const [datasetId, setDatasetId] = useState<number | null>(null);
  const [visuals, setVisuals] = useState<PowerBiVisual[]>([]);
  const [reportName, setReportName] = useState("");
  const [activeFilters, setActiveFilters] = useState<PowerBiFilter[]>([]);
  const [bookmarks, setBookmarks] = useState<PowerBiBookmark[]>([]);
  const [themeColors, setThemeColors] = useState<string[]>(PRESET_THEMES[0].colors);
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [bookmarkName, setBookmarkName] = useState("");
  const [question, setQuestion] = useState("");
  const [showAccess, setShowAccess] = useState(false);

  const [newType, setNewType] = useState<PowerBiVisualType>("bar");
  const [newTitle, setNewTitle] = useState("");
  const [newGroupBy, setNewGroupBy] = useState("");
  const [newGroupBy2, setNewGroupBy2] = useState("");
  const [newValueColumn, setNewValueColumn] = useState("");
  const [newAgg, setNewAgg] = useState<PowerBiAgg>("sum");
  const [newColumns, setNewColumns] = useState<Set<string>>(new Set());
  const [newXColumn, setNewXColumn] = useState("");
  const [newYColumn, setNewYColumn] = useState("");
  const [joinDatasetId, setJoinDatasetId] = useState<number | "">("");
  const [joinLeftOn, setJoinLeftOn] = useState("");
  const [joinRightOn, setJoinRightOn] = useState("");
  const [joinRightColumns, setJoinRightColumns] = useState<Set<string>>(new Set());
  const [useFormula, setUseFormula] = useState(false);
  const [formulaLeft, setFormulaLeft] = useState("");
  const [formulaOp, setFormulaOp] = useState<PowerBiFormulaOp>("-");
  const [formulaRight, setFormulaRight] = useState("");
  const [newDateBucket, setNewDateBucket] = useState<PowerBiDateBucket | "">("");
  const [newCompare, setNewCompare] = useState(false);
  const [formatOp, setFormatOp] = useState<"gte" | "lte">("gte");
  const [formatValue, setFormatValue] = useState("");
  const [formatColor, setFormatColor] = useState("#D64550");

  const dataset = datasets.find((d) => d.id === datasetId);
  const columns = dataset?.columns ?? [];
  const typeMeta = VISUAL_TYPES.find((t) => t.value === newType)!;
  const joinDataset = datasets.find((d) => d.id === joinDatasetId);
  const joinColumns = joinDataset?.columns ?? [];

  async function handleUpload(file: File) {
    setUploadError(null);
    try {
      const name = file.name.replace(/\.[^./]+$/, "");
      const uploaded = await uploadDataset.mutateAsync({ file, name });
      setDatasetId(uploaded.id);
      setVisuals([]);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function addVisual() {
    if (!newTitle.trim()) return;
    const visual: PowerBiVisual = {
      type: newType,
      title: newTitle.trim(),
      value_column: !typeMeta.needsColumns && !useFormula ? (newValueColumn || null) : null,
      agg: !typeMeta.needsColumns ? newAgg : null,
      group_by: (typeMeta.needsGroupBy || typeMeta.isSlicer) ? (newGroupBy || null) : null,
      group_by_2: typeMeta.needsGroupBy2 ? (newGroupBy2 || null) : null,
      columns: typeMeta.needsColumns ? [...newColumns] : [],
      x_column: typeMeta.needsXY ? (newXColumn || null) : null,
      y_column: typeMeta.needsXY ? (newYColumn || null) : null,
      date_bucket: typeMeta.supportsDateBucket && newDateBucket ? newDateBucket : null,
      compare_previous_period: typeMeta.supportsDateBucket ? newCompare : false,
      formula: typeMeta.supportsFormula && useFormula && formulaLeft && formulaRight
        ? { left: formulaLeft, op: formulaOp, right: formulaRight } : null,
      format_rules: (newType === "kpi" || newType === "gauge") && formatValue
        ? [{ operator: formatOp, value: Number(formatValue), color: formatColor }] : [],
      join: newType === "table" && joinDatasetId && joinLeftOn && joinRightOn
        ? { dataset_id: joinDatasetId, left_on: joinLeftOn, right_on: joinRightOn, right_columns: [...joinRightColumns] }
        : null,
    };
    setVisuals((prev) => [...prev, visual]);
    setNewTitle(""); setNewGroupBy(""); setNewGroupBy2(""); setNewValueColumn("");
    setNewXColumn(""); setNewYColumn(""); setNewColumns(new Set());
    setUseFormula(false); setFormulaLeft(""); setFormulaRight("");
    setNewDateBucket(""); setNewCompare(false); setFormatValue("");
    setJoinDatasetId(""); setJoinLeftOn(""); setJoinRightOn(""); setJoinRightColumns(new Set());
  }

  function openReport(id: number) {
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    setReportId(report.id);
    setDatasetId(report.dataset_id);
    setVisuals(report.visuals);
    setReportName(report.name);
    setBookmarks(report.bookmarks ?? []);
    setThemeColors(report.theme?.colors ?? PRESET_THEMES[0].colors);
    setAllowedRoles(report.allowed_roles ?? []);
    setShareToken(report.share_token ?? null);
    setActiveFilters([]);
  }

  function newReport() {
    setReportId(null); setDatasetId(null); setVisuals([]); setReportName("");
    setBookmarks([]); setThemeColors(PRESET_THEMES[0].colors); setAllowedRoles([]);
    setShareToken(null); setActiveFilters([]);
  }

  function toggleFilter(f: PowerBiFilter) {
    setActiveFilters((prev) => {
      const exists = prev.some((p) => p.column === f.column && p.value === f.value);
      if (exists) return prev.filter((p) => !(p.column === f.column && p.value === f.value));
      return [...prev.filter((p) => p.column !== f.column), f];
    });
  }

  function saveBookmark() {
    if (!bookmarkName.trim()) return;
    setBookmarks((prev) => [...prev, { name: bookmarkName.trim(), filters: activeFilters }]);
    setBookmarkName("");
  }

  function save() {
    if (!datasetId || !reportName.trim() || visuals.length === 0) return;
    const input = {
      name: reportName.trim(), dataset_id: datasetId, visuals,
      allowed_roles: allowedRoles, theme: { colors: themeColors }, bookmarks,
    };
    if (reportId) {
      updateReport.mutate({ reportId, input });
    } else {
      createReport.mutate(input, { onSuccess: (r) => setReportId(r.id) });
    }
  }

  function toggleRole(role: Role) {
    setAllowedRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  }

  function handleShare() {
    if (!reportId) return;
    shareReport.mutate(reportId, { onSuccess: (r) => setShareToken(r.share_token) });
  }
  function handleRevokeShare() {
    if (!reportId) return;
    revokeShare.mutate(reportId, { onSuccess: () => setShareToken(null) });
  }
  const shareUrl = shareToken ? `${window.location.origin}/shared/powerbi/${shareToken}` : null;

  function handleAsk() {
    if (!question.trim()) return;
    askQuestion.mutate(question);
  }
  const askResult: AskResult | undefined = askQuestion.data;

  const kpis = visuals.filter((v) => v.type === "kpi" || v.type === "gauge");
  const others = visuals.filter((v) => v.type !== "kpi" && v.type !== "gauge");

  return (
    <div className="rounded-[2px] p-3 flex flex-col gap-3" style={{ background: PBI_CANVAS_BG, fontFamily: PBI_FONT }}>
      <div className="grid md:grid-cols-[1fr_260px] gap-3">
        <PbiCard title="Dataset" subtitle="Any of your own uploads, or the demo one">
          <div className="flex flex-col gap-2">
            <select
              value={datasetId ?? ""}
              onChange={(e) => { setDatasetId(e.target.value ? Number(e.target.value) : null); setVisuals([]); setActiveFilters([]); }}
              className="text-[12px] px-2 py-1.5 rounded-sm border bg-white"
              style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}
            >
              <option value="">Choose a dataset…</option>
              {datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadDataset.isPending}
                className="text-[11px] px-2.5 py-1.5 rounded-sm border flex items-center gap-1.5 font-medium disabled:opacity-50"
                style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}
              >
                {uploadDataset.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                {uploadDataset.isPending ? "Uploading…" : "Upload a dataset"}
              </button>
              <input ref={fileInputRef} type="file" accept={UPLOAD_ACCEPTED} className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
              <button onClick={newReport} className="text-[11px] px-2.5 py-1.5 rounded-sm border font-medium" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                New report
              </button>
            </div>
            {uploadError && <div className="text-[11px] text-danger">{uploadError}</div>}
          </div>
        </PbiCard>

        <PbiCard title="My Reports" subtitle={`${reports.length} saved`}>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {reports.length === 0 && <div className="text-[11px]" style={{ color: PBI_SUBTEXT }}>None yet</div>}
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-1">
                <button onClick={() => openReport(r.id)} className="flex-1 text-left text-[12px] px-2 py-1 rounded-sm hover:bg-black/5 truncate flex items-center gap-1.5" style={{ color: PBI_TEXT }}>
                  <FolderOpen className="size-3.5 shrink-0" /> {r.name}
                  {r.allowed_roles && r.allowed_roles.length > 0 && (
                    <span className="text-[9px] px-1 rounded-sm border" style={{ borderColor: PBI_BORDER, color: PBI_SUBTEXT }}>restricted</span>
                  )}
                </button>
                <button onClick={() => deleteReport.mutate(r.id)} className="p-1" style={{ color: PBI_SUBTEXT }}><Trash2 className="size-3.5" /></button>
              </div>
            ))}
          </div>
        </PbiCard>
      </div>

      <PbiCard title="Ask a question" subtitle="Natural language, powered by the AI Analyst — works across your uploaded data">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={question} onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAsk(); }}
              placeholder="e.g. Total capacity by province"
              className="flex-1 text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}
            />
            <button onClick={handleAsk} disabled={!question.trim() || askQuestion.isPending}
              className="px-3 py-1.5 text-[12px] font-semibold rounded-sm flex items-center gap-1.5 justify-center disabled:opacity-50"
              style={{ background: themeColors[0], color: "#fff" }}>
              {askQuestion.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />} Ask
            </button>
          </div>
          {askQuestion.isError && <div className="text-[11px] text-danger">{(askQuestion.error as Error).message}</div>}
          {askResult && (
            <div className="text-[11px]" style={{ color: PBI_SUBTEXT }}>
              {askResult.explanation}
              {askResult.chart.type !== "table" && askResult.chart.x && (
                <div className="mt-2">
                  {askResult.chart.type === "donut" ? (
                    <Donut colors={themeColors} data={askResult.rows.slice(0, 12).map((r) => ({
                      name: String(r[askResult.columns.indexOf(askResult.chart.x as string)]),
                      value: Number(r[askResult.columns.indexOf(askResult.chart.keys[0])]) || 0,
                    }))} />
                  ) : (
                    <VBar colors={themeColors} x="category" keys={askResult.chart.keys} data={askResult.rows.slice(0, 25).map((r) => {
                      const xi = askResult.columns.indexOf(askResult.chart.x as string);
                      const point: Record<string, string | number> = { category: String(r[xi]) };
                      askResult.chart.keys.forEach((k) => {
                        point[k] = Number(r[askResult.columns.indexOf(k)]) || 0;
                      });
                      return point;
                    })} />
                  )}
                </div>
              )}
              {(askResult.chart.type === "table" || !askResult.chart.x) && (
                <div className="mt-2"><PbiTable columns={askResult.columns} rows={askResult.rows.slice(0, 20)} /></div>
              )}
            </div>
          )}
        </div>
      </PbiCard>

      {dataset && (
        <>
          <PbiCard title="Add a Visual" subtitle="Pick fields, add it to the canvas below">
            <div className="flex flex-col gap-2">
              <div className="grid md:grid-cols-6 gap-2 items-end">
                <label className="flex flex-col gap-1 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                  Type
                  <select value={newType} onChange={(e) => setNewType(e.target.value as PowerBiVisualType)}
                    className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                    {VISUAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                  Title
                  <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Visual title"
                    className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }} />
                </label>

                {(typeMeta.needsGroupBy || typeMeta.isSlicer) && (
                  <label className="flex flex-col gap-1 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                    {typeMeta.isSlicer ? "Column" : "Group by"}
                    <select value={newGroupBy} onChange={(e) => setNewGroupBy(e.target.value)}
                      className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                      <option value="">Column…</option>
                      {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </label>
                )}
                {typeMeta.needsGroupBy2 && (
                  <label className="flex flex-col gap-1 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                    Then by
                    <select value={newGroupBy2} onChange={(e) => setNewGroupBy2(e.target.value)}
                      className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                      <option value="">Column…</option>
                      {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </label>
                )}

                {typeMeta.needsXY && (
                  <>
                    <label className="flex flex-col gap-1 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                      X axis
                      <select value={newXColumn} onChange={(e) => setNewXColumn(e.target.value)}
                        className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                        <option value="">Column…</option>
                        {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                      Y axis
                      <select value={newYColumn} onChange={(e) => setNewYColumn(e.target.value)}
                        className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                        <option value="">Column…</option>
                        {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </label>
                  </>
                )}

                {typeMeta.needsColumns && (
                  <div className="flex flex-col gap-1 text-[11px] md:col-span-2" style={{ color: PBI_SUBTEXT }}>
                    Columns
                    <div className="flex flex-wrap gap-2 border rounded-sm p-1.5" style={{ borderColor: PBI_BORDER }}>
                      {columns.map((c) => (
                        <label key={c.name} className="flex items-center gap-1 text-[11px]" style={{ color: PBI_TEXT }}>
                          <input type="checkbox" checked={newColumns.has(c.name)}
                            onChange={() => setNewColumns((prev) => {
                              const next = new Set(prev);
                              if (next.has(c.name)) next.delete(c.name); else next.add(c.name);
                              return next;
                            })} />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {newType === "table" && (
                  <div className="flex flex-col gap-1 text-[11px] md:col-span-6" style={{ color: PBI_SUBTEXT }}>
                    Add columns from another dataset (optional)
                    <div className="grid md:grid-cols-4 gap-2 border rounded-sm p-2" style={{ borderColor: PBI_BORDER }}>
                      <select value={joinDatasetId} onChange={(e) => { setJoinDatasetId(e.target.value ? Number(e.target.value) : ""); setJoinRightOn(""); setJoinRightColumns(new Set()); }}
                        className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                        <option value="">No join…</option>
                        {datasets.filter((d) => d.id !== datasetId).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      {joinDataset && (
                        <>
                          <select value={joinLeftOn} onChange={(e) => setJoinLeftOn(e.target.value)}
                            className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                            <option value="">This dataset's key…</option>
                            {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                          <select value={joinRightOn} onChange={(e) => setJoinRightOn(e.target.value)}
                            className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                            <option value="">{joinDataset.name}'s key…</option>
                            {joinColumns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                          <div className="flex flex-wrap gap-2 items-center">
                            {joinColumns.map((c) => (
                              <label key={c.name} className="flex items-center gap-1 text-[11px]" style={{ color: PBI_TEXT }}>
                                <input type="checkbox" checked={joinRightColumns.has(c.name)}
                                  onChange={() => setJoinRightColumns((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(c.name)) next.delete(c.name); else next.add(c.name);
                                    return next;
                                  })} />
                                {c.name}
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {!typeMeta.needsColumns && !typeMeta.needsXY && !typeMeta.isSlicer && !useFormula && (
                  <>
                    <label className="flex flex-col gap-1 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                      Value
                      <select value={newValueColumn} onChange={(e) => setNewValueColumn(e.target.value)}
                        className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                        <option value="">Column…</option>
                        {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                      Aggregation
                      <select value={newAgg} onChange={(e) => setNewAgg(e.target.value as PowerBiAgg)}
                        className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                        {AGGS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </label>
                  </>
                )}

                {!typeMeta.needsColumns && !typeMeta.needsXY && !typeMeta.isSlicer && useFormula && (
                  <div className="flex flex-col gap-1 text-[11px] md:col-span-3" style={{ color: PBI_SUBTEXT }}>
                    Calculated measure
                    <div className="flex gap-1 items-center">
                      <select value={formulaLeft} onChange={(e) => setFormulaLeft(e.target.value)}
                        className="text-[12px] px-2 py-1.5 rounded-sm border bg-white flex-1" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                        <option value="">Column…</option>
                        {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <select value={formulaOp} onChange={(e) => setFormulaOp(e.target.value as PowerBiFormulaOp)}
                        className="text-[12px] px-1.5 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                        {FORMULA_OPS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <select value={formulaRight} onChange={(e) => setFormulaRight(e.target.value)}
                        className="text-[12px] px-2 py-1.5 rounded-sm border bg-white flex-1" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                        <option value="">Column…</option>
                        {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <button onClick={addVisual} className="px-3 py-1.5 text-[12px] font-semibold rounded-sm flex items-center gap-1.5 justify-center"
                  style={{ background: themeColors[0], color: "#fff" }}>
                  <Plus className="size-3.5" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-3 items-center pt-1">
                {typeMeta.supportsFormula && !typeMeta.needsColumns && !typeMeta.isSlicer && (
                  <label className="flex items-center gap-1.5 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                    <input type="checkbox" checked={useFormula} onChange={(e) => setUseFormula(e.target.checked)} />
                    Use a calculated measure
                  </label>
                )}
                {typeMeta.supportsDateBucket && (
                  <>
                    <label className="flex items-center gap-1.5 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                      Date bucket
                      <select value={newDateBucket} onChange={(e) => setNewDateBucket(e.target.value as PowerBiDateBucket | "")}
                        className="text-[12px] px-2 py-1 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                        <option value="">None</option>
                        {DATE_BUCKETS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </label>
                    {newDateBucket && (
                      <label className="flex items-center gap-1.5 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                        <input type="checkbox" checked={newCompare} onChange={(e) => setNewCompare(e.target.checked)} />
                        Compare to previous period
                      </label>
                    )}
                  </>
                )}
                {(newType === "kpi" || newType === "gauge") && (
                  <div className="flex items-center gap-1.5 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                    Colour when value
                    <select value={formatOp} onChange={(e) => setFormatOp(e.target.value as "gte" | "lte")}
                      className="text-[12px] px-1.5 py-1 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                      <option value="gte">≥</option>
                      <option value="lte">≤</option>
                    </select>
                    <input value={formatValue} onChange={(e) => setFormatValue(e.target.value)} placeholder="threshold" type="number"
                      className="text-[12px] px-2 py-1 rounded-sm border bg-white w-20" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }} />
                    <input type="color" value={formatColor} onChange={(e) => setFormatColor(e.target.value)} className="size-6 rounded-sm border p-0" style={{ borderColor: PBI_BORDER }} />
                  </div>
                )}
              </div>
            </div>
          </PbiCard>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]" style={{ color: PBI_SUBTEXT }}>
              Filtering by:
              {activeFilters.map((f) => (
                <button key={`${f.column}-${String(f.value)}`} onClick={() => toggleFilter(f)}
                  className="px-2 py-1 rounded-sm border flex items-center gap-1" style={{ borderColor: PBI_BORDER, color: PBI_TEXT, background: "#fff" }}>
                  {f.column}: {String(f.value)} <X className="size-3" />
                </button>
              ))}
              <button onClick={() => setActiveFilters([])} className="underline">Clear all</button>
            </div>
          )}

          {kpis.length > 0 && (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              {kpis.map((v, i) => (
                <VisualPreview key={i} datasetId={dataset.id} visual={v} activeFilters={activeFilters} colors={themeColors}
                  onFilter={toggleFilter} onRemove={() => setVisuals((prev) => prev.filter((x) => x !== v))} />
              ))}
            </div>
          )}
          {others.length > 0 && (
            <div className="grid md:grid-cols-2 gap-3">
              {others.map((v, i) => (
                <VisualPreview key={i} datasetId={dataset.id} visual={v} activeFilters={activeFilters} colors={themeColors}
                  onFilter={toggleFilter} onRemove={() => setVisuals((prev) => prev.filter((x) => x !== v))} />
              ))}
            </div>
          )}

          {visuals.length > 0 && (
            <>
              <PbiCard title="Bookmarks" subtitle="Save the current filter state, restore it later">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input value={bookmarkName} onChange={(e) => setBookmarkName(e.target.value)} placeholder="Bookmark name"
                      className="flex-1 text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }} />
                    <button onClick={saveBookmark} disabled={!bookmarkName.trim()}
                      className="px-3 py-1.5 text-[12px] font-semibold rounded-sm flex items-center gap-1.5 disabled:opacity-50"
                      style={{ background: themeColors[0], color: "#fff" }}>
                      <Bookmark className="size-3.5" /> Save
                    </button>
                  </div>
                  {bookmarks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {bookmarks.map((b, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <button onClick={() => setActiveFilters(b.filters)} className="text-[11px] px-2 py-1 rounded-sm border" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                            {b.name}
                          </button>
                          <button onClick={() => setBookmarks((prev) => prev.filter((_, idx) => idx !== i))} style={{ color: PBI_SUBTEXT }}>
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PbiCard>

              <PbiCard title="Theme" subtitle="Report colour palette">
                <div className="flex flex-wrap gap-2">
                  {PRESET_THEMES.map((t) => (
                    <button key={t.name} onClick={() => setThemeColors(t.colors)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[11px]"
                      style={{ borderColor: themeColors === t.colors ? t.colors[0] : PBI_BORDER, color: PBI_TEXT }}>
                      <span className="flex gap-0.5">
                        {t.colors.slice(0, 4).map((c) => <span key={c} className="size-3 rounded-full inline-block" style={{ background: c }} />)}
                      </span>
                      {t.name}
                    </button>
                  ))}
                </div>
              </PbiCard>

              <PbiCard title="Save this report" subtitle="Reopen it any time from My Reports" action={
                <button onClick={() => setShowAccess((s) => !s)} className="text-[11px] underline" style={{ color: PBI_SUBTEXT }}>
                  {showAccess ? "Hide sharing" : "Sharing & access"}
                </button>
              }>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <input value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="Report name"
                      className="flex-1 text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }} />
                    <button onClick={save} disabled={!reportName.trim() || createReport.isPending || updateReport.isPending}
                      className="px-3 py-1.5 text-[12px] font-semibold rounded-sm flex items-center gap-1.5" style={{ background: themeColors[0], color: "#fff" }}>
                      {(createReport.isPending || updateReport.isPending) ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                      {reportId ? "Update" : "Save"}
                    </button>
                  </div>

                  {showAccess && (
                    <div className="flex flex-col gap-3 pt-2 border-t" style={{ borderColor: PBI_BORDER }}>
                      <div>
                        <div className="text-[11px] font-semibold mb-1" style={{ color: PBI_TEXT }}>Restrict to roles</div>
                        <div className="text-[10px] mb-1.5" style={{ color: PBI_SUBTEXT }}>None selected = visible to everyone who can open Power BI Analytics.</div>
                        <div className="flex flex-wrap gap-1.5">
                          {ROLES.map((r) => (
                            <label key={r} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-sm border" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                              <input type="checkbox" checked={allowedRoles.includes(r)} onChange={() => toggleRole(r)} /> {r}
                            </label>
                          ))}
                        </div>
                      </div>

                      {reportId ? (
                        <div>
                          <div className="text-[11px] font-semibold mb-1" style={{ color: PBI_TEXT }}>Shareable read-only link</div>
                          {shareUrl ? (
                            <div className="flex items-center gap-2">
                              <input readOnly value={shareUrl} className="flex-1 text-[11px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }} />
                              <button onClick={() => navigator.clipboard?.writeText(shareUrl)} className="p-1.5 rounded-sm border" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                                <Copy className="size-3.5" />
                              </button>
                              <button onClick={handleRevokeShare} className="text-[11px] px-2 py-1.5 rounded-sm border text-danger" style={{ borderColor: PBI_BORDER }}>
                                Revoke
                              </button>
                            </div>
                          ) : (
                            <button onClick={handleShare} disabled={shareReport.isPending}
                              className="text-[11px] px-3 py-1.5 rounded-sm border flex items-center gap-1.5" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                              {shareReport.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Share2 className="size-3.5" />} Create link
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px]" style={{ color: PBI_SUBTEXT }}>Save the report first to generate a share link.</div>
                      )}
                    </div>
                  )}
                </div>
              </PbiCard>
            </>
          )}
        </>
      )}
    </div>
  );
}
