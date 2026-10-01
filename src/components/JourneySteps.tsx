import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepState = "done" | "current" | "todo";

export interface JourneyStep {
  label: string;
  detail?: string;
  state: StepState;
}

/** A compact horizontal progress line, so people can see where they are in a multi-step journey. */
export function JourneySteps({ steps, className }: { steps: JourneyStep[]; className?: string }) {
  return (
    <ol className={cn("flex flex-wrap items-start gap-x-2 gap-y-3", className)}>
      {steps.map((step, index) => (
        <li
          key={step.label}
          className="flex min-w-0 items-start gap-2"
          aria-current={step.state === "current" ? "step" : undefined}
        >
          <span
            className={cn(
              "num mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
              step.state === "done" && "bg-surface-inverse text-background",
              step.state === "current" && "bg-signal-strong text-background",
              step.state === "todo" && "border border-line-strong text-muted-foreground",
            )}
          >
            {step.state === "done" ? (
              <Check className="size-3.5" strokeWidth={2} aria-label="Done" />
            ) : (
              index + 1
            )}
          </span>
          <span className="min-w-0">
            <span
              className={cn(
                "block text-sm",
                step.state === "todo" ? "text-muted-foreground" : "font-medium",
              )}
            >
              {step.label}
            </span>
            {step.detail ? (
              <span className="block text-xs text-muted-foreground">{step.detail}</span>
            ) : null}
          </span>
          {index < steps.length - 1 ? (
            <span aria-hidden className="mt-3 hidden h-px w-6 shrink-0 bg-line-strong sm:block" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
