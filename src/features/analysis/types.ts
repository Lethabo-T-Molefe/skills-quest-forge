export type MethodId = "summarise" | "compare" | "trend" | "relationship" | "explain" | "predict";
/** Methods the chart builder can run. Predict has its own guided scorer. */
export type BuildMethodId = Exclude<MethodId, "predict">;

/** The ways of working a person can choose between for the same question. */
export type AnalysisMode = "ask" | "build" | "code" | "guided";

export type DimensionId = "region" | "course" | "month";
export type MeasureId =
  | "enrolments"
  | "completions"
  | "revenue"
  | "completion_rate"
  | "avg_fee"
  | "sessions_per_learner";

/** The unit of observation for summaries and relationships, for example one region in one month. */
export type UnitGrain = "region" | "course" | "month" | "region-month" | "course-month" | "region-course";

export interface FactRow {
  region: string;
  course: string;
  month: string;
  enrolments: number;
  completions: number;
  revenue: number;
  sessions: number;
}

export type AdditiveColumn = "enrolments" | "completions" | "revenue" | "sessions";
export type MeasureUnit = "count" | "money" | "rate" | "decimal";

export interface MeasureDef {
  id: MeasureId;
  label: string;
  unit: MeasureUnit;
  description: string;
  /** Additive measures add up across rows. Ratios are a numerator over a denominator. */
  kind: "additive" | "ratio";
  column?: AdditiveColumn;
  numerator?: AdditiveColumn;
  denominator?: AdditiveColumn;
}

export interface AnalysisDataset {
  id: string;
  name: string;
  table: string;
  measures: MeasureId[];
  dimensions: DimensionId[];
  defaultMeasure: MeasureId;
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
  measure: MeasureId;
  /** Second measure, used by the relationship method. */
  measureY: MeasureId;
  /** Group-by for compare, breakdown for explain. */
  dimension: DimensionId;
  /** Unit of observation for summarise and relationship. */
  grain: UnitGrain;
  /** Optional split into one line per group, for trend. */
  split: "none" | "region" | "course";
  from: string;
  to: string;
  region: string;
  course: string;
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

export interface SummaryStats {
  n: number;
  excluded: number;
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
}

export interface ChartPoint {
  name: string;
  value: number | null;
}

export type AnalysisVisual =
  | { kind: "histogram"; bins: ChartPoint[] }
  | { kind: "bars"; points: ChartPoint[]; reference?: number }
  | { kind: "lines"; points: Array<Record<string, number | string | null>>; series: string[] }
  | {
      kind: "scatter";
      points: { name: string; x: number; y: number }[];
      fit: { x1: number; y1: number; x2: number; y2: number } | null;
      xLabel: string;
      yLabel: string;
      formatX: (value: number) => string;
      formatY: (value: number) => string;
      axisX: (value: number) => string;
      axisY: (value: number) => string;
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
  /** Formats a raw chart value in full, for tooltips and tables. */
  format: (value: number) => string;
  /** Formats a raw chart value briefly, for axis ticks. */
  axisFormat: (value: number) => string;
  table: { columns: string[]; rows: (string | number)[][] };
  sql: string;
  /** Headline figures shown above the chart. */
  figures: { label: string; value: string; detail?: string }[];
}
