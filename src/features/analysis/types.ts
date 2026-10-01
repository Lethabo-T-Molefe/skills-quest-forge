export type MethodId = "summarise" | "compare" | "trend" | "relationship" | "explain" | "predict";
/** Methods the chart builder can run. Predict has its own guided scorer. */
export type BuildMethodId = Exclude<MethodId, "predict">;

/** The ways of working a person can choose between for the same question. */
export type AnalysisMode = "ask" | "build" | "code" | "guided";

export type MeasureUnit = "count" | "money" | "rate" | "decimal";

/** A number the analysis can compute, from the semantic layer (governed) or a column total. */
export interface MeasureDef {
  id: string;
  label: string;
  unit: MeasureUnit;
  /** Additive measures add up across groups. Ratios are a numerator over a denominator. */
  kind: "additive" | "ratio" | "distinct";
  description: string;
  governed: boolean;
  column: string | null;
  numerator: string | null;
  denominator: string | null;
  metricId: string | null;
}

export interface DimensionDef {
  id: string;
  label: string;
  column: string;
  /** Values largest group first, for filters and ordering. */
  values: string[];
}

export interface MonthOption {
  id: string;
  label: string;
  short: string;
}

/** An approved dataset the member may analyse, with the fields the semantic layer gives it. */
export interface AnalysisDataset {
  id: string;
  name: string;
  table: string;
  measures: MeasureDef[];
  dimensions: DimensionDef[];
  hasTime: boolean;
  months: MonthOption[];
  grains: { id: string; label: string }[];
  defaultMeasure: string;
}

export interface MethodTechnique {
  name: string;
  plain: string;
}

export interface AnalysisMethod {
  id: MethodId;
  name: string;
  /** The question this method answers, in the person's words. */
  question: string;
  description: string;
  techniques: MethodTechnique[];
  cautions: string[];
  examples: string[];
  modes: AnalysisMode[];
  /** Why a mode is not offered, shown instead of silently hiding it. */
  unavailable?: Partial<Record<AnalysisMode, string>>;
}

export interface BuildConfig {
  datasetId: string;
  method: BuildMethodId;
  measure: string;
  /** Second measure, used by the relationship method. */
  measureY: string;
  /** Group-by for compare, breakdown for explain. */
  dimension: string;
  /** Unit of observation for summarise and relationship, e.g. "region-month". */
  grain: string;
  /** Optional split into one line per group, for trend: a dimension id or "none". */
  split: string;
  from: string;
  to: string;
  /** Dimension id → the one value to keep. */
  filters: Record<string, string>;
  aggregation: "total" | "monthly-mean" | "monthly-median";
  rateMethod: "pooled" | "average";
  display: "value" | "share" | "index";
  sort: "desc" | "asc" | "name";
  centre: "median" | "mean";
  outliers: "include" | "exclude";
  change: "level" | "mom" | "cumulative";
  smoothing: "none" | "ma3";
  correlation: "pearson" | "spearman";
  periodA: string;
  periodB: string;
  /** Explain a change: show each group's change as an amount or as a percentage of its own starting value. */
  changeView: "amount" | "percent";
}

export interface ChartPoint {
  name: string;
  value: number | null;
}

/** How a number is written. The API describes it; the page formats with the shared helpers. */
export type ValueFormat =
  | { type: "measure"; unit: MeasureUnit }
  | { type: "compact"; unit: MeasureUnit }
  | { type: "percent"; digits: number }
  | { type: "delta"; unit: MeasureUnit }
  | { type: "share" }
  | { type: "index" }
  | { type: "count"; singular: string; plural: string }
  | { type: "number" };

export type AnalysisVisual =
  | { kind: "histogram"; bins: ChartPoint[] }
  | { kind: "bars"; points: ChartPoint[]; reference?: number }
  | { kind: "lines"; points: Record<string, number | string | null>[]; series: string[] }
  | {
      kind: "scatter";
      points: { name: string; x: number; y: number }[];
      fit: { x1: number; y1: number; x2: number; y2: number } | null;
      xLabel: string;
      yLabel: string;
      xUnit: MeasureUnit;
      yUnit: MeasureUnit;
    }
  | { kind: "contribution"; points: ChartPoint[] };

export interface AnalysisResult {
  title: string;
  /** One or two plain sentences with the main finding. */
  reading: string;
  /** How the numbers were produced, in plain language. */
  method: string;
  /** Caveats that apply to this particular result. */
  notes: string[];
  visual: AnalysisVisual;
  format: ValueFormat;
  axisFormat: ValueFormat;
  table: { columns: string[]; rows: (string | number)[][] };
  /** The analytical SQL behind the chart; it runs as-is in the workbench. */
  sql: string;
  sqlRunnable?: boolean;
  /** Whether a row policy limited the rows for this member's role. */
  rowPolicy?: boolean;
  empty?: boolean;
  /** Headline figures shown above the chart. */
  figures: { label: string; value: string; detail?: string }[];
  dataset?: { id: string; name: string; table: string };
  measureUnit?: MeasureUnit;
  config?: BuildConfig;
}

export interface AnalysisCatalogue {
  datasets: AnalysisDataset[];
}
