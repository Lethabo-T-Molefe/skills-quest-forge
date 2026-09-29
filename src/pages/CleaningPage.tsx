import { useState } from "react";
import { Link, notFound, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, BookOpen, Library } from "lucide-react";
import {
  BackLink,
  ConfirmDialog,
  Drawer,
  JourneySteps,
  QuietButton,
  ScrollPane,
  Segmented,
  SignalButton,
  quietButtonClass,
  signalButtonClass,
} from "@/components";
import { canApprove, isReadOnly, useCurrentUser } from "@/features/auth";
import {
  ChapterWorkbench,
  CleaningStepRail,
  MethodLibrary,
  ProfilingBoard,
  getMethod,
  methodsFor,
  useCleaningProfile,
  useCleaningStudio,
  workChapters,
  type CleaningDepth,
  type StepDecision,
} from "@/features/cleaning";
import { useDataset } from "@/features/datasets";
import { cleaningWalkthrough } from "@/features/help";
import { MainLayout } from "@/layouts/MainLayout";
import { formatNumber } from "@/lib/format";

type Phase = "profile" | "work" | "done";

export function CleaningPage() {
  const { datasetId } = useParams({ from: "/clean/$datasetId" });
  const dataset = useDataset(datasetId);
  const studio = useCleaningStudio();
  const profile = useCleaningProfile();
  const user = useCurrentUser();
  const readOnly = isReadOnly(user);

  const [phase, setPhase] = useState<Phase>("profile");
  const [profileDone, setProfileDone] = useState(false);
  const [index, setIndex] = useState(0);
  const [depth, setDepth] = useState<CleaningDepth>("everyday");
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(studio.chapters.map((chapter) => [chapter.id, chapter.recommendedMethodId])),
  );
  const [decisions, setDecisions] = useState<Record<string, StepDecision>>({});
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);

  if (!dataset) throw notFound();

  const chapter = workChapters[index];
  const chapterMethods = chapter ? methodsFor(chapter.id) : [];
  const selected = chapter ? (getMethod(choices[chapter.id] ?? chapter.recommendedMethodId) ?? chapterMethods[0]) : undefined;
  const decided = workChapters.filter((item) => decisions[item.id]);
  const accepted = decided.filter((item) => decisions[item.id]?.status === "accepted").length;
  const undecided = workChapters.length - decided.length;

  function openChapter(chapterId: string) {
    const next = workChapters.findIndex((item) => item.id === chapterId);
    if (next < 0) return;
    setProfileDone(true);
    setIndex(next);
    setPhase("work");
  }

  function choose(methodId: string) {
    const method = getMethod(methodId);
    if (!method) return;
    setChoices((current) => ({ ...current, [method.chapterId]: method.id }));
    setLibraryOpen(false);
    openChapter(method.chapterId);
  }

  function decide(status: StepDecision["status"]) {
    if (!chapter || !selected) return;
    const nextDecisions = { ...decisions, [chapter.id]: { methodName: selected.name, status } };
    setDecisions(nextDecisions);
    // Move to the next step that has not been decided yet, or finish when every step has.
    const after = workChapters.findIndex((item, i) => i > index && !nextDecisions[item.id]);
    const before = workChapters.findIndex((item) => !nextDecisions[item.id]);
    const next = after >= 0 ? after : before;
    if (next >= 0) setIndex(next);
    else finish();
  }

  function undo(chapterId: string) {
    setDecisions((current) => {
      const { [chapterId]: _removed, ...rest } = current;
      return rest;
    });
    openChapter(chapterId);
  }

  function finish() {
    setPhase("done");
    toast.success("Recipe saved as version 1", { description: "Lineage recorded from bronze to silver." });
  }

  function back() {
    if (phase === "work" && index > 0) setIndex(index - 1);
    else setPhase("profile");
  }

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
                { value: "everyday", label: "Everyday", hint: "The suggested method for each problem, in plain language" },
                { value: "expert", label: "Expert", hint: "Every method, with the statistics behind it" },
              ]}
            />
            <QuietButton onClick={() => setLibraryOpen(true)}>
              <Library className="size-4" strokeWidth={1.5} aria-hidden />
              Every method
            </QuietButton>
            <QuietButton onClick={() => setGuideOpen(true)}>
              <BookOpen className="size-4" strokeWidth={1.5} aria-hidden />
              How this works
            </QuietButton>
          </>
        )
      }
      fill
    >
      {phase === "done" ? (
        <DoneView
          datasetId={dataset.id}
          name={dataset.name}
          rows={dataset.rows}
          decisions={decisions}
          canApproveNow={canApprove(user)}
        />
      ) : (
        <div className="grid gap-4 lg:h-full lg:grid-cols-[264px_minmax(0,1fr)]">
          <aside className="panel flex min-h-0 flex-col" aria-label="Cleaning steps">
            <ScrollPane className="min-h-0 flex-1" orientation="vertical">
              <CleaningStepRail
                chapters={workChapters}
                profileDone={profileDone}
                profileActive={phase === "profile"}
                currentId={phase === "work" && chapter ? chapter.id : null}
                decisions={decisions}
                onOpenProfile={() => setPhase("profile")}
                onOpen={openChapter}
                onUndo={undo}
              />
            </ScrollPane>
            <div className="border-t border-border p-3">
              <p className="num text-xs text-muted-foreground">
                {accepted} accepted · {decided.length - accepted} skipped · {undecided} to go
              </p>
              <SignalButton
                className="mt-2 w-full px-3 py-2 text-xs"
                disabled={readOnly || decided.length === 0}
                onClick={() => (undecided > 0 ? setConfirmFinish(true) : finish())}
              >
                Finish and save the recipe
              </SignalButton>
            </div>
          </aside>

          <section className="panel flex min-h-[480px] flex-col lg:min-h-0" aria-label={phase === "profile" ? "Profile" : chapter?.title}>
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-5 py-3">
              <h2 className="font-display text-xl">
                {phase === "profile" ? "See what is wrong" : chapter?.title}
              </h2>
              <p className="num text-xs text-muted-foreground">
                {phase === "profile" ? "Step 1 of " : `Step ${index + 2} of `}
                {workChapters.length + 1}
              </p>
            </header>
            <ScrollPane className="min-h-0 flex-1" orientation="vertical">
              <div className="p-5">
                {phase === "profile" ? (
                  <ProfilingBoard profile={profile} />
                ) : chapter && selected ? (
                  <ChapterWorkbench chapter={chapter} methods={chapterMethods} selected={selected} depth={depth} onSelect={choose} />
                ) : null}
              </div>
            </ScrollPane>
            <footer className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
              {phase === "profile" ? (
                <>
                  <p className="mr-auto text-xs text-muted-foreground">Nothing has changed yet. The profile only measures.</p>
                  <SignalButton
                    onClick={() => {
                      setProfileDone(true);
                      setPhase("work");
                    }}
                  >
                    Start cleaning
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
                    {readOnly ? "Your role can look through the steps but not change the data." : null}
                  </p>
                  <QuietButton disabled={readOnly} onClick={() => decide("skipped")}>
                    Skip this step
                  </QuietButton>
                  <SignalButton disabled={readOnly} onClick={() => decide("accepted")}>
                    Accept and continue
                    <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
                  </SignalButton>
                </>
              )}
            </footer>
          </section>
        </div>
      )}

      <Drawer open={libraryOpen} title="Every cleaning method" onClose={() => setLibraryOpen(false)}>
        <MethodLibrary chapters={studio.chapters} methods={studio.methods} onPick={choose} />
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
        onConfirm={finish}
        onClose={() => setConfirmFinish(false)}
      >
        {undecided} {undecided === 1 ? "step has" : "steps have"} not been decided. {undecided === 1 ? "It" : "They"} will be
        saved as skipped. You can rerun the recipe later with more steps.
      </ConfirmDialog>
    </MainLayout>
  );
}

