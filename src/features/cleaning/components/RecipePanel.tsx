import { Chip, HelpTip, Panel } from "@/components";
import type { RecipeStep } from "../types";

export function RecipePanel({ steps }: { steps: RecipeStep[] }) {
  return (
    <Panel>
      <h2 className="heading-2">Recipe so far</h2>
      {steps.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No steps accepted yet. The profile is the first artefact.</p>
      ) : (
        <ol className="mt-4 space-y-3 text-sm">
          {steps.map((item, index) => (
            <li key={`${item.stepId}-${index}`} className="flex items-start justify-between gap-3">
              <span>
                <span className="num text-muted-foreground">{index + 1}. </span>
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
          The recipe is a first-class artefact. Share it, version it, or rerun it on a new upload of the same source.
          Bronze stays immutable.
        </HelpTip>
      </div>
    </Panel>
  );
}
