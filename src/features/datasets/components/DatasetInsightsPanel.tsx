import { Panel, QuietButton } from "@/components";
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
            <div className="mt-2 flex gap-2">
              <QuietButton>{i.suggestion}</QuietButton>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
