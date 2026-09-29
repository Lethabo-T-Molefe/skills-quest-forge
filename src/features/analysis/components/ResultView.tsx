import { useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { CodeBlock, ResultTable, TabsContent, TabsList, TabsRoot, TabsTrigger } from "@/components";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "../types";
import { AnalysisChart } from "./AnalysisChart";

/**
 * The answer first (figures and a plain reading), then the evidence one tab away:
 * chart, table, the SQL behind it, and how it was worked out.
 */
export function ResultView({
  result,
  actions,
  className,
}: {
  result: AnalysisResult;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel flex h-full min-h-0 flex-col overflow-y-auto", className)} aria-label="Result">
      <header className="border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-display text-lg leading-snug">{result.title}</h2>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {result.figures.length > 0 ? (
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            {result.figures.map((figure) => (
              <div key={figure.label} className="min-w-0">
                <dt className="truncate text-xs text-muted-foreground">{figure.label}</dt>
                <dd className="num truncate font-display text-xl font-light" title={figure.value}>
                  {figure.value}
                </dd>
                {figure.detail ? <dd className="truncate text-xs text-muted-foreground">{figure.detail}</dd> : null}
              </div>
            ))}
          </dl>
        ) : null}
        <p className="mt-3 max-w-[90ch] text-sm">{result.reading}</p>
        {result.notes.length > 0 ? <Notes notes={result.notes} /> : null}
      </header>

      {/* Keeps room for the chart; on a very short window the whole panel scrolls instead. */}
      <TabsRoot defaultValue="chart" className="flex min-h-[320px] flex-1 flex-col">
        <div className="px-5 pt-3">
          <TabsList aria-label="Result views">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="sql">SQL</TabsTrigger>
            <TabsTrigger value="how">How it was worked out</TabsTrigger>
          </TabsList>
        </div>
        {/* The chart keeps a readable minimum height; when the panel is shorter, this area scrolls instead of clipping. */}
        <TabsContent value="chart" className="min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-4">
          <div className="h-full min-h-[260px]">
            <AnalysisChart result={result} />
          </div>
        </TabsContent>
        <TabsContent value="table" className="min-h-0 flex-1 overflow-auto px-5 pt-3 pb-4">
          {result.table.rows.length > 0 ? (
            <ResultTable columns={result.table.columns} rows={result.table.rows} />
          ) : (
            <p className="text-sm text-muted-foreground">No rows for these settings.</p>
          )}
        </TabsContent>
        <TabsContent value="sql" className="min-h-0 flex-1 overflow-auto px-5 pt-3 pb-4">
          <CodeBlock code={result.sql} label="SQL for this result" />
          <p className="mt-2 text-xs text-muted-foreground">
            This is the query behind the chart, with the same method and options. Open it in SQL to change it.
          </p>
        </TabsContent>
        <TabsContent value="how" className="min-h-0 flex-1 overflow-auto px-5 pt-3 pb-4">
          <p className="max-w-[80ch] text-sm">{result.method || "Nothing was calculated with these settings."}</p>
          <p className="mt-3 max-w-[80ch] text-xs text-muted-foreground">
            It ran on permitted, approved data only, inside your sandbox. Personal columns stay masked.
          </p>
        </TabsContent>
      </TabsRoot>
    </section>
  );
}

/** Caveats for this result. The first is always shown; the rest are one click away to keep the chart in view. */
function Notes({ notes }: { notes: string[] }) {
  const [open, setOpen] = useState(false);
  const shown = open ? notes : notes.slice(0, 1);
  const hidden = notes.length - 1;
  return (
    <div className="mt-2">
      <ul className="space-y-1">
        {shown.map((note) => (
          <li key={note} className="flex gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-px size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            {note}
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="mt-1 ml-5 text-xs text-signal-strong underline-offset-4 hover:underline"
        >
          {open ? "Show fewer notes" : `${hidden} more ${hidden === 1 ? "note" : "notes"} on this result`}
        </button>
      ) : null}
    </div>
  );
}
