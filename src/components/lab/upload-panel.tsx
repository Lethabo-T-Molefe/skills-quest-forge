import { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { Panel } from "./panel";
import { uploadDataset, type Dataset } from "@/lib/api";

const UPLOAD_ACCEPTED = ".csv,.tsv,.json,.xlsx";

// Shared "bring your own data" widget — uploads through the same real
// dataset-upload pipeline (bronze schema) used everywhere else in the
// system, so whatever analysis surface embeds this immediately sees the
// new table (AI Analyst's live schema introspection, SQL Workspace via
// Superset, notebook cells).
export function UploadPanel({
  onUploaded, title = "Analyse a file", subtitle = "Upload CSV, TSV, JSON or Excel",
}: {
  onUploaded: (dataset: Dataset) => void;
  title?: string;
  subtitle?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Dataset | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const name = file.name.replace(/\.[^./]+$/, "");
      const dataset = await uploadDataset(file, name);
      setUploaded(dataset);
      onUploaded(dataset);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Panel title={title} subtitle={subtitle}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-sm px-4 py-2 rounded-md border border-border font-medium inline-flex items-center gap-2 disabled:opacity-40"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          {uploading ? "Uploading…" : "Upload file"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={UPLOAD_ACCEPTED}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {uploaded && !uploading && (
          <div className="text-xs text-success flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5" />
            Loaded as bronze.{uploaded.warehouse_table} ({uploaded.row_count} rows)
          </div>
        )}
        {error && <div className="text-xs text-danger">{error}</div>}
      </div>
    </Panel>
  );
}
