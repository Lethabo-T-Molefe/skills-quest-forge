import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileDown, PlayCircle, ShieldCheck } from "lucide-react";
import { Field, Notice, QuietButton, SignalButton, TextArea } from "@/components";
import { notifyError } from "@/lib/notify";
import {
  approveModel,
  exportModelCard,
  refreshModels,
  rejectModel,
  retireModel,
  scoreRecords,
} from "../api/models";
import type { ModelDetail } from "../types";

/**
 * The decision on a model version. Approving is a second person's job: whoever built or trained it cannot
 * approve it, and a flag from the fairness audit needs a written note.
 */
export function ApprovalPanel({ model }: { model: ModelDetail }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const flagged = model.fairnessFlagged;
  const done = async (message: string) => {
    await refreshModels(queryClient);
    toast.success(message);
  };

  const approve = useMutation({
    mutationFn: () => approveModel(model.id, note),
    onSuccess: () => done(`${model.label} is approved for use`),
    onError: notifyError("The model could not be approved."),
  });
  const reject = useMutation({
    mutationFn: () => rejectModel(model.id, note),
    onSuccess: () => done(`${model.label} was rejected`),
    onError: notifyError("The model could not be rejected."),
  });
  const retire = useMutation({
    mutationFn: () => retireModel(model.id, note),
    onSuccess: () => done(`${model.label} is retired`),
    onError: notifyError("The model could not be retired."),
  });
  const score = useMutation({
    mutationFn: () => scoreRecords(model.id),
    onSuccess: async (run) => {
      await refreshModels(queryClient);
      toast.success(`Scored ${run.rows.toLocaleString()} records`, {
        description: `${run.flagged.toLocaleString()} flagged · drift ${run.drift?.status ?? "not measured"}`,
      });
    },
    onError: notifyError("The records could not be scored."),
  });
  const busy = approve.isPending || reject.isPending || retire.isPending;

  return (
    <div className="space-y-5">
      {model.status === "draft" ? (
        model.canApprove ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              approve.mutate();
            }}
          >
            <Field
              label={
                flagged
                  ? "Decision note (required: the fairness audit raised a flag)"
                  : "Decision note"
              }
              hint="Why it may be used, or why not. It is kept with the version and shown to its author."
            >
              <TextArea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <SignalButton type="submit" disabled={busy || (flagged && note.trim().length < 20)}>
                <ShieldCheck className="size-4" strokeWidth={1.75} aria-hidden />
                Approve for use
              </SignalButton>
              <QuietButton
                type="button"
                disabled={busy || !note.trim()}
                onClick={() => reject.mutate()}
              >
                Reject
              </QuietButton>
            </div>
          </form>
        ) : (
          <Notice tone="info" title="Waiting for review">
            {model.isAuthor
              ? "You built this version, so someone else (a Data Steward, an Administrator or another Model Curator) reviews and approves it."
              : "A Data Steward, an Administrator or a Model Curator who did not build it decides whether it may be used."}
          </Notice>
        )
      ) : (
        <Notice
          tone={model.status === "active" ? "ok" : "info"}
          title={
            model.status === "active"
              ? `Approved${model.approvedBy ? ` by ${model.approvedBy}` : ""}`
              : model.status === "rejected"
                ? "Rejected"
                : "Retired"
          }
        >
          {model.decisionNote ?? "No note was recorded."}
        </Notice>
      )}

      <div className="flex flex-wrap gap-2">
        {model.canScore ? (
          <SignalButton disabled={score.isPending} onClick={() => score.mutate()}>
            <PlayCircle className="size-4" strokeWidth={1.75} aria-hidden />
            {score.isPending ? "Scoring…" : "Score current records"}
          </SignalButton>
        ) : null}
        <QuietButton onClick={() => void exportModelCard(model.id)}>
          <FileDown className="size-4" strokeWidth={1.5} aria-hidden />
          Model card (PDF)
        </QuietButton>
        {model.status === "active" && model.canScore ? (
          <QuietButton disabled={busy} onClick={() => retire.mutate()}>
            Retire this version
          </QuietButton>
        ) : null}
      </div>
      {model.lastScoring ? (
        <p className="text-xs text-muted-foreground">
          Last scored {new Date(model.lastScoring.at).toLocaleString()}:{" "}
          {model.lastScoring.rows.toLocaleString()} records,{" "}
          {model.lastScoring.flagged.toLocaleString()} flagged.
        </p>
      ) : null}
    </div>
  );
}
