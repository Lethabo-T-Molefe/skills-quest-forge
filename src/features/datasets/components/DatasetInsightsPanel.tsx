import { Link } from "@tanstack/react-router";
import { quietButtonClass } from "@/components";
import { canClean, useCurrentUser } from "@/features/auth";
import type { Dataset, DatasetInsight } from "../types";

/** Insights found before anyone asked, each with the step that follows from it. */
export function DatasetInsightsList({ dataset }: { dataset: Dataset }) {
  return (
    <ul className="space-y-4">
      {dataset.insights.map((insight) => (
        <li key={insight.title} className="border-l-2 border-signal pl-4">
          <p className="text-xs text-muted-foreground">{insightKindLabel[insight.kind]}</p>
          <p className="mt-0.5 font-medium">{insight.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{insight.body}</p>
          <div className="mt-2">
            <SuggestionLink dataset={dataset} insight={insight} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const insightKindLabel: Record<DatasetInsight["kind"], string> = {
  quality: "Data quality",
  pattern: "Pattern",
  anomaly: "Anomaly",
};

const smallButton = `${quietButtonClass} px-3 py-1.5 text-xs`;

function SuggestionLink({ dataset, insight }: { dataset: Dataset; insight: DatasetInsight }) {
  const user = useCurrentUser();
  const text = insight.suggestion.toLowerCase();
  const needsAnalysis = text.includes("chart") || text.includes("ask") || text.includes("monitor") || text.includes("root-cause");

  // Analysis only runs on approved data, so say so rather than leading to a dead end.
  if (needsAnalysis && dataset.status !== "approved") {
    return <p className="text-xs text-muted-foreground">{insight.suggestion}: available once this dataset is approved.</p>;
  }
  if (text.includes("chart")) {
    return (
      <Link to="/analyse/build" search={{ dataset: dataset.id, method: "compare" }} className={smallButton}>
        {insight.suggestion}
      </Link>
    );
  }
  if (text.includes("monitor")) {
    return (
      <Link to="/monitors" className={smallButton}>
        {insight.suggestion}
      </Link>
    );
  }
  if (text.includes("root-cause")) {
    return (
      <Link to="/analyse/build" search={{ dataset: dataset.id, method: "explain" }} className={smallButton}>
        {insight.suggestion}
      </Link>
    );
  }
  if (text.includes("ask")) {
    return (
      <Link to="/analyse/ask" search={{ dataset: dataset.id }} className={smallButton}>
        {insight.suggestion}
      </Link>
    );
  }
  if (!canClean(user)) {
    return <p className="text-xs text-muted-foreground">Suggested fix: {insight.suggestion.toLowerCase()}.</p>;
  }
  return (
    <Link to="/clean/$datasetId" params={{ datasetId: dataset.id }} className={smallButton}>
      {insight.suggestion}
    </Link>
  );
}
