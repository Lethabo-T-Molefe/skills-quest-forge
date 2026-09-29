import { MONTHS } from "../data/facts";
import { analysisDatasets, getAnalysisDataset, grainsFor, measures } from "../data/schemas";
import type { AnalysisDataset, BuildConfig, BuildMethodId, DimensionId, MeasureId } from "../types";

const firstMonth = MONTHS[0].id;
const lastMonth = MONTHS[MONTHS.length - 1]!.id;
const previousMonth = MONTHS[MONTHS.length - 2]!.id;

export interface BuildPresets {
  measure?: string | undefined;
  dimension?: string | undefined;
}

/** Measures a method can use on a dataset. Explaining a change needs a total, so rates are left out. */
export function measuresFor(dataset: AnalysisDataset, method: BuildMethodId): MeasureId[] {
  return method === "explain"
    ? dataset.measures.filter((id) => measures[id].kind === "additive")
    : dataset.measures;
}

/** Group-by choices: the categorical dimensions (month is handled by trend and explain). */
export function groupDimensionsFor(dataset: AnalysisDataset): DimensionId[] {
  return dataset.dimensions.filter((dim) => dim !== "month");
}

function pickMeasure(dataset: AnalysisDataset, method: BuildMethodId, wanted?: string): MeasureId {
  const allowed = measuresFor(dataset, method);
  if (wanted && (allowed as string[]).includes(wanted)) return wanted as MeasureId;
  if (allowed.includes(dataset.defaultMeasure)) return dataset.defaultMeasure;
  return allowed[0] ?? dataset.defaultMeasure;
}

function secondMeasure(dataset: AnalysisDataset, first: MeasureId): MeasureId {
  const preferred: Partial<Record<MeasureId, MeasureId>> = {
    completion_rate: "sessions_per_learner",
    sessions_per_learner: "completion_rate",
    revenue: "enrolments",
    enrolments: "avg_fee",
    avg_fee: "enrolments",
  };
  const wanted = preferred[first];
  if (wanted && dataset.measures.includes(wanted)) return wanted;
  return dataset.measures.find((id) => id !== first) ?? first;
}

/**
 * A meaningful default pair for the relationship method, x being the likely driver.
 * (Revenue against enrolments would be trivially strong, since revenue is enrolments × fee.)
 */
function relationshipPair(dataset: AnalysisDataset): [MeasureId, MeasureId] {
  const pairs: [MeasureId, MeasureId][] = [
    ["sessions_per_learner", "completion_rate"],
    ["enrolments", "avg_fee"],
  ];
  const pair = pairs.find(([x, y]) => dataset.measures.includes(x) && dataset.measures.includes(y));
  if (pair) return pair;
  const first = dataset.defaultMeasure;
  return [first, secondMeasure(dataset, first)];
}

/** Sensible starting settings for a method on a dataset, optionally seeded from a link. */
export function defaultConfig(datasetId: string, method: BuildMethodId, presets: BuildPresets = {}): BuildConfig {
  const dataset = getAnalysisDataset(datasetId) ?? analysisDatasets[0]!;
  const dimensions = groupDimensionsFor(dataset);
  const dimension =
    presets.dimension && (dimensions as string[]).includes(presets.dimension)
      ? (presets.dimension as DimensionId)
      : (dimensions[0] ?? "region");
  const grains = grainsFor(dataset);
  const [measure, measureY] =
    method === "relationship" && !presets.measure
      ? relationshipPair(dataset)
      : [pickMeasure(dataset, method, presets.measure), secondMeasure(dataset, pickMeasure(dataset, method, presets.measure))];

  return {
    datasetId: dataset.id,
    method,
    measure,
    measureY,
    dimension,
    grain: grains[0] ?? "region",
    split: "none",
    from: firstMonth,
    to: lastMonth,
    region: "all",
    course: "all",
    aggregation: "total",
    rateMethod: "pooled",
    display: "value",
    sort: "desc",
    centre: "median",
    outliers: "include",
    change: "level",
    smoothing: "none",
    correlation: "pearson",
    periodA: previousMonth,
    periodB: lastMonth,
    changeView: "amount",
  };
}

/** Switch method but keep what the person already chose where it still applies. */
export function switchMethod(config: BuildConfig, method: BuildMethodId): BuildConfig {
  const next = defaultConfig(config.datasetId, method);
  const dataset = getAnalysisDataset(config.datasetId);
  // A relationship starts from a meaningful pair; everything else keeps the measure if it still applies.
  const keepMeasure =
    method !== "relationship" && dataset ? (measuresFor(dataset, method) as string[]).includes(config.measure) : false;
  const measure = keepMeasure ? config.measure : next.measure;
  return {
    ...next,
    measure,
    measureY: dataset && measure !== next.measure ? secondMeasure(dataset, measure) : next.measureY,
    dimension: config.dimension,
    region: config.region,
    course: config.course,
    from: config.from,
    to: config.to,
  };
}

/** Switch dataset, falling back to fields the new dataset actually has. */
export function switchDataset(config: BuildConfig, datasetId: string): BuildConfig {
  const next = defaultConfig(datasetId, config.method, { measure: config.measure, dimension: config.dimension });
  const dataset = getAnalysisDataset(datasetId);
  return {
    ...next,
    course: dataset?.dimensions.includes("course") ? config.course : "all",
    region: config.region,
    from: config.from,
    to: config.to,
  };
}
