import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Chip, HelpTip, QuietButton, ScrollPane, SelectMenu, SignalButton } from "@/components";
import { AnalyseTabs } from "@/features/analysis";
import { usePrediction } from "@/features/monitors";
import { MainLayout } from "@/layouts/MainLayout";

const outcomes = [
  "Likelihood to complete within 60 days",
  "Likelihood to enrol in a second course",
  "Likelihood of a late payment",
];
const subjects = ["Learner cohort · March intake", "Learner cohort · February intake", "Course · SQL basics"];

export function PredictPage() {
  const search = useSearch({ from: "/analyse/predict" });
  const prediction = usePrediction();
  const [outcome, setOutcome] = useState(prediction.outcome);
  const [subject, setSubject] = useState(prediction.subject);
  const [scored, setScored] = useState({ outcome: prediction.outcome, subject: prediction.subject });
  const stale = scored.outcome !== outcome || scored.subject !== subject;

  return (
    <MainLayout
      title="Predict an outcome"
      description="Choose an outcome and a cohort. You get a score from 0 to 100 and the ranked factors behind it, in plain language."
      toolbar={<AnalyseTabs context={{ ...search, method: "predict" }} />}
      fill
    >
      <div className="grid gap-4 lg:h-full lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        <section className="panel flex flex-col p-5" aria-label="What to predict">
          <h2 className="font-display text-xl">What should we predict?</h2>
          <div className="mt-4 space-y-4">
            <SelectMenu
              label="Outcome"
              value={outcome}
              onValueChange={setOutcome}
              options={outcomes.map((item) => ({ value: item, label: item }))}
            />
            <SelectMenu
              label="For which cohort"
              value={subject}
              onValueChange={setSubject}
              options={subjects.map((item) => ({ value: item, label: item }))}
            />
          </div>
          <SignalButton className="mt-5 w-fit" onClick={() => setScored({ outcome, subject })}>
            {stale ? "Score this cohort" : "Score again"}
          </SignalButton>
          <div className="mt-auto pt-6">
            <HelpTip title="How the score is made">
              A documented, deterministic heuristic weighs each factor. A trained model can later replace it behind the
              same contract, without changing anything you see. Scores describe cohorts, never individual people.
            </HelpTip>
          </div>
        </section>

        <section className="panel flex min-h-0 flex-col" aria-label="Score">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-5">
            <div>
              <p className="text-xs text-muted-foreground">
                {scored.subject} · {prediction.modelVersion}
              </p>
              <p className="mt-1 text-sm">{scored.outcome}</p>
              <p className="mt-2 flex items-baseline gap-3">
                <span className="num font-display text-6xl font-light">{prediction.score}</span>
                <span className="text-sm text-muted-foreground">out of 100 · {prediction.band}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <QuietButton onClick={() => toast.success("Score exported as a PDF. The model version is recorded.")}>
                Export PDF
              </QuietButton>
              <QuietButton onClick={() => toast.success("Factor table exported to Excel.")}>Export Excel</QuietButton>
            </div>
          </div>
          {stale ? (
            <p className="border-b border-border bg-surface-alt px-5 py-2 text-xs text-muted-foreground">
              You changed the outcome or cohort. Score the cohort again to update this result.
            </p>
          ) : null}
          <ScrollPane className="min-h-0 flex-1" orientation="vertical">
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-sans text-sm font-medium">What drives the score</h2>
                <Chip>Weights add up to 1.00</Chip>
              </div>
              <ul className="mt-4 grid gap-x-6 gap-y-4 xl:grid-cols-2">
                {prediction.factors.map((factor) => (
                  <li key={factor.name}>
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        {factor.direction === "up" ? (
                          <ArrowUpRight className="size-4 text-success" strokeWidth={1.75} aria-label="Raises the score" />
                        ) : (
                          <ArrowDownRight className="size-4 text-signal-strong" strokeWidth={1.75} aria-label="Lowers the score" />
                        )}
                        {factor.name}
                      </p>
                      <p className="num text-sm text-muted-foreground">{Math.round(factor.weight * 100)}%</p>
                    </div>
                    <div className="mt-1.5 h-1 bg-surface-alt">
                      <div className="h-1 bg-signal" style={{ width: `${factor.weight * 100}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{factor.reading}</p>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollPane>
        </section>
      </div>
    </MainLayout>
  );
}
