import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { CodeBlock, HelpTip, MediaFrame, Panel, quietButtonClass, ResultTable, SignalButton, signalButtonClass } from "@/components";
import { media } from "@/config/media";
import { askAssistant, type AssistantTurn } from "@/features/assistant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { assistantExamplesQuery } from "@/features/assistant";
import { MainLayout } from "@/layouts/MainLayout";

export function AssistantPage() {
  const examples = useSuspenseQuery(assistantExamplesQuery()).data;
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<AssistantTurn[]>([]);
  const [busy, setBusy] = useState(false);

  async function submit(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setQuestion("");
    const turn = await askAssistant(trimmed);
    setTurns((current) => [...current, turn]);
    setBusy(false);
  }

  return (
    <MainLayout
      label="plain English, grounded answers"
      title="Ask the assistant"
      intro="Type a request. The assistant plans, retrieves grounding from the catalogue and semantic layer, drafts SQL, validates it against your permissions, and runs it in a sandbox. You get the result, the code and an explanation. If it cannot ground the request, it says so."
    >
      <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
        <div className="space-y-4">
          {turns.length === 0 && !busy ? (
            <Panel className="overflow-hidden p-0">
              <MediaFrame {...media.hero} ratio="16 / 9" />
              <div className="p-6">
              <p className="label-paren">(try one of these)</p>
              <h2 className="heading-2 mt-1">The assistant only answers what it can ground</h2>
              <ul className="mt-4 space-y-3">
                {examples.map((example) => (
                  <li key={example.id}>
                    <button
                      type="button"
                      className="w-full border border-border bg-background px-4 py-3 text-left text-sm hover:bg-accent/50"
                      onClick={() => void submit(example.question)}
                    >
                      {example.question}
                    </button>
                  </li>
                ))}
              </ul>
              </div>
            </Panel>
          ) : null}

          {turns.map((turn) => (
            <article key={turn.id} className="panel p-6">
              <p className="text-sm font-medium">{turn.question}</p>
              <p className={`mt-4 text-sm ${turn.refused ? "text-destructive" : ""}`}>{turn.answer}</p>
              <p className="mt-3 max-w-[68ch] text-sm text-muted-foreground">{turn.explanation}</p>
              {turn.groundedIn && turn.groundedIn.length > 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">Grounded in {turn.groundedIn.join(" · ")}</p>
              ) : null}
              {turn.table ? (
                <div className="mt-5">
                  <ResultTable columns={turn.table.columns} rows={turn.table.rows} />
                </div>
              ) : null}
              {turn.sql ? (
                <div className="mt-5 space-y-3">
                  <CodeBlock code={turn.sql} />
                  <Link
                    to="/workbench"
                    search={{ sql: turn.sql }}
                    className={`${signalButtonClass} w-fit`}
                  >
                    Open as editable SQL
                  </Link>
                </div>
              ) : null}
            </article>
          ))}

          {busy ? (
            <Panel>
              <p className="label-paren">(working)</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Retrieving grounding, drafting SQL, validating permissions, then running inside a sandbox.
              </p>
            </Panel>
          ) : null}

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void submit(question);
            }}
          >
            <label className="sr-only" htmlFor="assistant-q">
              Ask a question
            </label>
            <input
              id="assistant-q"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about a defined metric or a dataset you can see"
              className="min-w-0 flex-1 rounded-[999px] border border-line-strong bg-surface-raised px-4 py-3 text-sm"
            />
            <SignalButton type="submit" disabled={busy}>
              <Sparkles className="size-4" strokeWidth={1.75} />
              Ask
            </SignalButton>
          </form>
        </div>

        <div className="space-y-6">
          <Panel>
            <h2 className="heading-2">How it decides</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Retrieve catalogue objects and metric definitions you may use.</li>
              <li>Draft SQL or notebook code for the request.</li>
              <li>Validate against your role and an allow-list of objects.</li>
              <li>Run inside an ephemeral sandbox, then return result, code and explanation.</li>
            </ol>
            <div className="mt-4">
              <HelpTip>
                Permissions come from your role, never from the prompt. A request cannot talk the assistant into
                reaching data you may not see.
              </HelpTip>
            </div>
          </Panel>
          <Panel>
            <h2 className="heading-2">Take it further</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Any answer can be opened as SQL. That is progressive disclosure: the everyday path and the expert path
              share the same artefact.
            </p>
            <Link to="/workbench" className={`${quietButtonClass} mt-4`}>
              Open the SQL workbench
            </Link>
          </Panel>
        </div>
      </div>
    </MainLayout>
  );
}
