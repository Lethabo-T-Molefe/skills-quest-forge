import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { Play } from "lucide-react";
import {
  CodeBlock,
  Notice,
  ResultTable,
  ScrollPane,
  SelectMenu,
  SignalButton,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@/components";
import {
  AnalyseTabs,
  analysisDatasets,
  analysisMethods,
  defaultConfig,
  getAnalysisDataset,
  runAnalysis,
  type BuildMethodId,
} from "@/features/analysis";
import { canWriteCode, isReadOnly, useCurrentUser } from "@/features/auth";
import { rememberQueryResult, runSql, starterSql, useNotebooks, type QueryResult } from "@/features/workbench";
import { MainLayout } from "@/layouts/MainLayout";

const templateMethods = analysisMethods.filter((method) => method.modes.includes("code"));

/** The SQL for a method's default settings on a dataset, remembered so running it returns the matching rows. */
function templateSql(datasetId: string, method: BuildMethodId) {
  const result = runAnalysis(defaultConfig(datasetId, method));
  rememberQueryResult(result.sql, { columns: result.table.columns, rows: result.table.rows, explanation: result.reading });
  return result.sql;
}

export function CodePage() {
  const search = useSearch({ from: "/analyse/code" });
  const user = useCurrentUser();
  const notebooks = useNotebooks();
  const datasetId = getAnalysisDataset(search.dataset)?.id ?? analysisDatasets[0]!.id;
  const startMethod = search.method && search.method !== "predict" ? search.method : undefined;

  const [template, setTemplate] = useState<string>(search.sql ? "own" : (startMethod ?? "own"));
  const [sql, setSql] = useState(() => search.sql ?? (startMethod ? templateSql(datasetId, startMethod) : starterSql));
  const [result, setResult] = useState<QueryResult | null>(null);
  const [busy, setBusy] = useState(false);
  const readOnly = isReadOnly(user);

  async function run() {
    if (readOnly || !sql.trim()) return;
    setBusy(true);
    setResult(await runSql(sql));
    setBusy(false);
  }

  return (
    <MainLayout
      title="Write SQL"
      description="Run SQL against permitted data only, under a read-only identity, inside your sandbox. Start from a method template or bring your own query."
      toolbar={<AnalyseTabs context={search} />}
      fill
    >
      <TabsRoot defaultValue="sql" className="flex flex-col gap-3 lg:h-full">
        <TabsList aria-label="Code tools" className="self-start">
          <TabsTrigger value="sql">SQL workbench</TabsTrigger>
          <TabsTrigger value="notebooks">Notebooks</TabsTrigger>
        </TabsList>

        <TabsContent value="sql" className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-2">
          <section className="panel flex min-h-[360px] flex-col lg:min-h-0" aria-label="Query">
            <div className="flex flex-wrap items-end gap-3 border-b border-border p-3">
              <SelectMenu
                size="sm"
                label="Start from"
                className="min-w-56 flex-1"
                value={template}
                onValueChange={(next) => {
                  setTemplate(next);
                  setResult(null);
                  if (next !== "own") setSql(templateSql(datasetId, next as BuildMethodId));
                }}
                options={[
                  { value: "own", label: "My own query" },
                  ...templateMethods.map((method) => ({ value: method.id, label: `Template: ${method.name}` })),
                ]}
              />
              <SignalButton onClick={() => void run()} disabled={busy || readOnly}>
                <Play className="size-4" strokeWidth={1.75} aria-hidden />
                {busy ? "Running…" : "Run in sandbox"}
              </SignalButton>
            </div>
            <label htmlFor="sql-editor" className="sr-only">
              SQL
            </label>
            <textarea
              id="sql-editor"
              className="min-h-64 flex-1 resize-none bg-surface-raised p-4 font-mono text-[13px] leading-relaxed focus-visible:outline-none"
              value={sql}
              spellCheck={false}
              onChange={(event) => {
                setSql(event.target.value);
                if (template !== "own") setTemplate("own");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  void run();
                }
              }}
            />
            <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
              {readOnly
                ? "Your role can read queries but not run them."
                : canWriteCode(user)
                  ? "Ctrl + Enter runs the query. Write statements are blocked."
                  : "You can run and adjust queries. Write statements and masked personal columns stay blocked."}
            </p>
          </section>

          <section className="panel flex min-h-[260px] flex-col lg:min-h-0" aria-label="Result">
            <h2 className="font-sans border-b border-border px-4 py-3 text-sm font-medium">Result</h2>
            <ScrollPane className="min-h-0 flex-1" orientation="vertical">
              <div className="p-4">
                {result ? (
                  result.refused ? (
                    <Notice tone="signal" title="The sandbox refused this query">
                      {result.explanation}
                    </Notice>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm">{result.explanation}</p>
                      <ResultTable columns={result.columns} rows={result.rows} />
                    </div>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Run the query to see its result here. It runs under a least-privilege identity: only your
                    permitted, approved tables are mounted, and personal columns stay masked.
                  </p>
                )}
              </div>
            </ScrollPane>
          </section>
        </TabsContent>

        <TabsContent value="notebooks" className="lg:min-h-0 lg:flex-1">
          <ScrollPane className="h-full" orientation="vertical">
            <div className="space-y-3 pr-3">
              {notebooks.map((notebook) => (
                <div key={notebook.id} className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {notebook.name} · {notebook.owner} · updated {notebook.updated}
                  </p>
                  {notebook.cells.map((cell) => (
                    <div key={cell.id} className="panel p-4">
                      {cell.kind === "markdown" ? (
                        <p className="max-w-[75ch] text-sm">{cell.source}</p>
                      ) : (
                        <div className="space-y-3">
                          <CodeBlock code={cell.source} label="Notebook SQL" />
                          {cell.output ? <ResultTable columns={cell.output.columns} rows={cell.output.rows} /> : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollPane>
        </TabsContent>
      </TabsRoot>
    </MainLayout>
  );
}
