import { LayerStrip } from "@/components";
import type { Dataset } from "../types";

/** Where the data came from and which layers it has reached. */
export function DatasetLineagePanel({ dataset }: { dataset: Dataset }) {
  return (
    <div className="space-y-4">
      <ol className="space-y-2.5 text-sm">
        <li className="flex gap-3">
          <span className="w-16 shrink-0 text-muted-foreground">Bronze</span>
          <span>{dataset.sourceName} · raw, never changed</span>
        </li>
        <li className="flex gap-3">
          <span className="w-16 shrink-0 text-muted-foreground">Silver</span>
          <span className={dataset.layer === "bronze" ? "text-muted-foreground" : ""}>
            {dataset.layer === "bronze" ? "Not cleaned yet" : "Cleaned, typed, masked and deduplicated"}
          </span>
        </li>
        <li className="flex gap-3">
          <span className="w-16 shrink-0 text-muted-foreground">Gold</span>
          <span className={dataset.layer === "gold" ? "" : "text-muted-foreground"}>
            {dataset.layer === "gold" ? "Published for dashboards and metrics" : "Not promoted"}
          </span>
        </li>
      </ol>
      <LayerStrip current={dataset.layer} />
      <p className="text-xs text-muted-foreground">
        Every move between layers is recorded with a timestamp and the person who made it, so any figure can be traced
        back to this source.
      </p>
    </div>
  );
}
