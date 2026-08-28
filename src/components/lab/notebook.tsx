import { useEffect, useRef, useState } from "react";
import {
  Play, Loader2, Plus, Trash2, CircleDot, Upload, Save, FilePlus, FolderOpen, Download, ChevronDown,
} from "lucide-react";
import { CodeEditor } from "./code-editor";
import { Badge } from "./panel";
import {
  startSession, executeCell, stopSession, uploadFileToSession, saveNotebook, getNotebook,
  type ExecutionOutput, type SavedCell,
} from "@/lib/api/notebooks";
import { useLanguages, useNotebookList, useInvalidateNotebookList } from "@/lib/queries/notebooks";
import { downloadIpynb } from "@/lib/ipynb";

type Cell = {
  id: string;
  code: string;
  outputs: ExecutionOutput[];
  status: "idle" | "running" | "ok" | "error";
  executionCount: number | null;
};

let nextCellId = 0;
function newCell(code = ""): Cell {
  nextCellId += 1;
  return { id: String(nextCellId), code, outputs: [], status: "idle", executionCount: null };
}

function cellsFromSaved(saved: SavedCell[]): Cell[] {
  if (saved.length === 0) return [newCell()];
  return saved.map((c) => {
    nextCellId += 1;
    return { id: String(nextCellId), code: c.code, outputs: c.outputs, status: c.status, executionCount: c.execution_count };
  });
}

// Extension-aware read snippet inserted after a notebook-native upload, so
// the new cell "just works" whichever language/kernel is currently active —
// mirrors how a real Jupyter user would open a file they just dropped in.
function readCodeFor(language: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (language === "r") {
    if (ext === "json") return `library(jsonlite)\n\ndf <- fromJSON("${filename}")\nhead(df)`;
    if (ext === "xlsx" || ext === "xls") return `library(readxl)\n\ndf <- read_excel("${filename}")\nhead(df)`;
    if (ext === "tsv") return `df <- read.csv("${filename}", sep = "\\t")\nhead(df)`;
    return `df <- read.csv("${filename}")\nhead(df)`;
  }
  if (ext === "json") return `import pandas as pd\n\ndf = pd.read_json("${filename}")\ndf.head()`;
  if (ext === "xlsx" || ext === "xls") return `import pandas as pd\n\ndf = pd.read_excel("${filename}")\ndf.head()`;
  if (ext === "tsv") return `import pandas as pd\n\ndf = pd.read_csv("${filename}", sep="\\t")\ndf.head()`;
  return `import pandas as pd\n\ndf = pd.read_csv("${filename}")\ndf.head()`;
}

function OutputBlock({ output }: { output: ExecutionOutput }) {
  if (output.type === "image" && output.image_base64) {
    return <img src={`data:image/png;base64,${output.image_base64}`} alt="cell output" className="max-w-full rounded-md border border-border" />;
  }
  if (output.type === "error") {
    return (
      <pre className="text-xs font-mono whitespace-pre-wrap text-danger bg-danger/10 border border-danger/30 rounded-md p-2">
        {output.text}
      </pre>
    );
  }
  return (
    <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">{output.text}</pre>
  );
}

