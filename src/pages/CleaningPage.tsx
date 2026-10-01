import { useMemo, useState } from "react";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import { useIsFetching, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, BookOpen, History, Library } from "lucide-react";
import {
  BackLink,
  CodeBlock,
  ConfirmDialog,
  Drawer,
  HelpTip,
  JourneySteps,
  Notice,
  QuietButton,
  Segmented,
  SideRail,
  SignalButton,
  SplitLayout,
  StickyActions,
  quietButtonClass,
  signalButtonClass,
} from "@/components";
import { canApprove, canClean, useCurrentUser } from "@/features/auth";
import {
  ChapterWorkbench,
  CleaningStepRail,
  MethodLibrary,
  ProfilingBoard,
  RecipeHistory,
  addStep,
  cleaningStudioQuery,
  removeStep,
  runRecipe,
  useCleaningStudio,
  type CleaningDepth,
  type CleaningRecipe,
  type CleaningRun,
  type CleaningStudio,
  type RecipeStep,
  type StepDecision,
} from "@/features/cleaning";
import { refreshDatasets, useDataset } from "@/features/datasets";
import { cleaningWalkthrough } from "@/features/help";
import { MainLayout } from "@/layouts/MainLayout";
import { formatNumber } from "@/lib/format";
import { notifyError } from "@/lib/notify";

type Phase = "profile" | "work" | "done";

/** The decision recorded for each chapter. A chapter holds one decision, so the latest step wins. */
function stepsByChapter(recipe: CleaningRecipe | null) {
  const steps: Record<string, RecipeStep> = {};
  for (const step of recipe?.steps ?? []) steps[step.chapterId] = step;
  return steps;
}

