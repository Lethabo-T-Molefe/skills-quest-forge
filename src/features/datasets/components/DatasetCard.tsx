import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Chip } from "@/components";
import { useCurrentUser } from "@/features/auth";
import { formatNumber } from "@/lib/format";
import { classificationLabel, layerLabels } from "../constants";
import { nextStepFor } from "../journey";
import type { Dataset } from "../types";
import { DatasetNextAction } from "./DatasetNextAction";

/** Catalogue tile: what the dataset is, where it is on the path, and its next step. */
export function DatasetCard({ dataset: d }: { dataset: Dataset }) {
  const user = useCurrentUser();
  const step = nextStepFor(d, user);

  return (
    <article className="flex flex-col bg-surface-raised p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl leading-snug">
            <Link
              to="/datasets/$datasetId"
              params={{ datasetId: d.id }}
              className="underline-offset-4 hover:underline"
            >
              {d.name}
            </Link>
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.description}</p>
        </div>
        <Chip tone={d.status === "approved" ? "ok" : d.status === "rejected" ? "signal" : "warn"}>{d.status}</Chip>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Chip>{layerLabels[d.layer]}</Chip>
        <Chip tone={d.classification === "restricted-personal" ? "signal" : "neutral"}>
          <ShieldCheck className="size-3.5" strokeWidth={1.75} aria-hidden />
          {classificationLabel[d.classification]}
        </Chip>
        <span className="num text-xs text-muted-foreground">
          {formatNumber(d.rows)} rows · {d.quality.completeness}% complete · updated {d.updated}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
        <p className="text-xs text-muted-foreground">{step.reason}</p>
        <div className="flex items-center gap-2">
          <Link
            to="/datasets/$datasetId"
            params={{ datasetId: d.id }}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Details
          </Link>
          <DatasetNextAction dataset={d} emphasis="quiet" />
        </div>
      </div>
    </article>
  );
}
