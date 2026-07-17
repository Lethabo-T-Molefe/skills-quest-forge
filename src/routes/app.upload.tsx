import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { CheckCircle2, UploadCloud, FileSpreadsheet, Loader2 } from "lucide-react";
import { useState } from "react";
import { uploadDataset, type Dataset } from "@/lib/api";

export const Route = createFileRoute("/app/upload")({ component: Page });

const steps = ["File Upload", "Metadata", "Profiling Preview"];
const ACCEPTED = ".csv,.tsv,.json,.xlsx";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function Page() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataset, setDataset] = useState<Dataset | null>(null);

  async function handleContinueFromUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const name = file.name.replace(/\.[^./]+$/, "");
      const result = await uploadDataset(file, name);
      setDataset(result);
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <PageHeader title="Upload Dataset" subtitle="Submit a new dataset for steward approval" />

      <Panel title={`Step ${step + 1} of 3 — ${steps[step]}`}>
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`size-7 rounded-full grid place-items-center text-xs font-bold border ${i <= step ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground"}`}>{i + 1}</div>
              <div className={`flex-1 text-xs ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</div>
              {i < steps.length - 1 && <div className="h-px bg-border flex-1" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) { setFile(dropped); setError(null); }
            }}
            className={`border-2 border-dashed rounded-xl p-12 text-center bg-muted/30 transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <UploadCloud className="size-10 mx-auto text-muted-foreground" />
            <div className="mt-3 font-display font-semibold">Drop your CSV, JSON or Excel file here</div>
            <div className="text-xs text-muted-foreground mt-1">CSV, TSV, JSON or XLSX · loaded into the warehouse (bronze schema)</div>
            <label className="mt-5 inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer">
              Browse files
              <input
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setError(null); } }}
              />
            </label>
            {file && (
              <div className="mt-6 text-xs text-success flex items-center justify-center gap-1.5">
                <CheckCircle2 className="size-3.5" /> {file.name} · {formatBytes(file.size)}
              </div>
            )}
            {error && <div className="mt-3 text-xs text-danger">{error}</div>}
          </div>
        )}

        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Dataset name</span><input className="bg-muted border border-border rounded-md h-9 px-3 text-sm" defaultValue={dataset?.name} readOnly /></label>
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Source unit</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>Grants</option><option>ETQA</option><option>Learner Records</option><option>Skills Centres</option><option>Labour Market</option></select></label>
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Classification</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>INTERNAL–Confidential</option><option>RESTRICTED–Personal</option><option>INTERNAL–General</option></select></label>
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Contains personal IDs?</span><select className="bg-muted border border-border rounded-md h-9 px-3 text-sm"><option>No</option><option>Yes</option></select></label>
            <label className="md:col-span-2 flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Sensitive fields</span><input className="bg-muted border border-border rounded-md h-9 px-3 text-sm" placeholder="id_number, full_name" /></label>
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Requested by</span><input disabled value="T. Mokoena" className="bg-muted/60 border border-border rounded-md h-9 px-3 text-sm" /></label>
            <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider">Owner approval</span><input className="bg-muted border border-border rounded-md h-9 px-3 text-sm" placeholder="Approver name" /></label>
          </div>
        )}

        {step === 2 && dataset && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-4 gap-3">
              {[
                ["Rows", dataset.row_count.toLocaleString()],
                ["Columns", String(dataset.column_count)],
                ["Size", formatBytes(dataset.size_bytes)],
                ["Warehouse table", `bronze.${dataset.warehouse_table}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border p-3 bg-muted/30">
                  <div className="text-xs text-muted-foreground">{k}</div><div className="text-xl font-display font-bold truncate" title={v}>{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="font-medium text-sm mb-2">Columns (inferred from the uploaded file)</div>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-muted"><tr><th className="text-left p-2 font-medium">column</th><th className="text-left p-2 font-medium">type</th></tr></thead>
                  <tbody>{dataset.columns.map(c => (<tr key={c.name} className="border-t border-border"><td className="p-2">{c.name}</td><td className="p-2 text-accent">{c.data_type}</td></tr>))}</tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="font-medium text-sm mb-2">Governance checklist</div>
              <div className="text-xs text-muted-foreground mb-2">Classification and PII review below are not yet enforced automatically — pending steward sign-off.</div>
              <ul className="text-xs flex flex-col gap-1.5">
                {["Schema loaded into bronze", "Row/column counts captured", "Awaiting PII review", "Awaiting steward approval"].map((r) => (
                  <li key={r} className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-success" /> {r} <Badge tone="success">Done</Badge></li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
          <button disabled={step===0} onClick={() => setStep(s => Math.max(0, s-1))} className="text-sm px-3 py-2 rounded-md border border-border disabled:opacity-40">Back</button>
          {step === 0 ? (
            <button
              onClick={handleContinueFromUpload}
              disabled={!file || uploading}
              className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 disabled:opacity-40"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}
              {uploading ? "Uploading…" : "Continue"}
            </button>
          ) : (
            <button onClick={() => setStep(s => Math.min(2, s+1))} className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-2">
              <FileSpreadsheet className="size-4" /> {step === 2 ? "Submit for Steward Approval" : "Continue"}
            </button>
          )}
        </div>
      </Panel>
    </>
  );
}
