import { useState } from "react";
import { toast } from "sonner";
import { Chip, HelpTip, MediaFrame, Panel, QuietButton, SignalButton } from "@/components";
import { media } from "@/config/media";
import { usePrediction } from "@/features/monitors";
import { MainLayout } from "@/layouts/MainLayout";

export function PredictPage() {
  const prediction = usePrediction();
  const [outcome, setOutcome] = useState(prediction.outcome);
  const [ran, setRan] = useState(true);

  return (
    <MainLayout
      label="guided and explainable"
      title="Predict"
      intro="Select an outcome. The system produces a score in a fixed range, a ranked factor breakdown, and a plain-language reading of the top factors. You do not need to understand machine learning."
    >
      <div className="grid gap-6 lg:grid-cols-[5fr_7fr]">
        <Panel className="overflow-hidden p-0">
          <MediaFrame {...media.plot} ratio="16 / 10" />
          <div className="p-6">
          <h2 className="heading-2">What should we predict?</h2>
          <label className="mt-4 block text-sm">
            <span className="font-medium">Outcome</span>
            <select
              className="mt-1.5 w-full rounded-[999px] border border-line-strong bg-surface-raised px-4 py-2.5"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
            >
              <option>Likelihood to complete within 60 days</option>
              <option>Likelihood to enrol in a second course</option>
              <option>Likelihood of a late payment</option>
            </select>
          </label>
          <label className="mt-4 block text-sm">
            <span className="font-medium">Subject</span>
            <select className="mt-1.5 w-full rounded-[999px] border border-line-strong bg-surface-raised px-4 py-2.5">
              <option>Learner cohort · March intake</option>
              <option>Learner cohort · February intake</option>
              <option>Course · SQL basics</option>
            </select>
          </label>
          <SignalButton className="mt-5" onClick={() => setRan(true)}>
            Score this cohort
          </SignalButton>
          <div className="mt-4">
            <HelpTip>
              The first release uses documented, deterministic heuristics. A trained model can later replace a heuristic
              behind the same contract, without changing anything you see.
            </HelpTip>
          </div>
          </div>
        </Panel>

        {ran ? (
          <Panel>
            <p className="label-paren">({prediction.modelVersion})</p>
            <h2 className="heading-2 mt-1">{prediction.subject}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{outcome}</p>
            <p className="num mt-6 font-display text-7xl font-light">{prediction.score}</p>
            <p className="mt-2 text-sm">{prediction.band}</p>
            <div className="mt-4">
              <Chip>Weights always sum to 1.00</Chip>
            </div>
            <ul className="mt-6 space-y-4">
              {prediction.factors.map((factor) => (
                <li key={factor.name}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-medium">{factor.name}</p>
                    <p className="num text-sm text-muted-foreground">{Math.round(factor.weight * 100)}%</p>
                  </div>
                  <div className="mt-2 h-1 bg-surface-alt">
                    <div className="h-1 bg-signal" style={{ width: `${factor.weight * 100}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{factor.reading}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <QuietButton onClick={() => toast.success("Score exported as a PDF. The model version is recorded.")}>
                Export PDF
              </QuietButton>
              <QuietButton onClick={() => toast.success("Factor table exported to Excel.")}>Export Excel</QuietButton>
            </div>
          </Panel>
        ) : null}
      </div>
    </MainLayout>
  );
}
