import { useEffect, useRef, useState } from "react";
import { Play, Loader2, Plus, Trash2, CircleDot } from "lucide-react";
import { CodeEditor } from "./code-editor";
import { Badge } from "./panel";
import { UploadPanel } from "./upload-panel";
import { startSession, executeCell, stopSession, type ExecutionOutput } from "@/lib/api/notebooks";
import type { Dataset } from "@/lib/api";

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

// Real Python execution against a genuine Jupyter kernel (see
// infrastructure/external/jupyter_code_executor.py on the backend) — never
// JupyterLab's own web UI, only this system-styled cell editor.
export function Notebook({ initialCode = "" }: { initialCode?: string }) {
  const [cells, setCells] = useState<Cell[]>([newCell(initialCode)]);
  const sessionRef = useRef<string | null>(null);
  const sessionStarting = useRef<Promise<string> | null>(null);
  const [kernelError, setKernelError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sessionRef.current) stopSession(sessionRef.current);
    };
  }, []);

  async function ensureSession(): Promise<string> {
    if (sessionRef.current) return sessionRef.current;
    if (!sessionStarting.current) {
      sessionStarting.current = startSession();
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
      setKernelError(e instanceof Error ? e.message : "Couldn't reach the Python kernel");
      updateCell(cell.id, { status: "error" });
    }
  }

  function addCell(code = "") {
    setCells((cs) => [...cs, newCell(code)]);
  }

  function deleteCell(id: string) {
    setCells((cs) => (cs.length > 1 ? cs.filter((c) => c.id !== id) : cs));
  }

  function handleUploaded(dataset: Dataset) {
    addCell(
      `import os\nimport pandas as pd\n\n` +
      `df = pd.read_sql("SELECT * FROM bronze.${dataset.warehouse_table} LIMIT 1000", os.environ["CHIETA_WAREHOUSE_URL"])\n` +
      `df.head()`
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <UploadPanel
        onUploaded={handleUploaded}
        subtitle="Upload CSV, TSV, JSON or Excel — a cell that loads it into a DataFrame is added below"
      />

      <div className="flex items-center justify-between">
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
              language="python"
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
