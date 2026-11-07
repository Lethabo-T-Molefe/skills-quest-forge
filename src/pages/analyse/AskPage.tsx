import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Code2, Sparkles } from "lucide-react";
import {
  CodeBlock,
  HelpTip,
  Notice,
  ResultTable,
  SelectMenu,
  SideRail,
  SignalButton,
  SplitLayout,
  quietButtonClass,
} from "@/components";
import { AnalyseTabs, analysisCatalogueQuery, getMethod, type MethodId } from "@/features/analysis";
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
  const navigate = useNavigate({ from: "/analyse/ask" });
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const mayAsk = hasPermission(user, "analyse");
  // The datasets this member may analyse. The one chosen (in the address) is the only one the assistant
  // answers from; with none chosen it may use any of them.
  const catalogue = useQuery({ ...analysisCatalogueQuery(), enabled: mayAsk });
  const datasets = catalogue.data?.datasets ?? [];
  const datasetId = datasets.some((item) => item.id === search.dataset)
    ? search.dataset
    : undefined;
  const chosenNotReady = Boolean(search.dataset) && catalogue.isSuccess && !datasetId;
  const suggested = useQuery({ ...assistantSuggestionsQuery(datasetId), enabled: mayAsk });
  const history = useQuery({ ...assistantHistoryQuery(), enabled: mayAsk });
  const [question, setQuestion] = useState(search.q ?? "");
  const [turns, setTurns] = useState<(AssistantTurn | FailedTurn)[]>([]);
  // Turns before this index belong to an earlier topic, so a new question does not build on them.
  const [topicStart, setTopicStart] = useState(0);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const method = getMethod(search.method);
  // The answer a follow-up builds on: the latest one in this topic that was answered.
  const context = turns
    .slice(topicStart)
    .filter((turn): turn is AssistantTurn => !("error" in turn) && !turn.refused)
    .at(-1);
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
      const turn = await askAssistant(trimmed, context?.id, datasetId);
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
              suggestionsLoading={suggested.isPending}
              earlier={earlier}
              historyLoading={history.isPending}
              busy={busy}
              quota={user.quotas.ai}
              method={method}
              search={search}
              onAsk={submit}
              onShow={(turn) => setTurns((current) => [...current, turn])}
            />
          }
        >
          <section className="panel flex min-h-[28rem] flex-col" aria-label="Conversation">
            <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-3">
              <SelectMenu
                size="sm"
                label="Answering from"
                className="min-w-64"
                value={datasetId ?? "all"}
                options={[
                  { value: "all", label: "All the data you can analyse" },
                  ...datasets.map((item) => ({ value: item.id, label: item.name })),
                ]}
                onValueChange={(value) => {
                  // A different dataset is a new topic: follow-ups must not build on the old one.
                  setTopicStart(turns.length);
                  void navigate({
                    search: (previous) => ({
                      ...previous,
                      dataset: value === "all" ? undefined : value,
                    }),
                  });
                }}
              />
              <p className="text-xs text-muted-foreground">
                {datasetId
                  ? "Answers come from this dataset only."
                  : "Choose a dataset to keep answers to it."}
              </p>
            </div>
            {chosenNotReady ? (
              <Notice
                className="mx-6 mt-4"
                tone="warn"
                title="That dataset is not ready to analyse"
              >
                Open it from Datasets to see its next step, or choose one of yours above.
              </Notice>
            ) : null}
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
                    {suggested.isPending ? (
                      <p className="text-sm text-muted-foreground">Loading suggestions…</p>
                    ) : (
                      suggestions.slice(0, 4).map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={smallQuiet}
                          disabled={busy}
                          onClick={() => void submit(item)}
                        >
                          {item}
                        </button>
                      ))
                    )}
                  </div>
                  {suggested.isSuccess && suggestions.length === 0 ? (
                    <p className="mx-auto mt-4 max-w-md text-sm text-warning">
                      There is no data for you to ask about yet. Upload a dataset and you can ask
                      about it straight away; others can once it is cleaned and approved.
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
                    <Notice
                      tone="signal"
                      title="That question was not answered"
                      action={
                        <button
                          type="button"
                          className="text-sm font-medium text-signal-strong underline-offset-4 hover:underline disabled:opacity-50"
                          disabled={busy}
                          onClick={() => {
                            if (busy) return;
                            setTurns((current) => current.filter((item) => item.id !== turn.id));
                            void submit(turn.question);
                          }}
                        >
                          Try again
                        </button>
                      }
                    >
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
            {context ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-4 pt-3 text-xs text-muted-foreground">
                <span className="min-w-0 truncate">
                  Follow-ups build on <span className="text-foreground">{context.question}</span>
                </span>
                <button
                  type="button"
                  className="text-signal-strong underline-offset-4 hover:underline"
                  onClick={() => {
                    setTopicStart(turns.length);
                    inputRef.current?.focus();
                  }}
                >
                  Start a new topic
                </button>
              </div>
            ) : null}
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
                placeholder={
                  context
                    ? "Ask a follow-up, such as “what about last quarter?”"
                    : "Ask about a shared metric or a dataset you can see"
                }
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
      {turn.followsUp ? (
        <p className="mb-1.5 text-xs text-muted-foreground">Follow-up to your previous question</p>
      ) : null}
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
  suggestionsLoading,
  earlier,
  historyLoading,
  busy,
  quota,
  method,
  search,
  onAsk,
  onShow,
}: {
  suggestions: string[];
  suggestionsLoading: boolean;
  earlier: AssistantTurn[];
  historyLoading: boolean;
  busy: boolean;
  quota: string;
  method: ReturnType<typeof getMethod>;
  search: { dataset?: string | undefined; method?: MethodId | undefined };
  onAsk: (question: string) => Promise<void>;
  onShow: (turn: AssistantTurn) => void;
}) {
  return (
    <SideRail label="Suggestions and how it works" className="panel">
      <div className="space-y-6 p-5">
        {suggestionsLoading ? (
          <div>
            <h2 className="font-sans text-sm font-medium">Try asking</h2>
            <p className="mt-2 text-sm text-muted-foreground">Loading suggestions…</p>
          </div>
        ) : suggestions.length > 0 ? (
          <div>
            <h2 className="font-sans text-sm font-medium">Try asking</h2>
            <ul className="mt-2 space-y-1.5">
              {suggestions.slice(0, 8).map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="w-full text-left text-sm text-signal-strong underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50"
                    disabled={busy}
                    onClick={() => void onAsk(item)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {historyLoading ? (
          <div className="border-t border-border pt-4 first:border-0 first:pt-0">
            <h2 className="font-sans text-sm font-medium">Your earlier questions</h2>
            <p className="mt-2 text-sm text-muted-foreground">Loading history…</p>
          </div>
        ) : earlier.length > 0 ? (
          <div className="border-t border-border pt-4 first:border-0 first:pt-0">
            <h2 className="font-sans text-sm font-medium">Your earlier questions</h2>
            <ul className="mt-2 space-y-1.5">
              {earlier.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full text-left text-sm underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50"
                    disabled={busy}
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
