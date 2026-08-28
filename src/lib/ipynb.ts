import type { ExecutionOutput } from "@/lib/api/notebooks";

type Cell = {
  code: string;
  outputs: ExecutionOutput[];
  executionCount: number | null;
};

const KERNELSPECS: Record<string, { name: string; display_name: string; language: string }> = {
  python: { name: "chieta-python", display_name: "CHIETA Python", language: "python" },
  r: { name: "chieta-r", display_name: "CHIETA R", language: "R" },
};

// Splits on newlines but keeps them attached to each line (except the
// last), matching nbformat's own convention for multi-line "source"/"text"
// arrays — real Jupyter (and any tool reading a real .ipynb) expects this
// exact shape.
function toSourceLines(text: string): string[] {
  const lines = text.split("\n");
  return lines.map((line, i) => (i < lines.length - 1 ? `${line}\n` : line));
}

function outputToNbformat(output: ExecutionOutput, executionCount: number | null) {
  if (output.type === "image" && output.image_base64) {
    return {
      output_type: "display_data",
      data: { "image/png": output.image_base64 },
      metadata: {},
    };
  }
  if (output.type === "error") {
    const lines = (output.text ?? "").split("\n");
    return {
      output_type: "error",
      ename: "Error",
      evalue: lines[0] ?? "",
      traceback: lines,
    };
  }
  if (output.type === "result") {
    return {
      output_type: "execute_result",
      execution_count: executionCount,
      data: { "text/plain": toSourceLines(output.text ?? "") },
      metadata: {},
    };
  }
  return {
    output_type: "stream",
    name: "stdout",
    text: toSourceLines(output.text ?? ""),
  };
}

// Builds a real nbformat-4 notebook document (the same JSON structure
// Jupyter itself reads and writes) from this app's own cell/output shapes —
// downloadable and reopenable in any real Jupyter installation.
export function buildIpynb(cells: Cell[], language: string): object {
  const kernelspec = KERNELSPECS[language] ?? KERNELSPECS.python;
  return {
    cells: cells.map((cell) => ({
      cell_type: "code",
      execution_count: cell.executionCount,
      metadata: {},
      outputs: cell.outputs.map((o) => outputToNbformat(o, cell.executionCount)),
      source: toSourceLines(cell.code),
    })),
    metadata: {
      kernelspec,
      language_info: { name: kernelspec.language.toLowerCase() },
    },
    nbformat: 4,
    nbformat_minor: 5,
  };
}

export function downloadIpynb(cells: Cell[], language: string, filename: string): void {
  const notebook = buildIpynb(cells, language);
  const blob = new Blob([JSON.stringify(notebook, null, 1)], { type: "application/x-ipynb+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ipynb") ? filename : `${filename}.ipynb`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
