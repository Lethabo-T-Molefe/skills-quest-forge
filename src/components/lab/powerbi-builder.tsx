import { useMemo, useRef, useState } from "react";
import { Plus, Trash2, Loader2, FolderOpen, Save, UploadCloud } from "lucide-react";
import { PbiCard, PbiKpiCard } from "./powerbi-card";
import { AreaTrend, VBar, Donut } from "./charts";
import {
  PBI_COLORS, PBI_FONT, PBI_TEXT, PBI_SUBTEXT, PBI_BORDER, PBI_CANVAS_BG,
} from "@/lib/powerbi-theme";
import { useDatasetsForAnalysis } from "@/lib/queries/statistics";
import { useUploadDataset } from "@/lib/queries/datasets";
import {
  usePowerBiReports, useCreatePowerBiReport, useDeletePowerBiReport, usePowerBiDatasetQuery,
} from "@/lib/queries/powerbi";
import type { PowerBiAgg, PowerBiVisual, PowerBiVisualType } from "@/lib/api/powerbi";

const UPLOAD_ACCEPTED = ".csv,.tsv,.json,.xlsx";

// The Report Builder — pick any of your own uploaded datasets (Dataset
// Catalogue / Upload Dataset), drop fields into a visual, choose a visual
// type, save. Every visual queries the warehouse live via
// GET /powerbi/datasets/:id/query — no separate copy of the data — the way
// a real Power BI report queries its dataset. Same PBI visual chrome as the
// Skills Analytics preview (powerbi-report.tsx), via the shared PbiCard.

const VISUAL_TYPES: { value: PowerBiVisualType; label: string; needsGroupBy: boolean; needsColumns: boolean }[] = [
  { value: "kpi", label: "Card (single number)", needsGroupBy: false, needsColumns: false },
  { value: "bar", label: "Bar chart", needsGroupBy: true, needsColumns: false },
  { value: "line", label: "Line chart", needsGroupBy: true, needsColumns: false },
  { value: "donut", label: "Donut chart", needsGroupBy: true, needsColumns: false },
  { value: "table", label: "Table", needsGroupBy: false, needsColumns: true },
];
const AGGS: PowerBiAgg[] = ["sum", "avg", "count", "min", "max"];

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

function VisualPreview({ datasetId, visual, onRemove }: {
  datasetId: number; visual: PowerBiVisual; onRemove?: () => void;
}) {
  const columns = visual.type === "table" ? visual.columns : visual.value_column ? [visual.value_column] : [];
  const { data, isLoading, isError, error } = usePowerBiDatasetQuery(
    datasetId,
    { columns, groupBy: visual.group_by, agg: visual.type === "table" ? null : visual.agg, limit: 100 },
    columns.length > 0,
  );

  const action = onRemove ? (
    <button onClick={onRemove} className="p-1 rounded-md" style={{ color: PBI_SUBTEXT }}>
      <Trash2 className="size-3.5" />
    </button>
  ) : undefined;

  const body = useMemo(() => {
    if (!data) return null;
    if (visual.type === "table") return <PbiTable columns={data.columns} rows={data.rows} />;
    if (visual.type === "kpi") return <PbiKpiCard label={visual.title} value={fmt(data.rows[0]?.[0])} />;
    const chartRows = data.rows.map((r) => ({ category: String(r[0]), [visual.title]: Number(r[1]) || 0 }));
    if (visual.type === "bar") return <VBar data={chartRows} x="category" keys={[visual.title]} colors={[PBI_COLORS[0]]} />;
    if (visual.type === "line") {
      const trendRows = data.rows.map((r) => ({ month: String(r[0]), [visual.title]: Number(r[1]) || 0 }));
      return <AreaTrend data={trendRows} keys={[visual.title]} colors={[PBI_COLORS[0]]} />;
    }
    if (visual.type === "donut") {
      return <Donut data={data.rows.map((r) => ({ name: String(r[0]), value: Number(r[1]) || 0 }))} colors={PBI_COLORS} />;
    }
    return null;
  }, [data, visual]);

  if (visual.type === "kpi") {
    return isLoading ? (
      <div className="py-6 flex justify-center"><Loader2 className="size-5 animate-spin" style={{ color: PBI_SUBTEXT }} /></div>
    ) : isError ? (
      <div className="text-xs text-danger p-2">{(error as Error).message}</div>
    ) : body;
  }

  return (
    <PbiCard title={visual.title} subtitle={visual.type} action={action}>
      {isLoading ? (
        <div className="py-8 flex justify-center"><Loader2 className="size-5 animate-spin" style={{ color: PBI_SUBTEXT }} /></div>
      ) : isError ? (
        <div className="text-xs text-danger p-2">{(error as Error).message}</div>
      ) : body}
    </PbiCard>
  );
}

