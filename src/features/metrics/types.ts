import type { MeasureUnit } from "@/features/analysis";

export interface MetricSummary {
  name: string;
  key: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  definition: string;
  /** The month the value is for, e.g. "Mar 2026". */
  month: string;
  datasetId: string;
}

/** How a metric is computed: a column total, a row count, a count of distinct values, or one total over another. */
export type MetricKind = "additive" | "count" | "distinct" | "ratio";

export interface MetricDefinition {
  id: string;
  /** The name used in SQL and by the assistant. */
  key: string;
  name: string;
  owner: string;
  ownerId: string | null;
  expression: string;
  description: string;
  /** How many charts, monitors and model factors use it. */
  usedBy: number;
  grain: string;
  status: "published" | "draft";
  unit: MeasureUnit;
  kind: MetricKind;
  column: string | null;
  numerator: string | null;
  denominator: string | null;
  synonyms: string[];
  version: number;
  /** Approved datasets that have the columns this metric needs. */
  datasets: string[];
  publishedAt: string | null;
}

export interface MetricDraft {
  name: string;
  description: string;
  kind: MetricKind;
  unit: MeasureUnit;
  column?: string;
  numerator?: string;
  denominator?: string;
  synonyms: string[];
}
