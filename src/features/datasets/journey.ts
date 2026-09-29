import type { JourneyStep } from "@/components";
import { canApprove, canClean, type CurrentUser } from "@/features/auth";
import type { Dataset } from "./types";

/**
 * Where a dataset is on the path from raw file to analysis, and the one thing to do next.
 * Every screen that shows a dataset uses this, so the next step is always described the same way.
 */

export type NextStepKind = "clean" | "view" | "approve" | "wait" | "rejected" | "analyse";

export interface NextStep {
  kind: NextStepKind;
  label: string;
  /** One sentence on why this is the next step. */
  reason: string;
}

export function nextStepFor(dataset: Dataset, user: CurrentUser): NextStep {
  if (dataset.status === "rejected") {
    return { kind: "rejected", label: "Rejected", reason: "A steward rejected this dataset. The reason is on its record." };
  }
  if (dataset.layer === "bronze") {
    return canClean(user)
      ? { kind: "clean", label: "Clean this data", reason: "It is still raw. Clean it before it can be approved and analysed." }
      : { kind: "view", label: "View the quality profile", reason: "It is still raw and waiting to be cleaned." };
  }
  if (dataset.status === "pending") {
    return canApprove(user)
      ? { kind: "approve", label: "Review and approve", reason: "It is cleaned and waiting for your decision." }
      : { kind: "wait", label: "Waiting for approval", reason: "It is cleaned. A steward must approve it before it can be analysed." };
  }
  return { kind: "analyse", label: "Analyse this data", reason: "It is approved and ready to analyse." };
}

/** The four stages every dataset passes through, with where this one is now. */
export function journeyFor(dataset: Dataset): JourneyStep[] {
  const cleaned = dataset.layer !== "bronze";
  const approved = dataset.status === "approved";
  return [
    {
      label: "Brought in",
      detail: dataset.source === "upload" ? "Uploaded file" : "Connected source",
      state: "done",
    },
    { label: "Cleaned", detail: cleaned ? `${dataset.layer} layer` : "Still raw", state: cleaned ? "done" : "current" },
    {
      label: "Approved",
      detail: approved ? "By a steward" : dataset.status === "rejected" ? "Rejected" : "Not yet",
      state: approved ? "done" : cleaned ? "current" : "todo",
    },
    { label: "Analysed and shared", detail: approved ? "Ready now" : "After approval", state: approved ? "current" : "todo" },
  ];
}