export function PowerBiBuilder() {
  const { data: datasets = [] } = useDatasetsForAnalysis();
  const { data: reports = [] } = usePowerBiReports();
  const createReport = useCreatePowerBiReport();
  const deleteReport = useDeletePowerBiReport();
  const uploadDataset = useUploadDataset();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [datasetId, setDatasetId] = useState<number | null>(null);
  const [visuals, setVisuals] = useState<PowerBiVisual[]>([]);
  const [reportName, setReportName] = useState("");

  async function handleUpload(file: File) {
    setUploadError(null);
    try {
      const name = file.name.replace(/\.[^./]+$/, "");
      const dataset = await uploadDataset.mutateAsync({ file, name });
      setDatasetId(dataset.id);
      setVisuals([]);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const [newType, setNewType] = useState<PowerBiVisualType>("bar");
  const [newTitle, setNewTitle] = useState("");
  const [newGroupBy, setNewGroupBy] = useState("");
  const [newValueColumn, setNewValueColumn] = useState("");
  const [newAgg, setNewAgg] = useState<PowerBiAgg>("sum");
  const [newColumns, setNewColumns] = useState<Set<string>>(new Set());

  const dataset = datasets.find((d) => d.id === datasetId);
  const columns = dataset?.columns ?? [];
  const typeMeta = VISUAL_TYPES.find((t) => t.value === newType)!;

  function addVisual() {
    if (!newTitle.trim()) return;
    const visual: PowerBiVisual = {
      type: newType,
      title: newTitle.trim(),
      value_column: typeMeta.needsColumns ? null : (newValueColumn || null),
      agg: typeMeta.needsColumns ? null : newAgg,
      group_by: typeMeta.needsGroupBy ? (newGroupBy || null) : null,
      columns: typeMeta.needsColumns ? [...newColumns] : [],
    };
    setVisuals((prev) => [...prev, visual]);
    setNewTitle("");
    setNewGroupBy("");
    setNewValueColumn("");
    setNewColumns(new Set());
  }

  function openReport(reportId: number) {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;
    setDatasetId(report.dataset_id);
    setVisuals(report.visuals);
    setReportName(report.name);
  }

  function save() {
    if (!datasetId || !reportName.trim() || visuals.length === 0) return;
    createReport.mutate({ name: reportName.trim(), dataset_id: datasetId, visuals });
  }

  const kpis = visuals.filter((v) => v.type === "kpi");
  const others = visuals.filter((v) => v.type !== "kpi");

  return (
    <div className="rounded-[2px] p-3 flex flex-col gap-3" style={{ background: PBI_CANVAS_BG, fontFamily: PBI_FONT }}>
      <div className="grid md:grid-cols-[1fr_260px] gap-3">
        <PbiCard title="Dataset" subtitle="Any of your own uploads, or the demo one">
          <div className="flex flex-col gap-2">
            <select
              value={datasetId ?? ""}
              onChange={(e) => { setDatasetId(e.target.value ? Number(e.target.value) : null); setVisuals([]); }}
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
                {uploadDataset.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="size-3.5" />
                )}
                {uploadDataset.isPending ? "Uploading…" : "Upload a dataset"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={UPLOAD_ACCEPTED}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
              />
            </div>
            {uploadError && <div className="text-[11px] text-danger">{uploadError}</div>}
          </div>
        </PbiCard>

        <PbiCard title="My Reports" subtitle={`${reports.length} saved`}>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {reports.length === 0 && <div className="text-[11px]" style={{ color: PBI_SUBTEXT }}>None yet</div>}
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-1">
                <button
                  onClick={() => openReport(r.id)}
                  className="flex-1 text-left text-[12px] px-2 py-1 rounded-sm hover:bg-black/5 truncate flex items-center gap-1.5"
                  style={{ color: PBI_TEXT }}
                >
                  <FolderOpen className="size-3.5 shrink-0" /> {r.name}
                </button>
                <button onClick={() => deleteReport.mutate(r.id)} className="p-1" style={{ color: PBI_SUBTEXT }}>
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </PbiCard>
      </div>

      {dataset && (
        <>
          <PbiCard title="Add a Visual" subtitle="Pick fields, add it to the canvas below">
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

              {typeMeta.needsGroupBy && (
                <label className="flex flex-col gap-1 text-[11px]" style={{ color: PBI_SUBTEXT }}>
                  Group by
                  <select value={newGroupBy} onChange={(e) => setNewGroupBy(e.target.value)}
                    className="text-[12px] px-2 py-1.5 rounded-sm border bg-white" style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}>
                    <option value="">Column…</option>
                    {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </label>
              )}

              {!typeMeta.needsColumns && (
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

              {typeMeta.needsColumns && (
                <div className="flex flex-col gap-1 text-[11px] md:col-span-2" style={{ color: PBI_SUBTEXT }}>
                  Columns
                  <div className="flex flex-wrap gap-2 border rounded-sm p-1.5" style={{ borderColor: PBI_BORDER }}>
                    {columns.map((c) => (
                      <label key={c.name} className="flex items-center gap-1 text-[11px]" style={{ color: PBI_TEXT }}>
                        <input
                          type="checkbox"
                          checked={newColumns.has(c.name)}
                          onChange={() => setNewColumns((prev) => {
                            const next = new Set(prev);
                            if (next.has(c.name)) next.delete(c.name); else next.add(c.name);
                            return next;
                          })}
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={addVisual}
                className="px-3 py-1.5 text-[12px] font-semibold rounded-sm flex items-center gap-1.5 justify-center"
                style={{ background: PBI_COLORS[0], color: "#fff" }}
              >
                <Plus className="size-3.5" /> Add
              </button>
            </div>
          </PbiCard>

          {kpis.length > 0 && (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              {kpis.map((v, i) => <VisualPreview key={i} datasetId={dataset.id} visual={v}
                onRemove={() => setVisuals((prev) => prev.filter((x) => x !== v))} />)}
            </div>
          )}
          {others.length > 0 && (
            <div className="grid md:grid-cols-2 gap-3">
              {others.map((v, i) => <VisualPreview key={i} datasetId={dataset.id} visual={v}
                onRemove={() => setVisuals((prev) => prev.filter((x) => x !== v))} />)}
            </div>
          )}

          {visuals.length > 0 && (
            <PbiCard title="Save this report" subtitle="Reopen it any time from My Reports">
              <div className="flex gap-2">
                <input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Report name"
                  className="flex-1 text-[12px] px-2 py-1.5 rounded-sm border bg-white"
                  style={{ borderColor: PBI_BORDER, color: PBI_TEXT }}
                />
                <button
                  onClick={save}
                  disabled={!reportName.trim() || createReport.isPending}
                  className="px-3 py-1.5 text-[12px] font-semibold rounded-sm flex items-center gap-1.5"
                  style={{ background: PBI_COLORS[0], color: "#fff" }}
                >
                  {createReport.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  Save
                </button>
              </div>
            </PbiCard>
          )}
        </>
      )}
    </div>
  );
}
