import { useEffect, useRef, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Code2, Sparkles } from "lucide-react";
import {
  CodeBlock,
  HelpTip,
  Notice,
  ResultTable,
  SideRail,
  SignalButton,
  SplitLayout,
  quietButtonClass,
} from "@/components";
import { AnalyseTabs, getMethod, type MethodId } from "@/features/analysis";
import {
  askAssistant,
  assistantHistoryQuery,
  assistantSuggestionsQuery,
  type AssistantTurn,
} from "@/features/assistant";
import { hasPermission, useCurrentUser } from "@/features/auth";
import { SaveToDashboard } from "@/features/dashboards";
import { OpenJupyterButton } from "@/features/integrations";
import { MainLayout } from "@/layouts/MainLayout";
import { errorMessage } from "@/lib/api";

const smallQuiet = `${quietButtonClass} px-3 py-1.5 text-xs`;

/** A question that could not be sent or answered, shown in the conversation so it is not lost. */
interface FailedTurn {
  id: string;
  question: string;
  error: string;
}

export function AskPage() {
  const search = useSearch({ from: "/analyse/ask" });
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const mayAsk = hasPermission(user, "analyse");
  const suggested = useQuery({ ...assistantSuggestionsQuery(), enabled: mayAsk });
  const history = useQuery({ ...assistantHistoryQuery(), enabled: mayAsk });
  const [question, setQuestion] = useState(search.q ?? "");
  const [turns, setTurns] = useState<(AssistantTurn | FailedTurn)[]>([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const method = getMethod(search.method);
  // Suggestions come from the metrics and data this member may see, so every one of them can be answered.
  const suggestions = suggested.data ?? [];

  useEffect(() => {
    if (turns.length > 0 || busy)
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  async function submit(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (!trimmed || busy || !mayAsk) return;
    setBusy(true);
    setQuestion("");
    try {
      const turn = await askAssistant(trimmed);
      setTurns((current) => [...current, turn]);
      // An answer uses the monthly AI allowance and is written to the audit trail.
      void Promise.all(
        [["assistant", "history"], ["auth"], ["audit"]].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    } catch (error) {
      setTurns((current) => [
        ...current,
        {
          id: `failed-${Date.now()}`,
          question: trimmed,
          error: errorMessage(error, "The assistant could not be reached. Try again."),
        },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const earlier = (history.data ?? []).filter((item) => !turns.some((turn) => turn.id === item.id));

  return (
    <MainLayout
      title="Ask in plain English"
      description="The assistant answers with shared metric definitions and data you are allowed to see, and shows the SQL it ran. If it cannot ground a question, it says so."
      toolbar={<AnalyseTabs context={search} />}
    >
      {!mayAsk ? (
        <Notice tone="warn" title="Your role cannot ask the assistant">
          The assistant analyses data, which your role does not do. You can still read the audit
          trail and the lineage of every dataset.
        </Notice>
      ) : (
        <SplitLayout
          railSide="right"
          railWidth="19rem"
          rail={
            <AskAside
              suggestions={suggestions}
              earlier={earlier}
              quota={user.quotas.ai}
              method={method}
              search={search}
              onAsk={submit}
              onShow={(turn) => setTurns((current) => [...current, turn])}
            />
          }
        >
          <section className="panel flex min-h-[28rem] flex-col" aria-label="Conversation">
            <div className="flex-1 space-y-6 p-6" aria-live="polite">
              {turns.length === 0 && !busy ? (
                <div className="py-10 text-center">
                  <Sparkles className="mx-auto size-6 text-signal" strokeWidth={1.5} aria-hidden />
                  <p className="mt-3 font-display text-xl">What would you like to know?</p>
                  <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                    Ask about a shared metric or a dataset you can see.
                    {suggestions.length > 0 ? " Pick a suggestion to see how it works." : ""}
                  </p>
                  <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
                    {suggestions.slice(0, 4).map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={smallQuiet}
                        onClick={() => void submit(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {suggested.isSuccess && suggestions.length === 0 ? (
                    <p className="mx-auto mt-4 max-w-md text-sm text-warning">
                      There is no approved data for you to ask about yet. A dataset can be asked
                      about once it is cleaned and a steward approves it.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {turns.map((turn) => (
                <article key={turn.id} className="space-y-3">
                  <p className="ml-auto w-fit max-w-[80%] rounded-[14px] bg-surface-inverse px-4 py-2 text-sm text-background">
                    {turn.question}
                  </p>
                  {"error" in turn ? (
                    <Notice tone="signal" title="That question was not answered">
                      {turn.error}
                    </Notice>
                  ) : (
                    <Answer turn={turn} dataset={search.dataset} />
                  )}
                </article>
              ))}

              {busy ? (
                <p className="text-sm text-muted-foreground">
                  Finding the right metric, checking your permissions, then running it in your
                  sandbox…
                </p>
              ) : null}
              <div ref={endRef} />
            </div>

            {/* The question box stays at the bottom of the window while the conversation scrolls. */}
            <form
              className="sticky bottom-0 z-20 flex items-end gap-2 border-t border-border bg-surface-raised/95 p-4 backdrop-blur-sm"
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
                maxLength={2000}
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
                {busy ? "Asking…" : "Ask"}
              </SignalButton>
            </form>
          </section>
        </SplitLayout>
      )}
    </MainLayout>
  );
}

function Answer({ turn, dataset }: { turn: AssistantTurn; dataset: string | undefined }) {
  return (
    <div className="border border-border bg-background p-4">
      <p className={`text-sm font-medium ${turn.refused ? "text-destructive" : ""}`}>
        {turn.answer}
      </p>
      <p className="mt-2 max-w-[75ch] text-sm text-muted-foreground">{turn.explanation}</p>
      {turn.groundedIn.length > 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Grounded in {turn.groundedIn.join(" · ")}
        </p>
      ) : null}
      {turn.table && turn.table.rows.length > 0 ? (
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
            <Link
              to="/analyse/code"
              search={{ sql: turn.sql, dataset: turn.build?.dataset ?? dataset }}
              className={smallQuiet}
            >
              <Code2 className="size-3.5" strokeWidth={1.75} aria-hidden />
              Open as SQL
            </Link>
          ) : null}
          {turn.sql ? (
            <OpenJupyterButton
              sql={turn.sql}
              title={turn.question}
              className="px-3 py-1.5 text-xs"
            />
          ) : null}
          {turn.build ? (
            <SaveToDashboard
              title={turn.question}
              explanation={turn.answer}
              config={{
                datasetId: turn.build.dataset,
                method: turn.build.method,
                measure: turn.build.measure,
                ...(turn.build.dimension ? { dimension: turn.build.dimension } : {}),
              }}
              className="px-3 py-1.5 text-xs"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AskAside({
  suggestions,
  earlier,
  quota,
  method,
  search,
  onAsk,
  onShow,
}: {
  suggestions: string[];
  earlier: AssistantTurn[];
  quota: string;
  method: ReturnType<typeof getMethod>;
  search: { dataset?: string | undefined; method?: MethodId | undefined };
  onAsk: (question: string) => Promise<void>;
  onShow: (turn: AssistantTurn) => void;
}) {
  return (
    <SideRail label="Suggestions and how it works" className="panel">
      <div className="space-y-6 p-5">
        {suggestions.length > 0 ? (
          <div>
            <h2 className="font-sans text-sm font-medium">Try asking</h2>
            <ul className="mt-2 space-y-1.5">
              {suggestions.slice(0, 8).map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="w-full text-left text-sm text-signal-strong underline-offset-4 hover:underline"
                    onClick={() => void onAsk(item)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {earlier.length > 0 ? (
          <div className="border-t border-border pt-4 first:border-0 first:pt-0">
            <h2 className="font-sans text-sm font-medium">Your earlier questions</h2>
            <ul className="mt-2 space-y-1.5">
              {earlier.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full text-left text-sm underline-offset-4 hover:underline"
                    onClick={() => onShow(item)}
                  >
                    {item.question}
                    <span className="block text-xs text-muted-foreground">
                      {item.when}
                      {item.refused ? " · not answered" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="border-t border-border pt-4 first:border-0 first:pt-0">
          <h2 className="font-sans text-sm font-medium">How it answers</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
            <li>Finds the shared metrics and tables you may use.</li>
            <li>Turns your question into an analysis of those fields.</li>
            <li>Checks it against your role, then runs it in your sandbox.</li>
            <li>Explains the result and shows the SQL.</li>
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">
            Permissions come from your role, never from the question, so no question can reach data
            you may not see.
          </p>
          <p className="num mt-3 text-xs text-muted-foreground">This month: {quota}.</p>
        </div>
        {method && !method.modes.includes("ask") ? (
          <p className="border-t border-border pt-4 text-xs text-muted-foreground">
            {method.name}: {method.unavailable?.ask}{" "}
            {method.id === "predict" ? (
              <Link
                to="/analyse/predict"
                search={{ dataset: search.dataset }}
                className="text-signal-strong underline-offset-4 hover:underline"
              >
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
    </SideRail>
  );
}
