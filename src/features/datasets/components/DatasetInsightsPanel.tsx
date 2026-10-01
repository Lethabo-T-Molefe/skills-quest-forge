import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quietButtonClass } from "@/components";
import { canClean, useCurrentUser } from "@/features/auth";
import { notifyError } from "@/lib/notify";
import { decideInsight } from "../api/datasets";
import type { Dataset, DatasetInsight } from "../types";

const insightKindLabel: Record<DatasetInsight["kind"], string> = {
  quality: "Data quality",
  pattern: "Pattern",
  anomaly: "Anomaly",
};

const smallButton = `${quietButtonClass} px-3 py-1.5 text-xs`;

/** Insights found before anyone asked, each with the step that follows from it. */
export function DatasetInsightsList({ dataset }: { dataset: Dataset }) {
  const queryClient = useQueryClient();
  const dismiss = useMutation({
    mutationFn: (insight: DatasetInsight) => decideInsight(dataset.id, insight.id, "dismissed"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] }),
    onError: notifyError("The insight could not be dismissed."),
  });

  if (dataset.insights.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing unusual was found. The quality figures and columns are still worth a look before the
        data is used.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {dataset.insights.map((insight) => (
        <li key={insight.id} className="border-l-2 border-signal pl-4">
          <p className="text-xs text-muted-foreground">{insightKindLabel[insight.kind]}</p>
          <p className="mt-0.5 font-medium">{insight.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{insight.body}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <SuggestionLink dataset={dataset} insight={insight} />
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
              disabled={dismiss.isPending}
              onClick={() => dismiss.mutate(insight)}
            >
              Dismiss<span className="sr-only">: {insight.title}</span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SuggestionLink({ dataset, insight }: { dataset: Dataset; insight: DatasetInsight }) {
  const user = useCurrentUser();
  const target = insight.target?.value;

  if (insight.action === "clean") {
    if (!canClean(user)) {
      return (
        <p className="text-xs text-muted-foreground">
          Suggested fix: {insight.suggestion.toLowerCase()}.
        </p>
      );
    }
    return (
      <Link
        to="/clean/$datasetId"
        params={{ datasetId: dataset.id }}
        search={target ? { step: target } : {}}
        className={smallButton}
      >
        {insight.suggestion}
      </Link>
    );
  }

  // Analysis only runs on approved data, so say so rather than leading to a dead end.
  if (!dataset.queryable) {
    return (
      <p className="text-xs text-muted-foreground">
        {insight.suggestion}: available once this dataset is cleaned and approved.
      </p>
    );
  }
  if (insight.action === "monitor") {
    return (
      <Link to="/monitors" className={smallButton}>
        {insight.suggestion}
      </Link>
    );
  }
  if (insight.action === "ask") {
    return (
      <Link to="/analyse/ask" search={{ dataset: dataset.id }} className={smallButton}>
        {insight.suggestion}
      </Link>
    );
  }
  // A chart suggestion names one column to group by, or two measures to test against each other.
  const [first, second] = (target ?? "").split(",");
  return (
    <Link
      to="/analyse/build"
      search={
        second
          ? { dataset: dataset.id, method: "relationship", measure: first }
          : { dataset: dataset.id, method: "compare", dimension: first }
      }
      className={smallButton}
    >
      {insight.suggestion}
    </Link>
  );
}
