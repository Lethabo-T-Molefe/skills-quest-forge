import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { CodeEditor } from "@/components/lab/code-editor";
import { UploadPanel } from "@/components/lab/upload-panel";
import { Loader2, Play, CheckSquare, Square, Lightbulb, ChevronDown, ChevronRight } from "lucide-react";
import { useStatTaxonomy, useDatasetsForAnalysis, useRunAnalysis } from "@/lib/queries/statistics";
import type { AnalysisSection } from "@/lib/api/statistics";
import type { Dataset } from "@/lib/api";

export const Route = createFileRoute("/app/statistics")({ component: Page });

// Real reasoning -> real code -> formula -> real computed output -> interpretation,
// in that fixed order, per method — matching the source prompt library's
// mandated sequence. Code runs for real against the chosen dataset through
// the same Jupyter kernel Notebooks uses; nothing here is fabricated.
//
// Charts are visual and read fine on their own, so they surface immediately
// under the plain-language summary; raw stdout/tables and error dumps read
// as "technical", so they're grouped with reasoning/code/formula behind the
// "Show technical details" toggle below.
function ChartOutputs({ outputs }: { outputs: AnalysisSection["outputs"] }) {
  const images = outputs.filter((o) => o.type === "image" && o.image_base64);
  if (images.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {images.map((o, i) => (
        <img
          key={i}
          src={`data:image/png;base64,${o.image_base64}`}
          alt="analysis chart"
          className="max-w-full rounded-md border border-border"
        />
      ))}
    </div>
  );
}

function TechnicalOutputs({ outputs }: { outputs: AnalysisSection["outputs"] }) {
  const textOutputs = outputs.filter((o) => o.type !== "image");
  if (textOutputs.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {textOutputs.map((o, i) =>
        o.type === "error" ? (
          <pre key={i} className="text-xs font-mono whitespace-pre-wrap text-danger bg-danger/10 border border-danger/30 rounded-md p-2">
            {o.text}
          </pre>
        ) : (
          <pre key={i} className="text-xs font-mono whitespace-pre-wrap text-foreground bg-muted/40 rounded-md p-2">
            {o.text}
          </pre>
        )
      )}
    </div>
  );
}

