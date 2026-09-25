import { Link } from "@tanstack/react-router";
import { Panel, quietButtonClass } from "@/components";
import type { Dataset } from "../types";

export function DatasetInsightsPanel({ dataset }: { dataset: Dataset }) {
  return (
    <Panel>
      <p className="label-paren">(before you ask)</p>
      <h2 className="heading-2 mt-1">What we noticed</h2>
      <ul className="mt-4 space-y-5">
        {dataset.insights.map((i) => (
          <li key={i.title} className="border-l-2 border-signal pl-4">
            <p className="text-xs text-muted-foreground">{i.kind}</p>
            <p className="mt-0.5 font-medium">{i.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{i.body}</p>
            <div className="mt-2">
              <SuggestionLink datasetId={dataset.id} suggestion={i.suggestion} />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function SuggestionLink({ datasetId, suggestion }: { datasetId: string; suggestion: string }) {
  const text = suggestion.toLowerCase();
  if (text.includes("chart")) {
    return (
      <Link to="/explorer" search={{ dataset: datasetId }} className={quietButtonClass}>
        {suggestion}
      </Link>
    );
  }
  if (text.includes("monitor") || text.includes("root-cause")) {
    return (
      <Link to="/monitors" className={quietButtonClass}>
        {suggestion}
      </Link>
    );
  }
  if (text.includes("ask")) {
    return (
      <Link to="/assistant" className={quietButtonClass}>
        {suggestion}
      </Link>
    );
  }
  return (
    <Link to="/datasets/$datasetId/clean" params={{ datasetId }} className={quietButtonClass}>
      {suggestion}
    </Link>
  );
}
