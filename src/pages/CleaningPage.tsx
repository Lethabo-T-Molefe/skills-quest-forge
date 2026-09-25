import { useMemo, useState } from "react";
import { Link, notFound, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { Chip, HelpTip, MediaFrame, Panel, QuietButton, quietButtonClass, SignalButton, signalButtonClass } from "@/components";
import { media } from "@/config/media";
import { useCleaningSteps, type RecipeStep } from "@/features/cleaning";
import { DatasetQualityPanel, useDataset } from "@/features/datasets";
import { cleaningWalkthrough } from "@/features/help";
import { isReadOnly } from "@/features/auth";
import { useCurrentUser } from "@/features/auth";
import { MainLayout } from "@/layouts/MainLayout";

export function CleaningPage() {
  const { datasetId } = useParams({ from: "/datasets/$datasetId/clean" });
  const dataset = useDataset(datasetId);
  const steps = useCleaningSteps();
  const user = useCurrentUser();
  const [index, setIndex] = useState(0);
  const [option, setOption] = useState(0);
  const [recipe, setRecipe] = useState<RecipeStep[]>([]);
  const [finished, setFinished] = useState(false);
  const [walkthrough, setWalkthrough] = useState(true);
  const step = steps[index];

  const preview = useMemo(() => {
    if (!step) return { before: [], after: [] };
    return step.preview;
  }, [step]);

  if (!dataset) throw notFound();
  if (!step && !finished) return null;

  function append(status: RecipeStep["status"]) {
    if (!step) return;
    setRecipe((current) => [
      ...current.filter((item) => item.stepId !== step.id),
      { stepId: step.id, title: step.title, option: step.options[option] ?? step.options[0] ?? "", status },
    ]);
    if (index + 1 >= steps.length) {
      setFinished(true);
      toast.success("Recipe saved and versioned. Lineage recorded from bronze to silver.");
    } else {
      setIndex(index + 1);
      setOption(0);
    }
  }

  return (
    <MainLayout
      label="guided cleaning"
      title={`Clean ${dataset.name}`}
      intro="Work one step at a time. Preview each operation on a sample, then accept, adjust or skip it. Accepted steps become a versioned recipe. Bronze data never changes."
      actions={
        <QuietButton onClick={() => setWalkthrough((value) => !value)}>
          {walkthrough ? "Hide walkthrough" : "Show walkthrough"}
        </QuietButton>
      }
    >
      {walkthrough ? (
        <Panel className="mb-6">
          <p className="label-paren">(first time here)</p>
          <h2 className="heading-2 mt-1">A short walkthrough</h2>
          <ol className="mt-4 grid gap-4 md:grid-cols-2">
            {cleaningWalkthrough.map((item) => (
              <li key={item.title}>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </Panel>
      ) : null}

      {finished ? (
        <Panel className="overflow-hidden p-0">
          <MediaFrame {...media.cleaned} ratio="16 / 8" />
          <div className="p-6">
          <p className="label-paren">(recipe v1 saved)</p>
          <h2 className="heading-2 mt-1">Silver dataset is ready</h2>
          <p className="mt-3 max-w-[68ch] text-sm text-muted-foreground">
            The full recipe ran over all {dataset.rows.toLocaleString("en-ZA")} rows in the sandbox. A lineage edge was
            recorded from bronze to silver. You can rerun this recipe on a new version of the same file.
          </p>
          <ol className="mt-5 space-y-2 text-sm">
            {recipe.map((item, i) => (
              <li key={item.stepId} className="flex gap-3">
                <span className="num text-muted-foreground">{i + 1}</span>
                <span>
                  {item.title} · {item.status === "skipped" ? "skipped" : item.option}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/datasets/$datasetId" params={{ datasetId: dataset.id }} className={signalButtonClass}>
              Back to the dataset
            </Link>
            <Link to="/explorer" search={{ dataset: dataset.id }} className={quietButtonClass}>
              Explore the cleaned data
            </Link>
          </div>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
          <div className="space-y-6">
            <DatasetQualityPanel dataset={dataset} />
            <Panel>
              <p className="label-paren">
                (step {index + 1} of {steps.length})
              </p>
              <h2 className="heading-2 mt-1">{step?.title}</h2>
              <p className="mt-3 text-sm">{step?.question}</p>
              <p className="mt-2 text-xs text-muted-foreground">Affects {step?.affected}</p>
              <div className="mt-4 flex flex-col gap-2">
                {step?.options.map((item, i) => (
                  <QuietButton key={item} active={option === i} onClick={() => setOption(i)}>
                    {item}
                  </QuietButton>
                ))}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Before</p>
                  <ul className="mt-2 space-y-1 font-mono text-sm">
                    {preview.before.map((item, i) => (
                      <li key={`before-${i}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">After</p>
                  <ul className="mt-2 space-y-1 font-mono text-sm">
                    {preview.after.map((item, i) => (
                      <li key={`after-${i}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <SignalButton disabled={isReadOnly(user)} onClick={() => append("accepted")}>
                  Accept this step
                </SignalButton>
                <QuietButton disabled={isReadOnly(user)} onClick={() => append("skipped")}>
                  Skip
                </QuietButton>
                <QuietButton
                  disabled={index === 0}
                  onClick={() => {
                    setIndex(Math.max(0, index - 1));
                    setRecipe((current) => current.slice(0, -1));
                  }}
                >
                  Undo
                </QuietButton>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <MediaFrame {...media.raw} ratio="4 / 3" />
            <Panel>
              <h2 className="heading-2">Recipe so far</h2>
              {recipe.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No steps accepted yet.</p>
              ) : (
                <ol className="mt-4 space-y-3 text-sm">
                  {recipe.map((item, i) => (
                    <li key={item.stepId} className="flex items-start justify-between gap-3">
                      <span>
                        <span className="num text-muted-foreground">{i + 1}. </span>
                        {item.title}
                      </span>
                      <Chip tone={item.status === "accepted" ? "ok" : "neutral"}>
                        {item.status === "skipped" ? "skipped" : item.option}
                      </Chip>
                    </li>
                  ))}
                </ol>
              )}
              <div className="mt-4">
                <HelpTip>
                  The recipe is a first-class artefact. Share it, version it, or rerun it on a new upload of the same
                  source.
                </HelpTip>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
