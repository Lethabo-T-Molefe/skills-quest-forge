import type { AnalysisDataset, DimensionId, MeasureDef, MeasureId, UnitGrain } from "../types";

export const measures: Record<MeasureId, MeasureDef> = {
  enrolments: {
    id: "enrolments",
    label: "Enrolments",
    unit: "count",
    kind: "additive",
    column: "enrolments",
    description: "Number of course enrolments.",
  },
  completions: {
    id: "completions",
    label: "Completions",
    unit: "count",
    kind: "additive",
    column: "completions",
    description: "Number of enrolments that ended in a completion.",
  },
  revenue: {
    id: "revenue",
    label: "Revenue",
    unit: "money",
    kind: "additive",
    column: "revenue",
    description: "Approved fees paid, in rand.",
  },
  completion_rate: {
    id: "completion_rate",
    label: "Completion rate",
    unit: "rate",
    kind: "ratio",
    numerator: "completions",
    denominator: "enrolments",
    description: "Completions divided by enrolments, the shared metric definition.",
  },
  avg_fee: {
    id: "avg_fee",
    label: "Average fee",
    unit: "money",
    kind: "ratio",
    numerator: "revenue",
    denominator: "enrolments",
    description: "Revenue divided by enrolments.",
  },
  sessions_per_learner: {
    id: "sessions_per_learner",
    label: "Sessions per learner",
    unit: "decimal",
    kind: "ratio",
    numerator: "sessions",
    denominator: "enrolments",
    description: "Learning sessions logged, divided by enrolments.",
  },
};

export const dimensionLabels: Record<DimensionId, string> = {
  region: "Region",
  course: "Course",
  month: "Month",
};

export const grainLabels: Record<UnitGrain, string> = {
  region: "Each region",
  course: "Each course",
  month: "Each month",
  "region-month": "Each region in each month",
  "course-month": "Each course in each month",
  "region-course": "Each course in each region",
};

/** Column headings for a unit of observation in result tables. */
export const grainColumnLabels: Record<UnitGrain, string> = {
  region: "Region",
  course: "Course",
  month: "Month",
  "region-month": "Region · month",
  "course-month": "Course · month",
  "region-course": "Region · course",
};

export function grainDimensions(grain: UnitGrain): DimensionId[] {
  return grain.split("-") as DimensionId[];
}

/** The approved datasets the analysis tools can read, and the fields each one exposes. */
export const analysisDatasets: AnalysisDataset[] = [
  {
    id: "course-completions",
    name: "Course completions",
    table: "silver.course_completions",
    measures: ["enrolments", "completions", "completion_rate", "sessions_per_learner"],
    dimensions: ["region", "course", "month"],
    defaultMeasure: "completion_rate",
  },
  {
    id: "regional-revenue",
    name: "Regional revenue",
    table: "gold.revenue_by_region",
    measures: ["revenue", "enrolments", "avg_fee"],
    dimensions: ["region", "month"],
    defaultMeasure: "revenue",
  },
];

export function getAnalysisDataset(id: string | undefined) {
  return analysisDatasets.find((item) => item.id === id);
}

/** Grains a dataset can support, given the dimensions it exposes. */
export function grainsFor(dataset: AnalysisDataset): UnitGrain[] {
  const all: UnitGrain[] = ["region-month", "course-month", "region-course", "region", "course", "month"];
  return all.filter((grain) => grainDimensions(grain).every((dim) => dataset.dimensions.includes(dim)));
}
