import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Drawer, Field, QuietButton, SignalButton, TextArea } from "@/components";
import { notifyError } from "@/lib/notify";
import { approveDataset, refreshDatasets, rejectDataset } from "../api/datasets";
import type { Dataset } from "../types";

type Decision = "approve" | "reject";

/**
 * A steward's decision on a dataset. Approval makes the cleaned table readable for analysis; rejection needs
 * a reason so the owner knows what to fix. Both are written to the audit trail with the reason.
 */
export function DatasetDecision({
  dataset,
  size = "md",
}: {
  dataset: Pick<Dataset, "id" | "name" | "layer" | "status" | "classificationLabel">;
  size?: "sm" | "md";
}) {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState("");
  const raw = dataset.layer === "bronze";
  const small = size === "sm" ? "px-3.5 py-1.5 text-xs" : "";

  const decide = useMutation({
    mutationFn: (kind: Decision) =>
      kind === "approve"
        ? approveDataset(dataset.id, reason.trim())
        : rejectDataset(dataset.id, reason.trim()),
    onSuccess: async (_result, kind) => {
      await refreshDatasets(queryClient);
      setDecision(null);
      setReason("");
      if (kind === "approve") {
        toast.success(`${dataset.name} approved`, {
          description: "It can now be analysed by everyone permitted to see it.",
        });
      } else {
        toast.success(`${dataset.name} rejected`, {
          description: "The owner can see the reason on the dataset.",
        });
      }
    },
    onError: notifyError("The decision could not be saved."),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (decision) decide.mutate(decision);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {dataset.status !== "rejected" ? (
          <QuietButton className={small} onClick={() => setDecision("reject")}>
            Reject
          </QuietButton>
        ) : null}
        {raw ? (
          <span className="text-xs text-muted-foreground">Clean it before it can be approved.</span>
        ) : dataset.status !== "approved" ? (
          <SignalButton className={small} onClick={() => setDecision("approve")}>
            Approve
          </SignalButton>
        ) : null}
      </div>

      <Drawer
        open={decision !== null}
        title={decision === "approve" ? `Approve ${dataset.name}` : `Reject ${dataset.name}`}
        onClose={() => setDecision(null)}
      >
        <form className="space-y-4" onSubmit={submit}>
          <p className="text-sm text-muted-foreground">
            {decision === "approve"
              ? `Approval makes the cleaned table available for analysis. Its classification stays ${dataset.classificationLabel.toLowerCase()}, and personal columns stay masked.`
              : "Rejecting stops anyone from analysing this dataset until it is cleaned again and approved."}
          </p>
          <Field
            label={decision === "approve" ? "What you checked (optional)" : "Reason"}
            hint={
              decision === "approve"
                ? "Recorded with the decision in the audit trail."
                : "The owner sees this, so say what needs fixing."
            }
          >
            <TextArea
              rows={4}
              className="font-sans"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={
                decision === "approve"
                  ? "Quality profile reviewed, classification correct"
                  : "Region is blank in a third of rows"
              }
              required={decision === "reject"}
              maxLength={2000}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <SignalButton type="submit" disabled={decide.isPending}>
              {decide.isPending
                ? "Saving…"
                : decision === "approve"
                  ? "Approve for analysis"
                  : "Reject the dataset"}
            </SignalButton>
            <QuietButton onClick={() => setDecision(null)}>Cancel</QuietButton>
          </div>
        </form>
      </Drawer>
    </>
  );
}
