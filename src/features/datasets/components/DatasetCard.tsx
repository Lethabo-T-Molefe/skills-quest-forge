import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Chip } from "@/components";
import { layerMedia } from "@/config/media";
import { formatNumber } from "@/lib/format";
import { classificationLabel } from "../constants";
import type { Dataset } from "../types";

/** Catalogue tile linking to the dataset's detail page. */
export function DatasetCard({ dataset: d }: { dataset: Dataset }) {
  const cover = layerMedia[d.layer];

  return (
    <Link
      to="/datasets/$datasetId"
      params={{ datasetId: d.id }}
      className="group bg-surface-raised transition-colors hover:bg-surface-alt"
    >
      <div className="aspect-[16/9] overflow-hidden bg-surface-alt">
        <img src={cover.src} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-paren">({d.source === "upload" ? "upload" : "connector"})</p>
            <h2 className="heading-2 mt-1">{d.name}</h2>
          </div>
          <Chip tone={d.status === "approved" ? "ok" : "warn"}>{d.status}</Chip>
        </div>
        <p className="mt-3 max-w-[60ch] text-sm text-muted-foreground">{d.description}</p>

        <dl className="num mt-5 grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Rows</dt>
            <dd>{formatNumber(d.rows)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Completeness</dt>
            <dd>{d.quality.completeness}%</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Updated</dt>
            <dd className="font-sans">{d.updated}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip>{d.layer}</Chip>
          <Chip tone={d.classification === "restricted-personal" ? "signal" : "neutral"}>
            <ShieldCheck className="size-3.5" strokeWidth={1.75} />
            {classificationLabel[d.classification]}
          </Chip>
          <span className="text-xs text-muted-foreground">{d.sourceName}</span>
        </div>
      </div>
    </Link>
  );
}
