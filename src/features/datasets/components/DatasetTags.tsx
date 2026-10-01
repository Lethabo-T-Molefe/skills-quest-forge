import { ShieldCheck } from "lucide-react";
import { Chip } from "@/components";
import { statusLabel, visibilityLabel } from "../constants";
import type { Dataset } from "../types";

export function DatasetTags({ dataset }: { dataset: Dataset }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip>{dataset.layerLabel}</Chip>
      <Chip
        tone={
          dataset.status === "approved" ? "ok" : dataset.status === "rejected" ? "signal" : "warn"
        }
      >
        {statusLabel[dataset.status]}
      </Chip>
      <Chip tone={dataset.classification === "restricted-personal" ? "signal" : "neutral"}>
        <ShieldCheck className="size-3.5" strokeWidth={1.75} aria-hidden />
        {dataset.classificationLabel}
      </Chip>
      <Chip>Owner · {dataset.owner}</Chip>
      <Chip>Visible to · {visibilityLabel[dataset.visibility].toLowerCase()}</Chip>
      <Chip>Version {dataset.version}</Chip>
    </div>
  );
}
