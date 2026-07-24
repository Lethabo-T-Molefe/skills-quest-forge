import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { CodeEditor } from "@/components/lab/code-editor";
import { VBar, Donut } from "@/components/lab/charts";
import { Sparkles, Play, Loader2, History as HistoryIcon } from "lucide-react";
import { useAskQuestion, useAiAnalystHistory } from "@/lib/queries/ai-analyst";
import { runSql } from "@/lib/api/analytics";
import type { AskResult } from "@/lib/api/ai-analyst";

export const Route = createFileRoute("/app/ai-analyst")({ component: Page });

const EXAMPLE_QUESTIONS = [
  "Total allocated by province",
  "Top 5 grants by spent",
  "Which learners records are missing assessment scores",
  "Highlight outlier grants by spent",
  "How many providers are accredited",
  "Average utilisation_pct by province for skills centres",
  "Enrolment trend by month",
];

function ChartPanel({
  chart, columns, rows,
}: {
  chart: AskResult["chart"];
  columns: string[];
  rows: unknown[][];
}) {
  if (chart.type === "table" || !chart.x || chart.keys.length === 0) return null;
  const xi = columns.indexOf(chart.x);
  const keyIndices = chart.keys.map((k) => columns.indexOf(k));
  if (xi === -1 || keyIndices.some((i) => i === -1)) return null;

  const data = rows.slice(0, 25).map((row) => {
    const point: Record<string, string | number> = { [chart.x as string]: String(row[xi]) };
    chart.keys.forEach((k, idx) => { point[k] = Number(row[keyIndices[idx]]) || 0; });
    return point;
  });

  if (chart.type === "donut") {
    return <Donut data={data.map((d) => ({ name: String(d[chart.x as string]), value: Number(d[chart.keys[0]]) }))} />;
  }
  return <VBar data={data} x={chart.x} keys={chart.keys} />;
}

function ResultsTable({ columns, rows }: { columns: string[]; rows: unknown[][] }) {
  if (columns.length === 0) {
    return <div className="text-sm text-muted-foreground py-8 text-center">No rows.</div>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs font-mono">
        <thead className="bg-muted">
          <tr>{columns.map((c) => <th key={c} className="text-left p-2 font-semibold">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => (
            <tr key={i} className="border-t border-border odd:bg-muted/30">
              {row.map((cell, j) => (
                <td key={j} className="p-2">{cell === null || cell === undefined ? "—" : String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Page() {
  const [question, setQuestion] = useState("");
  const [sql, setSql] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const askMutation = useAskQuestion();
  const runMutation = useMutation({ mutationFn: runSql });
  const { data: history = [] } = useAiAnalystHistory();

  const askResult = askMutation.data;
  // Prefer the latest manual "Run" result (if the SQL was edited and re-run);
  // otherwise show what the question itself returned.
  const displayed = runMutation.data ?? (askResult && { columns: askResult.columns, rows: askResult.rows });

  function handleAsk(q: string) {
    if (!q.trim()) return;
    setQuestion(q);
    runMutation.reset();
    askMutation.mutate(q, {
      onSuccess: (result) => setSql(result.sql),
    });
  }

  function loadHistoryItem(item: { question: string; sql: string }) {
    setQuestion(item.question);
    setSql(item.sql);
    runMutation.reset();
    askMutation.reset();
  }

  return (
    <>
      <PageHeader
        title="AI Analyst"
        subtitle="Ask a question in plain English — see the generated SQL, run it, chart it"
        actions={
          <button
            onClick={() => setShowHistory((s) => !s)}
            className="text-sm px-3 py-2 rounded-md border border-border inline-flex items-center gap-2"
          >
            <HistoryIcon className="size-4" /> History
          </button>
        }
      />

      <Panel title="Ask your data">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAsk(question); }}
              placeholder="e.g. Total allocated by province"
              className="flex-1 bg-muted border border-border rounded-md h-10 px-3 text-sm"
            />
            <button
              onClick={() => handleAsk(question)}
              disabled={!question.trim() || askMutation.isPending}
              className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 disabled:opacity-40"
            >
              {askMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {askMutation.isPending ? "Thinking…" : "Ask"}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            Rule-based question matcher today, not a general-purpose LLM — for open-ended
            Python analysis, use <a href="/app/notebooks" className="underline">Notebooks</a>.
          </div>
        </div>
      </Panel>

      {askMutation.isError && (
        <Panel title="Couldn't answer that">
          <div className="text-sm text-danger">{(askMutation.error as Error).message}</div>
        </Panel>
      )}

      {askResult && (
        <>
          {askResult.confidence === "low" && (
            <div className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm">
              I wasn't fully sure what you meant — here's my best guess. Feel free to edit the SQL below.
            </div>
          )}

          <Panel
            title="Generated SQL"
            subtitle={askResult.explanation}
            action={<Badge tone={askResult.confidence === "high" ? "success" : "warn"}>{askResult.confidence} confidence</Badge>}
          >
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-ink overflow-hidden">
                <CodeEditor value={sql} onChange={setSql} language="sql" height="140px" />
              </div>
              <button
                onClick={() => runMutation.mutate(sql)}
                disabled={runMutation.isPending}
                className="self-start text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 disabled:opacity-40"
              >
                {runMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                {runMutation.isPending ? "Running…" : "Run"}
              </button>
              {runMutation.isError && (
                <div className="text-xs text-danger">{(runMutation.error as Error).message}</div>
              )}
            </div>
          </Panel>

          {displayed && displayed.columns.length > 0 && askResult.chart.type !== "table" && (
            <Panel title="Chart">
              <ChartPanel chart={askResult.chart} columns={displayed.columns} rows={displayed.rows} />
            </Panel>
          )}

          <Panel title="Results" subtitle={displayed ? `${displayed.rows.length} rows` : undefined}>
            <ResultsTable columns={displayed?.columns ?? []} rows={displayed?.rows ?? []} />
          </Panel>
        </>
      )}

      {showHistory && (
        <Panel title="Recent questions" subtitle={`${history.length} shown`}>
          {history.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">Nothing asked yet.</div>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {history.map((item) => (
                <li key={item.id} className="py-2">
                  <button
                    onClick={() => loadHistoryItem(item)}
                    className="text-left w-full hover:text-primary"
                  >
                    <div className="text-sm">{item.question}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">{item.sql}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </>
  );
}
