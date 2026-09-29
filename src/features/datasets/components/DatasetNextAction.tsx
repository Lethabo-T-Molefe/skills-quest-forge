import { Link } from "@tanstack/react-router";
import { ArrowRight, Hourglass, Wand2 } from "lucide-react";
import { quietButtonClass, signalButtonClass } from "@/components";
import { useCurrentUser } from "@/features/auth";
import { cn } from "@/lib/utils";
import { nextStepFor } from "../journey";
import type { Dataset } from "../types";

/** The single next action for a dataset, rendered as the right kind of link for where it is. */
export function DatasetNextAction({
  dataset,
  emphasis = "primary",
  className,
}: {
  dataset: Dataset;
  emphasis?: "primary" | "quiet";
  className?: string;
}) {
  const user = useCurrentUser();
  const step = nextStepFor(dataset, user);
  const buttonClass = cn(emphasis === "primary" ? signalButtonClass : quietButtonClass, className);

  switch (step.kind) {
    case "clean":
      return (
        <Link to="/clean/$datasetId" params={{ datasetId: dataset.id }} className={buttonClass} title={step.reason}>
          <Wand2 className="size-4" strokeWidth={1.75} aria-hidden />
          {step.label}
        </Link>
      );
    case "view":
      return (
        <Link to="/datasets/$datasetId" params={{ datasetId: dataset.id }} className={buttonClass} title={step.reason}>
          {step.label}
        </Link>
      );
    case "approve":
      return (
        <Link to="/governance" className={buttonClass} title={step.reason}>
          {step.label}
          <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
        </Link>
      );
    case "analyse":
      return (
        <Link to="/analyse" search={{ dataset: dataset.id }} className={buttonClass} title={step.reason}>
          {step.label}
          <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
        </Link>
      );
    default:
      return (
        <span className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)} title={step.reason}>
          <Hourglass className="size-4" strokeWidth={1.5} aria-hidden />
          {step.label}
        </span>
      );
  }
}
