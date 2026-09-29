import { Check, SkipForward, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CleaningChapter } from "../types";

export interface StepDecision {
  methodName: string;
  status: "accepted" | "skipped";
}

/**
 * The cleaning steps as a list you can move around in freely. Each step shows its decision,
 * so the list doubles as the recipe so far.
 */
export function CleaningStepRail({
  chapters,
  profileDone,
  profileActive,
  currentId,
  decisions,
  onOpenProfile,
  onOpen,
  onUndo,
}: {
  chapters: CleaningChapter[];
  profileDone: boolean;
  profileActive: boolean;
  currentId: string | null;
  decisions: Record<string, StepDecision>;
  onOpenProfile: () => void;
  onOpen: (chapterId: string) => void;
  onUndo: (chapterId: string) => void;
}) {
  return (
    <ol className="space-y-0.5 p-2">
      <li>
        <button
          type="button"
          onClick={onOpenProfile}
          aria-current={profileActive ? "step" : undefined}
          className={cn(
            "flex w-full items-start gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-sm transition-colors",
            profileActive ? "bg-surface-inverse text-background" : "hover:bg-accent/50",
          )}
        >
          <StepMark state={profileDone ? "accepted" : profileActive ? "current" : "todo"} number="01" inverse={profileActive} />
          <span className="min-w-0">
            <span className="block font-medium">See what is wrong</span>
            <span className={cn("block text-xs", profileActive ? "text-white/70" : "text-muted-foreground")}>
              {profileDone ? "Profile read" : "Start here"}
            </span>
          </span>
        </button>
      </li>
      {chapters.map((chapter) => {
        const decision = decisions[chapter.id];
        const active = chapter.id === currentId;
        return (
          <li key={chapter.id} className="group relative">
            <button
              type="button"
              onClick={() => onOpen(chapter.id)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-[10px] px-2.5 py-2 pr-8 text-left text-sm transition-colors",
                active ? "bg-surface-inverse text-background" : "hover:bg-accent/50",
              )}
            >
              <StepMark state={decision ? decision.status : active ? "current" : "todo"} number={chapter.number} inverse={active} />
              <span className="min-w-0">
                <span className="block font-medium">{chapter.title}</span>
                <span className={cn("block truncate text-xs", active ? "text-white/70" : "text-muted-foreground")}>
                  {decision ? (decision.status === "skipped" ? "Skipped" : decision.methodName) : "Not decided"}
                </span>
              </span>
            </button>
            {decision ? (
              <button
                type="button"
                onClick={() => onUndo(chapter.id)}
                className={cn(
                  "absolute top-2 right-1.5 rounded-full p-1 opacity-60 hover:opacity-100 focus-visible:opacity-100",
                  active ? "text-background" : "text-muted-foreground",
                )}
                aria-label={`Undo the decision for ${chapter.title}`}
                title="Undo this decision"
              >
                <X className="size-3.5" strokeWidth={1.75} />
              </button>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function StepMark({
  state,
  number,
  inverse,
}: {
  state: "accepted" | "skipped" | "current" | "todo";
  number: string;
  inverse: boolean;
}) {
  return (
    <span
      className={cn(
        "num mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
        state === "accepted" && (inverse ? "bg-background text-foreground" : "bg-success text-background"),
        state === "skipped" && (inverse ? "bg-white/20 text-background" : "bg-surface-alt text-muted-foreground"),
        state === "current" && "bg-signal-strong text-background",
        state === "todo" && (inverse ? "border border-white/50" : "border border-line-strong text-muted-foreground"),
      )}
    >
      {state === "accepted" ? (
        <Check className="size-3" strokeWidth={2.25} aria-label="Accepted" />
      ) : state === "skipped" ? (
        <SkipForward className="size-3" strokeWidth={2} aria-label="Skipped" />
      ) : (
        number
      )}
    </span>
  );
}