// Real execution against a genuine Jupyter kernel — Python or R (see
// infrastructure/external/jupyter_code_executor.py on the backend) — never
// JupyterLab's own web UI, only this system-styled cell editor.
export function Notebook({ initialCode = "" }: { initialCode?: string }) {
  const [cells, setCells] = useState<Cell[]>([newCell(initialCode)]);
  const [language, setLanguage] = useState("python");
  const [notebookId, setNotebookId] = useState<number | null>(null);
  const [notebookName, setNotebookName] = useState("Untitled notebook");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [uploading, setUploading] = useState(false);

  const sessionRef = useRef<string | null>(null);
  const sessionStarting = useRef<Promise<string> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [kernelError, setKernelError] = useState<string | null>(null);

  const { data: languages } = useLanguages();
  const { data: notebookList } = useNotebookList();
  const invalidateList = useInvalidateNotebookList();

  useEffect(() => {
    return () => {
      if (sessionRef.current) stopSession(sessionRef.current);
    };
  }, []);

  async function killSession() {
    if (sessionRef.current) {
      const id = sessionRef.current;
      sessionRef.current = null;
      sessionStarting.current = null;
      await stopSession(id);
    }
  }

  async function ensureSession(): Promise<string> {
    if (sessionRef.current) return sessionRef.current;
    if (!sessionStarting.current) {
      sessionStarting.current = startSession(language);
    }
    const id = await sessionStarting.current;
    sessionRef.current = id;
    return id;
  }

  function updateCell(id: string, patch: Partial<Cell>) {
    setCells((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  async function runCell(cell: Cell) {
    updateCell(cell.id, { status: "running" });
    setKernelError(null);
    try {
      const sessionId = await ensureSession();
      const result = await executeCell(sessionId, cell.code);
      updateCell(cell.id, {
        status: result.status,
        outputs: result.outputs,
        executionCount: result.execution_count,
      });
    } catch (e) {
      sessionRef.current = null;
      sessionStarting.current = null;
      setKernelError(e instanceof Error ? e.message : "Couldn't reach the kernel");
      updateCell(cell.id, { status: "error" });
    }
  }

  function addCell(code = "") {
    setCells((cs) => [...cs, newCell(code)]);
  }

  function deleteCell(id: string) {
    setCells((cs) => (cs.length > 1 ? cs.filter((c) => c.id !== id) : cs));
  }

  async function handleLanguageChange(next: string) {
    if (next === language) return;
    await killSession();
    setLanguage(next);
  }

  async function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(file: File) {
    setUploading(true);
    setKernelError(null);
    try {
      const sessionId = await ensureSession();
      const filename = await uploadFileToSession(sessionId, file);
      addCell(readCodeFor(language, filename));
    } catch (e) {
      setKernelError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleNew() {
    killSession();
    nextCellId += 1;
    setCells([newCell()]);
    setLanguage("python");
    setNotebookId(null);
    setNotebookName("Untitled notebook");
    setSaveError(null);
    setOpenMenu(false);
  }

  async function handleOpen(id: number) {
    setOpenMenu(false);
    setSaveError(null);
    try {
      const notebook = await getNotebook(id);
      await killSession();
      setCells(cellsFromSaved(notebook.cells));
      setLanguage(notebook.language);
      setNotebookId(notebook.id);
      setNotebookName(notebook.name);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Couldn't open notebook");
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const savedCells: SavedCell[] = cells.map((c) => ({
        code: c.code, outputs: c.outputs, execution_count: c.executionCount, status: c.status,
      }));
      const saved = await saveNotebook({ id: notebookId, name: notebookName, language, cells: savedCells });
      setNotebookId(saved.id);
      invalidateList();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleDownload() {
    downloadIpynb(cells, language, notebookName);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={notebookName}
            onChange={(e) => setNotebookName(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-border bg-background font-medium min-w-[10rem]"
            aria-label="Notebook name"
          />
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-border bg-background font-medium capitalize"
            aria-label="Kernel language"
          >
            {(languages ?? [{ id: "python", kernel_name: "chieta-python" }]).map((l) => (
              <option key={l.id} value={l.id}>{l.id}</option>
            ))}
          </select>

          <button onClick={handleNew} className="text-xs px-2.5 py-1.5 rounded-md border border-border inline-flex items-center gap-1.5">
            <FilePlus className="size-3.5" /> New
          </button>

          <div className="relative">
            <button
              onClick={() => setOpenMenu((v) => !v)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-border inline-flex items-center gap-1.5"
            >
              <FolderOpen className="size-3.5" /> Open <ChevronDown className="size-3" />
            </button>
            {openMenu && (
              <div className="absolute z-10 mt-1 w-64 rounded-md border border-border bg-card shadow-lg max-h-64 overflow-y-auto">
                {(notebookList ?? []).length === 0 && (
                  <div className="text-xs text-muted-foreground p-3">No saved notebooks yet</div>
                )}
                {(notebookList ?? []).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleOpen(n.id)}
                    className="w-full text-left text-xs px-3 py-2 hover:bg-muted/50 flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{n.name}</span>
                    <span className="text-muted-foreground uppercase shrink-0">{n.language}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs px-2.5 py-1.5 rounded-md border border-border inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} Save
          </button>

          <button onClick={handleDownload} className="text-xs px-2.5 py-1.5 rounded-md border border-border inline-flex items-center gap-1.5">
            <Download className="size-3.5" /> Download
          </button>

          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="text-xs px-2.5 py-1.5 rounded-md border border-border inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />} Upload file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.json,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelected(f);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleDot className={`size-3 ${sessionRef.current ? "text-success" : "text-muted-foreground"}`} />
            {sessionRef.current ? "Kernel running" : "Kernel starts on first run"}
          </div>
          <button
            onClick={() => addCell()}
            className="text-xs px-3 py-1.5 rounded-md border border-border inline-flex items-center gap-1.5"
          >
            <Plus className="size-3.5" /> Add cell
          </button>
        </div>
      </div>

      {saveError && <div className="text-xs text-danger">{saveError}</div>}
      {kernelError && <div className="text-xs text-danger">{kernelError}</div>}

      {cells.map((cell, i) => (
        <div key={cell.id} className="rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              [{cell.executionCount ?? " "}]
              {cell.status === "ok" && <Badge tone="success">ok</Badge>}
              {cell.status === "error" && <Badge tone="danger">error</Badge>}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => runCell(cell)}
                disabled={cell.status === "running"}
                className="text-xs px-2.5 py-1 rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                {cell.status === "running" ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                Run
              </button>
              <button
                onClick={() => deleteCell(cell.id)}
                disabled={cells.length === 1}
                className="text-xs px-2 py-1 rounded-md border border-border disabled:opacity-30"
                aria-label={`Delete cell ${i + 1}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
          <div className="border-t border-border">
            <CodeEditor
              value={cell.code}
              onChange={(v) => updateCell(cell.id, { code: v })}
              language={language as "python" | "r"}
              height="auto"
            />
          </div>
          {cell.outputs.length > 0 && (
            <div className="border-t border-border p-2.5 flex flex-col gap-2 bg-background">
              {cell.outputs.map((o, oi) => <OutputBlock key={oi} output={o} />)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
