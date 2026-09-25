import { Panel } from "@/components";
import type { Dataset } from "../types";

export function DatasetLineagePanel({ dataset }: { dataset: Dataset }) {
  return (
    <Panel>
      <h2 className="heading-2">Lineage</h2>
      <ol className="mt-4 space-y-3 text-sm">
        <li className="flex gap-3">
          <span className="num w-16 shrink-0 text-muted-foreground">bronze</span>
          <span>{dataset.sourceName} · raw, immutable</span>
        </li>
        <li className="flex gap-3">
          <span className="num w-16 shrink-0 text-muted-foreground">silver</span>
          <span className={dataset.layer === "bronze" ? "text-muted-foreground" : ""}>
            {dataset.layer === "bronze" ? "Not cleaned yet" : "Cleaned, typed, masked, deduplicated"}
          </span>
        </li>
        <li className="flex gap-3">
          <span className="num w-16 shrink-0 text-muted-foreground">gold</span>
          <span className={dataset.layer === "gold" ? "" : "text-muted-foreground"}>
            {dataset.layer === "gold" ? "Published for dashboards and metrics" : "Not promoted"}
          </span>
        </li>
      </ol>
    </Panel>
  );
}
