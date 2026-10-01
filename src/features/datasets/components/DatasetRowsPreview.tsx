import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Notice, ResultTable, Segmented } from "@/components";
import { errorMessage } from "@/lib/api";
import { datasetRowsQuery } from "../api/datasets";
import type { Dataset, Layer } from "../types";

const order: Layer[] = ["bronze", "silver", "gold"];

/** The first rows of a dataset, in any layer it has reached. Personal columns are masked in every layer. */
export function DatasetRowsPreview({ dataset }: { dataset: Dataset }) {
  const reached = order.slice(0, order.indexOf(dataset.layer) + 1);
  const [layer, setLayer] = useState<Layer>(dataset.layer);
  const shown = reached.includes(layer) ? layer : dataset.layer;
  const rows = useQuery(datasetRowsQuery(dataset.id, shown));

  return (
    <div className="space-y-3">
      {reached.length > 1 ? (
        <Segmented
          label="Layer"
          size="sm"
          value={shown}
          onValueChange={setLayer}
          options={reached.map((item) => ({
            value: item,
            label: item === "bronze" ? "Raw" : item === "silver" ? "Cleaned" : "Gold",
          }))}
        />
      ) : null}
      {rows.isPending ? (
        <p className="text-sm text-muted-foreground">Loading rows…</p>
      ) : rows.isError ? (
        <Notice tone="signal" title="The rows did not load">
          {errorMessage(rows.error)}
        </Notice>
      ) : rows.data.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">This table has no rows.</p>
      ) : (
        <>
          <ResultTable columns={rows.data.columns} rows={rows.data.rows} />
          <p className="text-xs text-muted-foreground">
            The first {rows.data.rows.length} rows of {rows.data.table}.
            {rows.data.masked.length > 0
              ? ` Masked as personal information: ${rows.data.masked.join(", ")}.`
              : ""}
          </p>
        </>
      )}
    </div>
  );
}