function ResultSection({ section }: { section: AnalysisSection }) {
  const [showDetails, setShowDetails] = useState(false);
  const plainSummary = section.summary || section.interpretation;

  return (
    <Panel
      title={section.method}
      action={<Badge tone={section.status === "ok" ? "success" : "danger"}>{section.status}</Badge>}
    >
      <div className="flex flex-col gap-4">
        {plainSummary && (
          <div className="rounded-lg border border-accent/40 bg-accent/10 p-3.5 flex gap-2.5">
            <Lightbulb className="size-4 text-accent shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{plainSummary}</p>
          </div>
        )}

        <ChartOutputs outputs={section.outputs} />

        <button
          onClick={() => setShowDetails((v) => !v)}
          className="self-start text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          {showDetails ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          {showDetails ? "Hide technical details" : "Show technical details"}
        </button>

        {showDetails && (
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Reasoning</div>
              <p className="text-sm">{section.reasoning}</p>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Python Code</div>
              <div className="rounded-lg border border-ink overflow-hidden">
                <CodeEditor value={section.code} language="python" readOnly height="auto" />
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Formula</div>
              <pre className="text-xs font-mono whitespace-pre-wrap bg-muted/40 rounded-md p-2">{section.formula}</pre>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Raw Output</div>
              <TechnicalOutputs outputs={section.outputs} />
            </div>

            {section.interpretation && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Statistical Interpretation</div>
                <p className="text-sm">{section.interpretation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}

// Renders "Heading\n------\n- item\n- item" plaintext (the shape
// _build_final_findings sends) as real headings + bullet lists instead of a
// raw monospace dump.
function FinalFindings({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: { heading: string; items: string[] }[] = [];
  let current: { heading: string; items: string[] } | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];
    if (line.trim() && next && /^-{5,}$/.test(next.trim())) {
      current = { heading: line.trim(), items: [] };
      blocks.push(current);
      i += 1;
      continue;
    }
    if (line.trim().startsWith("- ") && current) {
      current.items.push(line.trim().slice(2));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {blocks.map((b, i) => (
        <div key={i}>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{b.heading}</div>
          <ul className="flex flex-col gap-2">
            {b.items.map((item, j) => (
              <li key={j} className="text-sm leading-relaxed flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Page() {
  const { data: taxonomy = [], isLoading: taxonomyLoading } = useStatTaxonomy();
  const { data: datasets = [] } = useDatasetsForAnalysis();
  const runMutation = useRunAnalysis();

  const [table, setTable] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedMethods, setSelectedMethods] = useState<Set<string>>(new Set());

  const category = useMemo(() => taxonomy.find((c) => c.id === categoryId), [taxonomy, categoryId]);

  function selectCategory(id: string) {
    setCategoryId(id);
    const cat = taxonomy.find((c) => c.id === id);
    setSelectedMethods(new Set(cat?.methods ?? []));
  }

  function toggleMethod(method: string) {
    setSelectedMethods((prev) => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
  }

  function handleUploaded(dataset: Dataset) {
    setTable(dataset.warehouse_table);
  }

  function run() {
    if (!table || !categoryId || selectedMethods.size === 0) return;
    runMutation.mutate({ categoryId, table, methods: Array.from(selectedMethods) });
  }

  return (
    <>
      <PageHeader
        title="Statistical Analysis"
        subtitle="Descriptive, EDA, inferential, diagnostic, predictive, prescriptive, causal, time series, spatial, multivariate, Bayesian, and machine learning — real code, run for real against your data"
      />

      <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <UploadPanel
            onUploaded={handleUploaded}
            subtitle="Upload CSV, TSV, JSON or Excel"
          />

          <Panel title="1. Dataset" subtitle="Or pick an existing dataset">
            <select
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="w-full bg-muted border border-border rounded-md h-10 px-3 text-sm"
            >
              <option value="">Select a dataset…</option>
              {datasets.map((d) => (
                <option key={d.id} value={d.warehouse_table}>
                  {d.name} (bronze.{d.warehouse_table} — {d.row_count} rows)
                </option>
              ))}
            </select>
          </Panel>
        </div>

        <Panel title="2. Category" subtitle={taxonomyLoading ? "Loading taxonomy…" : undefined}>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {taxonomy.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCategory(c.id)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  categoryId === c.id ? "border-primary bg-primary/10" : "border-border hover:border-foreground/40"
                }`}
              >
                <div className="font-display font-bold text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.main_question}</div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      {category && (
        <Panel
          title="3. Methods"
          subtitle={`${selectedMethods.size} of ${category.methods.length} selected`}
          action={
            <button
              onClick={() =>
                setSelectedMethods(
                  selectedMethods.size === category.methods.length ? new Set() : new Set(category.methods)
                )
              }
              className="text-xs px-2.5 py-1 rounded-md border border-border inline-flex items-center gap-1.5"
            >
              {selectedMethods.size === category.methods.length ? <Square className="size-3.5" /> : <CheckSquare className="size-3.5" />}
              {selectedMethods.size === category.methods.length ? "Clear all" : "Select all"}
            </button>
          }
        >
          <div className="flex flex-wrap gap-2">
            {category.methods.map((m) => (
              <button
                key={m}
                onClick={() => toggleMethod(m)}
                className={`text-xs px-2.5 py-1.5 rounded-full border ${
                  selectedMethods.has(m)
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </Panel>
      )}

      <div>
        <button
          onClick={run}
          disabled={!table || !categoryId || selectedMethods.size === 0 || runMutation.isPending}
          className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 disabled:opacity-40"
        >
          {runMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          {runMutation.isPending ? "Running analysis… this can take a while for many methods" : "Run Analysis"}
        </button>
      </div>

      {runMutation.isError && (
        <Panel title="Analysis failed">
          <div className="text-sm text-danger">{(runMutation.error as Error).message}</div>
        </Panel>
      )}

      {runMutation.data && (
        <div className="flex flex-col gap-4">
          {runMutation.data.overview && <ResultSection section={runMutation.data.overview} />}

          {runMutation.data.sections.map((s, i) => (
            <ResultSection key={i} section={s} />
          ))}

          {runMutation.data.consolidated_script && (
            <Panel
              title="Consolidated Python Script"
              subtitle="Reproduces this entire analysis end-to-end, standalone — the setup, overview, and every method above, in the order they actually ran"
            >
              <div className="rounded-lg border border-ink overflow-hidden">
                <CodeEditor
                  value={runMutation.data.consolidated_script}
                  language="python"
                  readOnly
                  height="400px"
                />
              </div>
            </Panel>
          )}

          {runMutation.data.final_findings && (
            <Panel title="Final Findings" subtitle="A plain-language recap of everything found above">
              <FinalFindings text={runMutation.data.final_findings} />
            </Panel>
          )}
        </div>
      )}
    </>
  );
}