export function CleaningPage() {
  const { datasetId } = useParams({ from: "/clean/$datasetId" });
  const search = useSearch({ from: "/clean/$datasetId" });
  const dataset = useDataset(datasetId);
  const studio = useCleaningStudio(datasetId);
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const readOnly = !studio.canEdit;

  const workChapters = useMemo(
    () => studio.chapters.filter((chapter) => chapter.kind !== "profile"),
    [studio.chapters],
  );
  const steps = useMemo(() => stepsByChapter(studio.recipe), [studio.recipe]);
  const decisions = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(steps).map(([chapterId, step]): [string, StepDecision] => [
          chapterId,
          { methodName: step.option, status: step.status },
        ]),
      ),
    [steps],
  );

  // A link from an insight opens the chapter it is about.
  const requested = workChapters.findIndex((chapter) => chapter.id === search.step);
  const [phase, setPhase] = useState<Phase>(requested >= 0 ? "work" : "profile");
  const [profileDone, setProfileDone] = useState(requested >= 0 || Object.keys(steps).length > 0);
  const [index, setIndex] = useState(Math.max(requested, 0));
  const [depth, setDepth] = useState<CleaningDepth>("everyday");
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [run, setRun] = useState<CleaningRun | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);

  const chapter = workChapters[index];
  const chapterMethods = chapter
    ? studio.methods.filter((method) => method.chapterId === chapter.id)
    : [];
  // The everyday view never chooses an expert method on its own: those are for people who ask for them.
  const everyday = chapterMethods.filter((method) => method.audience === "everyday");
  const offered = depth === "expert" || everyday.length === 0 ? chapterMethods : everyday;
  // The member's own choice, else what the recipe already holds, else the suggestion, else anything usable.
  const selected = chapter
    ? (chapterMethods.find((method) => method.id === choices[chapter.id]) ??
      chapterMethods.find((method) => method.id === steps[chapter.id]?.methodId) ??
      offered.find((method) => method.id === chapter.recommendedMethodId && method.applicable) ??
      offered.find((method) => method.applicable) ??
      offered.find((method) => method.id === chapter.recommendedMethodId) ??
      offered[0])
    : undefined;

  const decided = workChapters.filter((item) => decisions[item.id]);
  const accepted = decided.filter((item) => decisions[item.id]?.status === "accepted").length;
  const undecided = workChapters.length - decided.length;

  /** Show the changed recipe at once, then recompute the previews, which follow the steps before them. */
  function applyRecipe(recipe: CleaningRecipe) {
    const key = cleaningStudioQuery(datasetId).queryKey;
    queryClient.setQueryData<CleaningStudio>(key, (current) =>
      current ? { ...current, recipe } : current,
    );
    void queryClient.invalidateQueries({ queryKey: key });
    void queryClient.invalidateQueries({ queryKey: ["cleaning", "recipes", datasetId] });
  }

  const decide = useMutation({
    mutationFn: async (status: StepDecision["status"]) => {
      if (!chapter || !selected) throw new Error("No step is open.");
      const existing = steps[chapter.id];
      if (existing) await removeStep(datasetId, existing.stepId);
      return addStep(datasetId, selected.id, status, selected.params);
    },
    onSuccess: (recipe) => {
      applyRecipe(recipe);
      // Move to the next step that has not been decided yet.
      const done = stepsByChapter(recipe);
      const after = workChapters.findIndex((item, i) => i > index && !done[item.id]);
      const before = workChapters.findIndex((item) => !done[item.id]);
      const next = after >= 0 ? after : before;
      if (next >= 0) setIndex(next);
      else
        toast.success("Every step is decided", {
          description: "Finish to write the cleaned table.",
        });
    },
    onError: notifyError("The step could not be saved."),
  });

  const undo = useMutation({
    mutationFn: (chapterId: string) => {
      const step = steps[chapterId];
      if (!step) throw new Error("That step has no decision.");
      return removeStep(datasetId, step.stepId);
    },
    onSuccess: (recipe, chapterId) => {
      applyRecipe(recipe);
      openChapter(chapterId);
    },
    onError: notifyError("The decision could not be undone."),
  });

  const finish = useMutation({
    mutationFn: () => runRecipe(datasetId),
    onSuccess: async (result) => {
      setRun(result);
      setPhase("done");
      window.scrollTo({ top: 0 });
      await Promise.all([
        refreshDatasets(queryClient),
        queryClient.invalidateQueries({ queryKey: ["cleaning"] }),
      ]);
      toast.success(`Recipe saved as version ${result.recipe.version}`, {
        description: `${formatNumber(result.rows)} cleaned rows written. Lineage recorded.`,
      });
    },
    onError: notifyError("The recipe could not be run."),
  });

  function openChapter(chapterId: string) {
    const next = workChapters.findIndex((item) => item.id === chapterId);
    if (next < 0) return;
    setProfileDone(true);
    setIndex(next);
    setPhase("work");
  }

  function choose(methodId: string) {
    const method = studio.methods.find((item) => item.id === methodId);
    if (!method) return;
    setChoices((current) => ({ ...current, [method.chapterId]: method.id }));
    setLibraryOpen(false);
    openChapter(method.chapterId);
  }

  function back() {
    if (phase === "work" && index > 0) setIndex(index - 1);
    else setPhase("profile");
  }

  const busy = decide.isPending || undo.isPending || finish.isPending;
  // Each preview follows the steps before it, so after a change they are worked out again. A step can be
  // accepted once its preview is current.
  const refreshing =
    useIsFetching({ queryKey: cleaningStudioQuery(datasetId).queryKey }) > 0 && !busy;
  const readOnlyReason = canClean(user)
    ? "Only the owner or a steward can change this dataset. You can look through every step."
    : "Your role can look through the steps but not change the data.";

  return (
    <MainLayout
      back={<BackLink to="/clean">All files to clean</BackLink>}
      title={`Clean ${dataset.name}`}
      description="Read the profile, then work through each problem. Nothing changes in the original file: finishing writes a new, cleaned copy and a recipe you can rerun."
      actions={
        phase === "done" ? null : (
          <>
            <Segmented
              label="Level of detail"
              value={depth}
              onValueChange={setDepth}
              options={[
                {
                  value: "everyday",
                  label: "Everyday",
                  hint: "The suggested method for each problem, in plain language",
                },
                {
                  value: "expert",
                  label: "Expert",
                  hint: "Every method, with the statistics behind it",
                },
              ]}
            />
            <QuietButton onClick={() => setLibraryOpen(true)}>
              <Library className="size-4" strokeWidth={1.5} aria-hidden />
              Every method
            </QuietButton>
            <QuietButton onClick={() => setHistoryOpen(true)}>
              <History className="size-4" strokeWidth={1.5} aria-hidden />
              Recipes
            </QuietButton>
            <QuietButton onClick={() => setGuideOpen(true)}>
              <BookOpen className="size-4" strokeWidth={1.5} aria-hidden />
              How this works
            </QuietButton>
          </>
        )
      }
    >
      {phase === "done" && run ? (
        <DoneView
          datasetId={dataset.id}
          name={dataset.name}
          run={run}
          canApproveNow={canApprove(user)}
        />
      ) : (
        <>
          {dataset.layer !== "bronze" && studio.recipe?.status === "draft" && !readOnly ? (
            <Notice
              className="mb-5"
              title={`This dataset is already cleaned. You are editing recipe version ${studio.recipe.version}`}
            >
              It starts from the steps that produced the current table. Finishing rewrites the
              cleaned table, which then needs a steward&apos;s approval again. To clean a new upload
              the same way, rerun a saved recipe from Recipes.
            </Notice>
          ) : null}
          {readOnly ? (
            <Notice className="mb-5" tone="warn" title="You are viewing this recipe">
              {readOnlyReason}
            </Notice>
          ) : null}
          <SplitLayout
            railWidth="17rem"
            rail={
              <SideRail label="Cleaning steps" className="panel flex flex-col">
                <CleaningStepRail
                  chapters={workChapters}
                  profileDone={profileDone}
                  profileActive={phase === "profile"}
                  currentId={phase === "work" && chapter ? chapter.id : null}
                  decisions={decisions}
                  canUndo={!readOnly && !busy}
                  onOpenProfile={() => setPhase("profile")}
                  onOpen={openChapter}
                  onUndo={(chapterId) => undo.mutate(chapterId)}
                />
                <div className="border-t border-border p-4">
                  <p className="num text-xs text-muted-foreground">
                    {accepted} accepted · {decided.length - accepted} skipped · {undecided} to go
                  </p>
                  <SignalButton
                    className="mt-2 w-full px-3 py-2 text-xs"
                    disabled={readOnly || busy || accepted === 0}
                    onClick={() => (undecided > 0 ? setConfirmFinish(true) : finish.mutate())}
                  >
                    {finish.isPending ? "Cleaning the full data…" : "Finish and save the recipe"}
                  </SignalButton>
                  {!readOnly && accepted === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Accept at least one step to finish.
                    </p>
                  ) : null}
                </div>
              </SideRail>
            }
          >
            <section
              className="panel"
              aria-label={phase === "profile" ? "Profile" : chapter?.title}
              aria-busy={busy}
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-6 py-4">
                <h2 className="font-display text-xl">
                  {phase === "profile" ? "See what is wrong" : chapter?.title}
                </h2>
                <p className="num text-xs text-muted-foreground">
                  {phase === "profile" ? "Step 1 of " : `Step ${index + 2} of `}
                  {workChapters.length + 1}
                </p>
              </header>
              <div className="p-6">
                {phase === "profile" ? (
                  studio.profile ? (
                    <ProfilingBoard profile={studio.profile} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This dataset has no stored profile. Upload it again to measure it.
                    </p>
                  )
                ) : chapter && selected ? (
                  <ChapterWorkbench
                    chapter={chapter}
                    methods={chapterMethods}
                    selected={selected}
                    depth={depth}
                    onSelect={choose}
                  />
                ) : null}
              </div>
              <StickyActions className="px-6">
                {phase === "profile" ? (
                  <>
                    <p className="mr-auto text-xs text-muted-foreground">
                      Nothing has changed yet. The profile only measures.
                    </p>
                    <SignalButton
                      onClick={() => {
                        setProfileDone(true);
                        setPhase("work");
                      }}
                    >
                      {readOnly ? "Look through the steps" : "Start cleaning"}
                      <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
                    </SignalButton>
                  </>
                ) : (
                  <>
                    <QuietButton onClick={back}>
                      <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
                      Back
                    </QuietButton>
                    <p className="mr-auto text-xs text-muted-foreground">
                      {readOnly
                        ? readOnlyReason
                        : decide.isPending
                          ? "Saving the step…"
                          : refreshing
                            ? "Working out this step's preview on the data as it now stands…"
                            : selected && !selected.applicable
                              ? "This method has nothing to do here. Choose another, or skip."
                              : null}
                    </p>
                    <QuietButton
                      disabled={readOnly || busy}
                      onClick={() => decide.mutate("skipped")}
                    >
                      Skip this step
                    </QuietButton>
                    <SignalButton
                      disabled={readOnly || busy || refreshing || !selected?.applicable}
                      onClick={() => decide.mutate("accepted")}
                    >
                      Accept and continue
                      <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
                    </SignalButton>
                  </>
                )}
              </StickyActions>
            </section>
          </SplitLayout>
        </>
      )}

      <Drawer
        open={libraryOpen}
        title="Every cleaning method"
        onClose={() => setLibraryOpen(false)}
      >
        <MethodLibrary chapters={studio.chapters} methods={studio.methods} onPick={choose} />
      </Drawer>

      <Drawer open={historyOpen} title="Saved recipes" onClose={() => setHistoryOpen(false)}>
        <p className="mb-5 text-sm text-muted-foreground">
          Every version of this dataset&apos;s recipe. Rerunning an applied recipe on the same raw
          data gives the same output, checksum for checksum.
        </p>
        <RecipeHistory
          datasetId={datasetId}
          canEdit={!readOnly}
          onRerun={(result) => {
            setHistoryOpen(false);
            setRun(result);
            setPhase("done");
          }}
        />
      </Drawer>

      <Drawer open={guideOpen} title="How cleaning works" onClose={() => setGuideOpen(false)}>
        <ol className="space-y-5">
          {cleaningWalkthrough.map((item, i) => (
            <li key={item.title} className="flex gap-3">
              <span className="num flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-inverse text-xs text-background">
                {i + 1}
              </span>
              <span>
                <span className="block font-medium">{item.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{item.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Drawer>

      <ConfirmDialog
        open={confirmFinish}
        title="Finish with steps left?"
        confirmLabel="Finish and save"
        onConfirm={() => finish.mutate()}
        onClose={() => setConfirmFinish(false)}
      >
        {undecided} {undecided === 1 ? "step has" : "steps have"} not been decided.{" "}
        {undecided === 1 ? "It" : "They"} will be left out of the recipe. You can edit the recipe
        later and run it again.
      </ConfirmDialog>
    </MainLayout>
  );
}

function DoneView({
  datasetId,
  name,
  run,
  canApproveNow,
}: {
  datasetId: string;
  name: string;
  run: CleaningRun;
  canApproveNow: boolean;
}) {
  const accepted = run.recipe.steps.filter((step) => step.status === "accepted");

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <section className="panel p-6" aria-label="Recipe">
        <p className="text-xs text-muted-foreground">Recipe version {run.recipe.version} · saved</p>
        <h2 className="mt-1 font-display text-2xl">The cleaned copy of {name} is ready</h2>
        <p className="mt-2 max-w-[68ch] text-sm text-muted-foreground">
          The recipe ran over the full raw data in the sandbox and wrote{" "}
          <span className="num">{formatNumber(run.rows)}</span> rows to {run.table}. The original
          stays in bronze, and the recipe can be rerun on the next version of this file.
        </p>
        {run.reproduced !== undefined && run.reproduced !== null ? (
          <Notice
            className="mt-4"
            tone={run.reproduced ? "ok" : "warn"}
            title={run.reproduced ? "Reproduced exactly" : "The output changed"}
          >
            {run.reproduced
              ? "The same recipe on the same raw data gave the same table, checksum for checksum."
              : (run.note ?? "The raw data has changed since the earlier run.")}
          </Notice>
        ) : null}
        <ol className="mt-5 divide-y divide-border border border-border text-sm">
          {accepted.map((step, i) => (
            <li key={step.stepId} className="px-4 py-3">
              <p className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span>
                  <span className="num mr-2 text-muted-foreground">{i + 1}</span>
                  {step.title}
                </span>
                <span className="text-right text-muted-foreground">{step.option}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {run.steps[i]?.summary ?? step.summary}
              </p>
            </li>
          ))}
        </ol>
        {run.masked.length > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Masked as personal information in the cleaned table: {run.masked.join(", ")}.
          </p>
        ) : null}
        <div className="mt-4 space-y-3">
          <HelpTip title="Show the recipe as code">
            <CodeBlock code={run.recipe.code} label={`Recipe v${run.recipe.version}`} />
          </HelpTip>
          <p className="text-xs break-all text-muted-foreground">Output checksum {run.checksum}</p>
        </div>
      </section>

      <section className="panel flex flex-col p-6" aria-label="What happens next">
        <h2 className="font-display text-xl">What happens next</h2>
        <JourneySteps
          className="mt-4"
          steps={[
            { label: "Brought in", state: "done" },
            { label: "Cleaned", detail: "Just now", state: "done" },
            { label: "Approved", detail: "Needs a steward", state: "current" },
            { label: "Analysed and shared", detail: "After approval", state: "todo" },
          ]}
        />
        <p className="mt-5 text-sm text-muted-foreground">
          The cleaned table is now in the stewards&apos; approval queue. A steward reviews it and
          its classification; once approved, it appears in Analyse for everyone with permission.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {canApproveNow ? (
            <Link to="/governance" className={signalButtonClass}>
              Review and approve
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </Link>
          ) : null}
          <Link to="/datasets/$datasetId" params={{ datasetId }} className={quietButtonClass}>
            Back to the dataset
          </Link>
        </div>
        <div className="mt-6 border-t border-border pt-4 text-sm">
          <p className="text-muted-foreground">While you wait</p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/clean" className="text-signal-strong underline-offset-4 hover:underline">
              Clean another file
            </Link>
            <Link to="/analyse" className="text-signal-strong underline-offset-4 hover:underline">
              Analyse approved data
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
