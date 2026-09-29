import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BarChart3, Code2, LayoutDashboard, Sparkles } from "lucide-react";
import { CodeBlock, HelpTip, ResultTable, ScrollPane, SignalButton, quietButtonClass } from "@/components";
import { AnalyseTabs, getMethod } from "@/features/analysis";
import { askAssistant, assistantExamplesQuery, type AssistantTurn } from "@/features/assistant";
import { rememberQueryResult } from "@/features/workbench";
import { MainLayout } from "@/layouts/MainLayout";

const smallQuiet = `${quietButtonClass} px-3 py-1.5 text-xs`;

export function AskPage() {
  const search = useSearch({ from: "/analyse/ask" });
  const navigate = useNavigate();
  const examples = useSuspenseQuery(assistantExamplesQuery()).data;
  const [question, setQuestion] = useState(search.q ?? "");
  const [turns, setTurns] = useState<AssistantTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const method = getMethod(search.method);
  const suggestions = [...(method && method.modes.includes("ask") ? method.examples : []), ...examples.map((item) => item.question)].filter(
    (item, index, all) => all.indexOf(item) === index,
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  async function submit(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setQuestion("");
    const turn = await askAssistant(trimmed);
    if (turn.sql && turn.table) {
      rememberQueryResult(turn.sql, { columns: turn.table.columns, rows: turn.table.rows, explanation: turn.explanation });
    }
    setTurns((current) => [...current, turn]);
    setBusy(false);
    inputRef.current?.focus();
  }

  return (
    <MainLayout
      title="Ask in plain English"
      description="The assistant answers with shared metric definitions and data you are allowed to see, and shows the SQL it ran. If it cannot ground a question, it says so."
      toolbar={<AnalyseTabs context={search} />}
      fill
    >
      <div className="grid gap-4 lg:h-full lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="panel flex min-h-[420px] flex-col lg:min-h-0" aria-label="Conversation">
          <ScrollPane className="min-h-0 flex-1" orientation="vertical">
            <div className="space-y-4 p-5" aria-live="polite">
              {turns.length === 0 && !busy ? (
                <div className="py-6 text-center">
                  <Sparkles className="mx-auto size-6 text-signal" strokeWidth={1.5} aria-hidden />
                  <p className="mt-3 font-display text-xl">What would you like to know?</p>
                  <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                    Ask about a shared metric, such as completion rate, active learners or the average fee. Pick a
                    suggestion to see how it works.
                  </p>
                  <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
                    {suggestions.slice(0, 4).map((item) => (
                      <button key={item} type="button" className={smallQuiet} onClick={() => void submit(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {turns.map((turn) => (
                <article key={turn.id} className="space-y-3">
                  <p className="ml-auto w-fit max-w-[80%] rounded-[14px] bg-surface-inverse px-4 py-2 text-sm text-background">
                    {turn.question}
                  </p>
                  <div className="border border-border bg-background p-4">
                    <p className={`text-sm font-medium ${turn.refused ? "text-destructive" : ""}`}>{turn.answer}</p>
                    <p className="mt-2 max-w-[75ch] text-sm text-muted-foreground">{turn.explanation}</p>
                    {turn.groundedIn && turn.groundedIn.length > 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">Grounded in {turn.groundedIn.join(" · ")}</p>
                    ) : null}
                    {turn.table ? (
                      <div className="mt-3">
                        <ResultTable columns={turn.table.columns} rows={turn.table.rows} />
                      </div>
                    ) : null}
                    {turn.sql ? (
                      <div className="mt-3">
                        <HelpTip title="Show the SQL it ran">
                          <CodeBlock code={turn.sql} />
                        </HelpTip>
                      </div>
                    ) : null}
                    {!turn.refused ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {turn.build ? (
                          <Link
                            to="/analyse/build"
                            search={{
                              dataset: turn.build.dataset,
                              method: turn.build.method,
                              measure: turn.build.measure,
                              dimension: turn.build.dimension,
                            }}
                            className={smallQuiet}
                          >
                            <BarChart3 className="size-3.5" strokeWidth={1.75} aria-hidden />
                            Build this as a chart
                          </Link>
                        ) : null}
                        {turn.sql ? (
                          <Link to="/analyse/code" search={{ sql: turn.sql, dataset: search.dataset }} className={smallQuiet}>
                            <Code2 className="size-3.5" strokeWidth={1.75} aria-hidden />
                            Open as SQL
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          className={smallQuiet}
                          onClick={() =>
                            toast.success("Answer saved to My scratch board", {
                              action: {
                                label: "Open",
                                onClick: () => void navigate({ to: "/dashboards/$dashboardId", params: { dashboardId: "my-scratch" } }),
                              },
                            })
                          }
                        >
                          <LayoutDashboard className="size-3.5" strokeWidth={1.75} aria-hidden />
                          Save to a dashboard
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}

              {busy ? (
                <p className="text-sm text-muted-foreground">
                  Finding the right metric, drafting SQL, checking your permissions, then running it in your sandbox…
                </p>
              ) : null}
              <div ref={endRef} />
            </div>
          </ScrollPane>

          <form
            className="flex items-end gap-2 border-t border-border p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void submit(question);
            }}
          >
            <label htmlFor="assistant-question" className="sr-only">
              Your question
            </label>
            <textarea
              id="assistant-question"
              ref={inputRef}
              rows={1}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit(question);
                }
              }}
              placeholder="Ask about a shared metric or a dataset you can see"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-[22px] border border-line-strong bg-surface-raised px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
            />
            <SignalButton type="submit" disabled={busy || !question.trim()}>
              <Sparkles className="size-4" strokeWidth={1.75} aria-hidden />
              Ask
            </SignalButton>
          </form>
        </section>

        <aside className="panel flex min-h-0 flex-col" aria-label="Suggestions and how it works">
          <ScrollPane className="min-h-0 flex-1" orientation="vertical">
            <div className="space-y-5 p-4">
              <div>
                <h2 className="font-sans text-sm font-medium">Try asking</h2>
                <ul className="mt-2 space-y-1.5">
                  {suggestions.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        className="w-full text-left text-sm text-signal-strong underline-offset-4 hover:underline"
                        onClick={() => void submit(item)}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-border pt-4">
                <h2 className="font-sans text-sm font-medium">How it answers</h2>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
                  <li>Finds the shared metrics and tables you may use.</li>
                  <li>Drafts the SQL for your question.</li>
                  <li>Checks the SQL against your role.</li>
                  <li>Runs it in your sandbox and explains the result.</li>
                </ol>
                <p className="mt-3 text-xs text-muted-foreground">
                  Permissions come from your role, never from the question, so no question can reach data you may not see.
                </p>
              </div>
              {method && !method.modes.includes("ask") ? (
                <p className="border-t border-border pt-4 text-xs text-muted-foreground">
                  {method.name}: {method.unavailable?.ask}{" "}
                  {method.id === "predict" ? (
                    <Link to="/analyse/predict" search={{ dataset: search.dataset }} className="text-signal-strong underline-offset-4 hover:underline">
                      Open Predict
                    </Link>
                  ) : (
                    <Link
                      to="/analyse/build"
                      search={{ dataset: search.dataset, method: search.method }}
                      className="text-signal-strong underline-offset-4 hover:underline"
                    >
                      Build it instead
                    </Link>
                  )}
                  .
                </p>
              ) : null}
            </div>
          </ScrollPane>
        </aside>
      </div>
    </MainLayout>
  );
}
