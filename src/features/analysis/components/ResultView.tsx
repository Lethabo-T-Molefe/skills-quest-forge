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
  className?: string | undefined;
}) {
  return (
    <section className={cn("panel", className)} aria-label="Result">
      <header className="border-b border-border px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-display text-xl leading-snug">{result.title}</h2>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {result.figures.length > 0 ? (
          <dl className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-x-6 gap-y-4">
            {result.figures.map((figure) => (
              <div key={figure.label} className="min-w-0">
                <dt className="text-xs text-muted-foreground">{figure.label}</dt>
                <dd className="num mt-0.5 font-display text-2xl leading-tight font-light break-words">
                  {figure.value}
                </dd>
                {figure.detail ? (
                  <dd className="mt-0.5 text-xs text-muted-foreground">{figure.detail}</dd>
                ) : null}
              </div>
            ))}
          </dl>
        ) : null}
        <p className="mt-4 max-w-[80ch] text-[15px] leading-relaxed">{result.reading}</p>
        {result.notes.length > 0 ? <Notes notes={result.notes} /> : null}
      </header>

      <TabsRoot defaultValue="chart">
        <div className="overflow-x-auto px-6 pt-4">
          <TabsList aria-label="Result views">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="sql">SQL</TabsTrigger>
            <TabsTrigger value="how">How it was worked out</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="chart" className="px-4 pt-4 pb-6">
          <div className="h-[320px] sm:h-[400px]">
            <AnalysisChart result={result} />
          </div>
        </TabsContent>
        <TabsContent value="table" className="px-6 pt-4 pb-6">
          {result.table.rows.length > 0 ? (
            <ResultTable columns={result.table.columns} rows={result.table.rows} />
          ) : (
            <p className="text-sm text-muted-foreground">No rows for these settings.</p>
          )}
        </TabsContent>
        <TabsContent value="sql" className="px-6 pt-4 pb-6">
          <CodeBlock code={result.sql} label="SQL for this result" />
          <p className="mt-2 text-xs text-muted-foreground">
            This is the query behind the chart, with the same method and options. Open it in SQL to
            change it.
          </p>
        </TabsContent>
        <TabsContent value="how" className="px-6 pt-4 pb-6">
          <p className="max-w-[80ch] text-sm">
            {result.method || "Nothing was calculated with these settings."}
          </p>
          <p className="mt-3 max-w-[80ch] text-xs text-muted-foreground">
            It ran on permitted, approved data only, inside your sandbox. Personal columns stay
            masked.
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
          {open
            ? "Show fewer notes"
            : `${hidden} more ${hidden === 1 ? "note" : "notes"} on this result`}
        </button>
      ) : null}
    </div>
  );
}
