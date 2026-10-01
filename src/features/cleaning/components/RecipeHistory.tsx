import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, CodeBlock, HelpTip, Notice, QuietButton } from "@/components";
import { errorMessage } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { notifyError } from "@/lib/notify";
import { recipeHistoryQuery, rerunRecipe } from "../api/cleaning";
import type { CleaningRecipe, CleaningRun } from "../types";

/**
 * Every saved version of a dataset's recipe. An applied recipe can be rerun on the current raw data: the
 * same input and the same recipe give the same checksum, which is how a cleaned table is shown to be reproducible.
 */
export function RecipeHistory({
  datasetId,
  canEdit,
  onRerun,
}: {
  datasetId: string;
  canEdit: boolean;
  onRerun: (run: CleaningRun) => void;
}) {
  const queryClient = useQueryClient();
  const history = useQuery(recipeHistoryQuery(datasetId));

  const rerun = useMutation({
    mutationFn: (recipe: CleaningRecipe) => rerunRecipe(datasetId, recipe.id),
    onSuccess: async (run) => {
      await Promise.all(
        [["cleaning"], ["datasets"], ["analysis"], ["audit"]].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
      if (run.reproduced) {
        toast.success("Reproduced exactly", {
          description: "The output matches the earlier run, checksum for checksum.",
        });
      } else {
        toast.success(`Recipe rerun as version ${run.recipe.version}`, {
          description: run.note ?? "The cleaned table was rewritten and needs approval again.",
        });
      }
      onRerun(run);
    },
    onError: notifyError("The recipe could not be rerun."),
  });

  if (history.isPending) return <p className="text-sm text-muted-foreground">Loading recipes…</p>;
  if (history.isError) {
    return (
      <Notice tone="signal" title="The recipes did not load">
        {errorMessage(history.error)}
      </Notice>
    );
  }
  if (history.data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No recipe has been saved yet. Accept a step and it appears here.
      </p>
    );
  }

  return (
    <ul className="space-y-5">
      {history.data.map((recipe) => {
        const accepted = recipe.steps.filter((step) => step.status === "accepted");
        return (
          <li key={recipe.id} className="border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">Version {recipe.version}</p>
              <Chip tone={recipe.status === "applied" ? "ok" : "warn"}>
                {recipe.status === "applied" ? "Applied" : "Draft"}
              </Chip>
            </div>
            <p className="num mt-1 text-xs text-muted-foreground">
              {accepted.length} {accepted.length === 1 ? "step" : "steps"} · saved {recipe.saved}
              {recipe.outputRows !== null
                ? ` · ${formatNumber(recipe.outputRows)} rows in ${recipe.outputTable}`
                : ""}
            </p>
            {accepted.length > 0 ? (
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
                {accepted.map((step) => (
                  <li key={step.stepId}>
                    {step.option}
                    <span className="block text-xs text-muted-foreground">{step.summary}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            {recipe.outputChecksum ? (
              <p className="mt-3 text-xs break-all text-muted-foreground">
                Output checksum {recipe.outputChecksum}
              </p>
            ) : null}
            <div className="mt-3">
              <HelpTip title="Show the whole recipe as code">
                <CodeBlock code={recipe.code} label={`Recipe v${recipe.version}`} />
              </HelpTip>
            </div>
            {recipe.status === "applied" && canEdit ? (
              <QuietButton
                className="mt-3 px-3 py-1.5 text-xs"
                disabled={rerun.isPending}
                onClick={() => rerun.mutate(recipe)}
              >
                {rerun.isPending && rerun.variables?.id === recipe.id
                  ? "Rerunning on the full data…"
                  : "Rerun on the current raw data"}
              </QuietButton>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
