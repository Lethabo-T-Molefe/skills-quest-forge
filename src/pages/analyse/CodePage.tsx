import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play } from "lucide-react";
import {
  HelpTip,
  Notice,
  SelectMenu,
  SignalButton,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@/components";
import {
  AnalyseTabs,
  analysisCatalogueQuery,
  analysisMethods,
  defaultConfig,
  runAnalysis,
  type BuildMethodId,
} from "@/features/analysis";
import { canRunSql, canWriteCode, useCurrentUser } from "@/features/auth";
import { SaveToDashboard } from "@/features/dashboards";
import { OpenJupyterButton } from "@/features/integrations";
import {
  NotebookPanel,
  QueryResultView,
  TableBrowser,
  runSql,
  sqlTablesQuery,
  starterQuery,
} from "@/features/workbench";
import { MainLayout } from "@/layouts/MainLayout";
import { errorMessage } from "@/lib/api";
import { notifyError } from "@/lib/notify";

const OWN = "own";
const templateMethods = analysisMethods.filter((method) => method.modes.includes("code"));

export function CodePage() {
  const search = useSearch({ from: "/analyse/code" });
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const mayRun = canRunSql(user);
  const catalogue = useQuery({ ...analysisCatalogueQuery(), enabled: mayRun });
  const tables = useQuery({ ...sqlTablesQuery(), enabled: mayRun });
  const dataset =
    catalogue.data?.datasets.find((item) => item.id === search.dataset) ??
    catalogue.data?.datasets[0];
  const startMethod = search.method && search.method !== "predict" ? search.method : undefined;

  const [template, setTemplate] = useState<string>(search.sql ? OWN : (startMethod ?? OWN));
  const [sql, setSql] = useState(search.sql ?? "");
  const [touched, setTouched] = useState(Boolean(search.sql));

  // A method template is the SQL behind that method's default chart for the chosen dataset.
  const templateSql = useMutation({
    mutationFn: async (method: BuildMethodId) => {
      if (!dataset) throw new Error("No approved dataset is available for a template.");
      return (await runAnalysis(defaultConfig(dataset, method))).sql;
    },
    onSuccess: (text) => setSql(text),
    onError: notifyError("The template could not be made."),
  });
  const loadTemplate = templateSql.mutate;

  // Start with something runnable: the method's template, or a first look at a permitted table.
  useEffect(() => {
    if (touched) return;
    if (startMethod && dataset) {
      setTouched(true);
      loadTemplate(startMethod);
    } else if (!startMethod && tables.data?.[0]) {
      setTouched(true);
      setSql(starterQuery(tables.data[0]));
    }
  }, [touched, startMethod, dataset, tables.data, loadTemplate]);

  const run = useMutation({
    mutationFn: () => runSql(sql),
    onSuccess: () =>
      Promise.all(
        [["auth"], ["audit"]].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
  const result = run.data;
  const canRunNow = mayRun && user.verified && sql.trim().length > 0 && !run.isPending;

  return (
    <MainLayout
      title="Write SQL"
      description="Run SQL against permitted data only, under a read-only identity, inside your sandbox. Start from a method template or bring your own query."
      toolbar={<AnalyseTabs context={search} />}
    >
      <TabsRoot
        defaultValue={search.notebook ? "notebooks" : "sql"}
        className="flex flex-col gap-5"
      >
        <TabsList aria-label="Code tools" className="self-start">
          <TabsTrigger value="sql">SQL workbench</TabsTrigger>
          <TabsTrigger value="notebooks">Notebooks</TabsTrigger>
        </TabsList>

        <TabsContent value="sql">
          {!mayRun ? (
            <Notice tone="warn" title="Your role cannot run SQL">
              Ask a question in plain English or open a dashboard instead. Queries that others have
              saved in notebooks can still be read under Notebooks.
            </Notice>
          ) : (
            <div className="grid items-start gap-6 xl:grid-cols-2">
              <section className="panel flex flex-col" aria-label="Query">
                <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
                  <SelectMenu
                    size="sm"
                    label="Start from"
                    className="min-w-56 flex-1"
                    value={template}
                    onValueChange={(next) => {
                      setTemplate(next);
                      setTouched(true);
                      run.reset();
                      if (next !== OWN) loadTemplate(next as BuildMethodId);
                    }}
                    options={[
                      { value: OWN, label: "My own query" },
                      ...templateMethods.map((method) => ({
                        value: method.id,
                        label: `Template: ${method.name}`,
                        disabled: !dataset,
                      })),
                    ]}
                  />
                  <SignalButton onClick={() => run.mutate()} disabled={!canRunNow}>
                    <Play className="size-4" strokeWidth={1.75} aria-hidden />
                    {run.isPending ? "Running…" : "Run in sandbox"}
                  </SignalButton>
                </div>
                <label htmlFor="sql-editor" className="sr-only">
                  SQL
                </label>
                <textarea
                  id="sql-editor"
                  className="min-h-[22rem] resize-y bg-surface-raised p-5 font-mono text-[13px] leading-relaxed focus-visible:outline-none"
                  value={templateSql.isPending ? "-- Writing the template…" : sql}
                  readOnly={templateSql.isPending}
                  spellCheck={false}
                  placeholder="SELECT …"
                  onChange={(event) => {
                    setSql(event.target.value);
                    setTouched(true);
                    if (template !== OWN) setTemplate(OWN);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      if (canRunNow) run.mutate();
                    }
                  }}
                />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    {!user.verified
                      ? "Verify your email to run queries."
                      : canWriteCode(user)
                        ? "Ctrl + Enter runs the query. Only SELECT is allowed."
                        : "Ctrl + Enter runs the query. Only SELECT is allowed, and masked personal columns stay blocked."}
                  </p>
                  <OpenJupyterButton
                    sql={sql}
                    title={dataset ? `Query on ${dataset.name}` : "Query from DataForge"}
                    className="px-3 py-1.5 text-xs"
                  />
                </div>
                <div className="border-t border-border p-4">
                  <HelpTip title="Tables you can query">
                    <div className="mt-3">
                      <TableBrowser
                        onPick={(text) => {
                          setSql(text);
                          setTemplate(OWN);
                          setTouched(true);
                          run.reset();
                        }}
                      />
                    </div>
                  </HelpTip>
                </div>
              </section>

              <section className="panel" aria-label="Result" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                  <h2 className="font-sans text-[15px] font-medium">Result</h2>
                  {result && !result.refused && result.rows.length > 0 ? (
                    <SaveToDashboard title="Query result" sql={result.sql} />
                  ) : null}
                </div>
                <div className="p-5">
                  {run.isPending ? (
                    <p className="text-sm text-muted-foreground">
                      Checking the query against your permissions, then running it…
                    </p>
                  ) : run.isError ? (
                    <Notice tone="signal" title="The query did not run">
                      {errorMessage(run.error)}
                    </Notice>
                  ) : result ? (
                    <QueryResultView result={result} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Run the query to see its result here. It runs under a least-privilege
                      identity: only your permitted, approved tables can be read, and personal
                      columns stay masked.
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notebooks">
          <NotebookPanel initialId={search.notebook} />
        </TabsContent>
      </TabsRoot>
    </MainLayout>
  );
}
