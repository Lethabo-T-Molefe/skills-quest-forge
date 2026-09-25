import { useMemo, useState } from "react";
import { Link, notFound, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { Chip, Drawer, MediaFrame, QuietButton, quietButtonClass, SignalButton, signalButtonClass } from "@/components";
import { media } from "@/config/media";
import {
  ChapterWorkbench,
  MethodLibrary,
  ProfilingBoard,
  RecipePanel,
  getMethod,
  methodsFor,
  useCleaningProfile,
  useCleaningStudio,
  workChapters,
  type CleaningDepth,
  type RecipeStep,
} from "@/features/cleaning";
import { useDataset } from "@/features/datasets";
import { cleaningWalkthrough } from "@/features/help";
import { isReadOnly, useCurrentUser } from "@/features/auth";
import { MainLayout } from "@/layouts/MainLayout";

export function CleaningPage() {
  const { datasetId } = useParams({ from: "/datasets/$datasetId/clean" });
  const dataset = useDataset(datasetId);
  const studio = useCleaningStudio();
  const profile = useCleaningProfile();
  const user = useCurrentUser();

  const [phase, setPhase] = useState<"profile" | "work" | "done">("profile");
  const [depth, setDepth] = useState<CleaningDepth>("everyday");
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(studio.chapters.map((chapter) => [chapter.id, chapter.recommendedMethodId])),
  );
  const [recipe, setRecipe] = useState<RecipeStep[]>([]);
  const [walkthrough, setWalkthrough] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const chapter = workChapters[index];
  const chapterMethods = chapter ? methodsFor(chapter.id) : [];
  const selected = useMemo(() => {
    if (!chapter) return undefined;
    return getMethod(choices[chapter.id] ?? chapter.recommendedMethodId) ?? chapterMethods[0];
  }, [chapter, chapterMethods, choices]);

  if (!dataset) throw notFound();
  if (phase === "work" && (!chapter || !selected)) return null;

  function choose(methodId: string) {
    const method = getMethod(methodId);
    if (!method) return;
    setChoices((current) => ({ ...current, [method.chapterId]: method.id }));
    const nextIndex = workChapters.findIndex((item) => item.id === method.chapterId);
    if (nextIndex >= 0) {
      setPhase("work");
      setIndex(nextIndex);
    }
    setLibraryOpen(false);
  }

  function append(status: RecipeStep["status"]) {
    if (!chapter || !selected) return;
    setRecipe((current) => [
      ...current.filter((item) => item.chapterId !== chapter.id),
      { stepId: selected.id, chapterId: chapter.id, title: chapter.title, option: selected.name, status },
    ]);
    if (index + 1 >= workChapters.length) {
      setPhase("done");
      toast.success("Recipe saved and versioned. Lineage recorded from bronze to silver.");
    } else {
      setIndex(index + 1);
    }
  }

  function undo() {
    if (phase === "work" && index === 0) {
      setPhase("profile");
      return;
    }
    if (phase === "work") {
      setIndex((value) => Math.max(0, value - 1));
      setRecipe((current) => current.slice(0, -1));
    }
  }

  return (
    <MainLayout
      label="guided cleaning"
      title={`Clean ${dataset.name}`}
      intro="Start by reading the profile. Then work one family of problems at a time. Each step previews a sample, records the transform, and leaves bronze untouched. Switch to expert methods when you need the full catalogue."
      actions={
        <>
          <QuietButton active={depth === "everyday"} onClick={() => setDepth("everyday")}>
            Everyday
          </QuietButton>
          <QuietButton active={depth === "expert"} onClick={() => setDepth("expert")}>
            Expert
          </QuietButton>
          <QuietButton onClick={() => setLibraryOpen(true)}>All methods</QuietButton>
          <QuietButton onClick={() => setWalkthrough((value) => !value)}>
            {walkthrough ? "Hide walkthrough" : "Show walkthrough"}
          </QuietButton>
        </>
      }
    >
      {walkthrough ? (
        <div className="panel mb-6 p-6">
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
        </div>
      ) : null}

      <ol className="mb-6 flex flex-wrap gap-2">
        <li>
          <Chip tone={phase === "profile" ? "signal" : "ok"}>01 Profile</Chip>
        </li>
        {workChapters.map((item, itemIndex) => (
          <li key={item.id}>
            <Chip
              tone={
                phase === "work" && itemIndex === index ? "signal" : recipe.some((step) => step.chapterId === item.id) ? "ok" : "neutral"
              }
            >
              {item.number} {item.title}
            </Chip>
          </li>
        ))}
      </ol>

      {phase === "done" ? (
        <div className="panel overflow-hidden p-0">
          <MediaFrame {...media.cleaned} ratio="16 / 8" />
          <div className="p-6">
            <p className="label-paren">(recipe v1 saved)</p>
            <h2 className="heading-2 mt-1">Silver dataset is ready</h2>
            <p className="mt-3 max-w-[68ch] text-sm text-muted-foreground">
              The full recipe ran over all {dataset.rows.toLocaleString("en-ZA")} rows in the sandbox. A lineage edge was
              recorded from bronze to silver. You can rerun this recipe on a new version of the same file.
            </p>
            <ol className="mt-5 space-y-2 text-sm">
              {recipe.map((item, itemIndex) => (
                <li key={`${item.stepId}-${itemIndex}`} className="flex gap-3">
                  <span className="num text-muted-foreground">{itemIndex + 1}</span>
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
        </div>
      ) : null}

      {phase === "profile" ? (
        <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
          <ProfilingBoard profile={profile} />
          <div className="space-y-6">
            <MediaFrame {...media.raw} ratio="4 / 3" />
            <RecipePanel steps={recipe} />
            <div className="flex flex-wrap gap-2">
              <SignalButton
                onClick={() => {
                  setRecipe([
                    {
                      stepId: "profile-accept",
                      chapterId: "profile",
                      title: "See what is wrong",
                      option: "Accepted the profile",
                      status: "accepted",
                    },
                  ]);
                  setPhase("work");
                  setIndex(0);
                }}
              >
                Continue to cleaning
              </SignalButton>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "work" && chapter && selected ? (
        <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
          <div className="space-y-6">
            <ChapterWorkbench
              chapter={chapter}
              methods={chapterMethods}
              selected={selected}
              depth={depth}
              onSelect={choose}
            />
            <div className="flex flex-wrap gap-2">
              <SignalButton disabled={isReadOnly(user)} onClick={() => append("accepted")}>
                Accept this step
              </SignalButton>
              <QuietButton disabled={isReadOnly(user)} onClick={() => append("skipped")}>
                Skip
              </QuietButton>
              <QuietButton onClick={undo}>Back</QuietButton>
            </div>
          </div>
          <div className="space-y-6">
            <MediaFrame {...media.cleaned} ratio="4 / 3" />
            <RecipePanel steps={recipe} />
          </div>
        </div>
      ) : null}

      <Drawer open={libraryOpen} title="Every cleaning method" onClose={() => setLibraryOpen(false)}>
        <MethodLibrary chapters={studio.chapters} methods={studio.methods} onPick={choose} />
      </Drawer>
    </MainLayout>
  );
}
