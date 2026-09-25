import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { CodeBlock, HelpTip, Panel, QuietButton, ResultTable, SignalButton, TextArea } from "@/components";
import { canWriteCode, isReadOnly, useCurrentUser } from "@/features/auth";
import { runSql, starterSql, useNotebooks, type QueryResult } from "@/features/workbench";
import { MainLayout } from "@/layouts/MainLayout";

export function WorkbenchPage() {
  const user = useCurrentUser();
  const search = useSearch({ from: "/workbench" });
  const notebooks = useNotebooks();
  const [tab, setTab] = useState<"sql" | "notebooks">("sql");
  const [sql, setSql] = useState(search.sql ?? starterSql);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [busy, setBusy] = useState(false);
  const notebook = notebooks[0];

  async function run() {
    if (isReadOnly(user)) return;
    setBusy(true);
    const next = await runSql(sql);
    setResult(next);
    setBusy(false);
  }

  return (
    <MainLayout
      label="progressive disclosure"
      title="SQL workbench and notebooks"
      intro="Experts run SQL and notebooks against permitted data only, under a least-privilege identity, inside the sandbox. Any no-code action can be opened here as editable code."
    >
      <div className="flex flex-wrap gap-2">
        <QuietButton active={tab === "sql"} onClick={() => setTab("sql")}>
          SQL workbench
        </QuietButton>
        <QuietButton active={tab === "notebooks"} onClick={() => setTab("notebooks")}>
          Notebooks
        </QuietButton>
      </div>

      {tab === "sql" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[7fr_5fr]">
          <div>
            <TextArea
              className="min-h-64"
              value={sql}
              onChange={(event) => setSql(event.target.value)}
              spellCheck={false}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <SignalButton onClick={() => void run()} disabled={busy || isReadOnly(user)}>
                {busy ? "Running in sandbox…" : "Run in sandbox"}
              </SignalButton>
              {!canWriteCode(user) ? (
                <p className="self-center text-xs text-muted-foreground">
                  Everyday analysts can run generated SQL. Write statements stay blocked.
                </p>
              ) : null}
            </div>
            {result ? (
              <div className="mt-6 space-y-4">
                {result.refused ? (
                  <Panel>
                    <p className="text-sm text-destructive">{result.explanation}</p>
                  </Panel>
                ) : (
                  <>
                    <ResultTable columns={result.columns} rows={result.rows} />
                    <p className="text-sm text-muted-foreground">{result.explanation}</p>
                  </>
                )}
              </div>
            ) : null}
          </div>
          <Panel>
            <h2 className="heading-2">Sandbox rules</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>One ephemeral sandbox per session, with CPU, memory and time caps.</li>
              <li>Only your permitted objects are mounted.</li>
              <li>Network egress is controlled. The host and other workspaces are unreachable.</li>
              <li>Idle sandboxes are reclaimed.</li>
            </ul>
            <div className="mt-4">
              <HelpTip>
                Generated code from the assistant lands here unchanged. An expert can add a join or change a grouping
                without redoing the everyday member's work.
              </HelpTip>
            </div>
          </Panel>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            {notebook?.name} · {notebook?.owner} · updated {notebook?.updated}
          </p>
          {notebook?.cells.map((cell) => (
            <Panel key={cell.id}>
              {cell.kind === "markdown" ? (
                <p className="max-w-[68ch] text-sm">{cell.source}</p>
              ) : (
                <div className="space-y-4">
                  <CodeBlock code={cell.source} label="Notebook SQL" />
                  {cell.output ? <ResultTable columns={cell.output.columns} rows={cell.output.rows} /> : null}
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
