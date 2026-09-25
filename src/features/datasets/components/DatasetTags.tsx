import { ShieldCheck } from "lucide-react";
import { Chip } from "@/components";
import { classificationLabel } from "../constants";
import type { Dataset } from "../types";

export function DatasetTags({ dataset }: { dataset: Dataset }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip>{dataset.layer} layer</Chip>
      <Chip tone={dataset.status === "approved" ? "ok" : "warn"}>{dataset.status}</Chip>
      <Chip tone={dataset.classification === "restricted-personal" ? "signal" : "neutral"}>
        <ShieldCheck className="size-3.5" strokeWidth={1.75} />
        {classificationLabel[dataset.classification]}
      </Chip>
      <Chip>Owner · {dataset.owner}</Chip>
      <Chip>{dataset.sourceName}</Chip>
    </div>
  );
}