function DoneView({
  datasetId,
  name,
  rows,
  decisions,
  canApproveNow,
}: {
  datasetId: string;
  name: string;
  rows: number;
  decisions: Record<string, StepDecision>;
  canApproveNow: boolean;
}) {
  const [requested, setRequested] = useState(false);

  return (
    <div className="grid gap-4 lg:h-full lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <section className="panel flex min-h-0 flex-col p-5" aria-label="Recipe">
        <p className="text-xs text-muted-foreground">Recipe version 1 · saved</p>
        <h2 className="mt-1 font-display text-2xl">The cleaned copy of {name} is ready</h2>
        <p className="mt-2 max-w-[68ch] text-sm text-muted-foreground">
          The recipe ran over all <span className="num">{formatNumber(rows)}</span> rows in your sandbox and wrote a new
          silver table. The original stays in bronze, and the recipe can be rerun on the next version of this file.
        </p>
        <ScrollPane className="mt-4 min-h-0 flex-1 border border-border" orientation="vertical">
          <ol className="divide-y divide-border text-sm">
            {workChapters.map((chapter) => {
              const decision = decisions[chapter.id];
              return (
                <li key={chapter.id} className="flex items-start justify-between gap-4 px-4 py-2">
                  <span>
                    <span className="num mr-2 text-muted-foreground">{chapter.number}</span>
                    {chapter.title}
                  </span>
                  <span className={decision?.status === "accepted" ? "text-right" : "text-right text-muted-foreground"}>
                    {decision?.status === "accepted" ? decision.methodName : "Skipped"}
                  </span>
                </li>
              );
            })}
          </ol>
        </ScrollPane>
      </section>

      <section className="panel flex flex-col p-5" aria-label="What happens next">
        <h2 className="font-display text-xl">What happens next</h2>
        <JourneySteps
          className="mt-4"
          steps={[
            { label: "Brought in", state: "done" },
            { label: "Cleaned", detail: "Just now", state: "done" },
            { label: "Approved", detail: requested ? "Request sent" : "Needs a steward", state: "current" },
            { label: "Analysed and shared", detail: "After approval", state: "todo" },
          ]}
        />
        <p className="mt-5 text-sm text-muted-foreground">
          A steward reviews the cleaned table and its classification. Once approved, it appears in Analyse for everyone
          with permission.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {canApproveNow ? (
            <Link to="/governance" className={signalButtonClass}>
              Review and approve
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </Link>
          ) : (
            <SignalButton
              disabled={requested}
              onClick={() => {
                setRequested(true);
                toast.success("Approval requested", { description: "A steward has been notified." });
              }}
            >
              {requested ? "Approval requested" : "Request approval"}
            </SignalButton>
          )}
          <Link to="/datasets/$datasetId" params={{ datasetId }} className={quietButtonClass}>
            Back to the dataset
          </Link>
        </div>
        <div className="mt-auto border-t border-border pt-4 text-sm">
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
