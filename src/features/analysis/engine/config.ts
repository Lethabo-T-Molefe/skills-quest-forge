import type { AnalysisDataset, BuildConfig, BuildMethodId, MeasureDef } from "../types";

/**
 * Starting settings for a method on a dataset. This mirrors the API's own defaults, so switching methods
 * is instant; the API validates every configuration again when it runs.
 */

export interface BuildPresets {
  measure?: string | undefined;
  dimension?: string | undefined;
  filters?: Record<string, string> | undefined;
}

const isRatio = (m: MeasureDef) => m.kind === "ratio";
const isAdditive = (m: MeasureDef) => m.kind === "additive";

/** Explaining a change needs a total that adds up, so rates and distinct counts are left out. */
export function measuresFor(dataset: AnalysisDataset, method: BuildMethodId): MeasureDef[] {
  return method === "explain" ? dataset.measures.filter(isAdditive) : dataset.measures;
}

export function findMeasure(dataset: AnalysisDataset, id: string) {
  return dataset.measures.find((m) => m.id === id);
}

function pickMeasure(dataset: AnalysisDataset, method: BuildMethodId, wanted?: string) {
  const allowed = measuresFor(dataset, method);
  if (wanted && allowed.some((m) => m.id === wanted)) return wanted;
  if (allowed.some((m) => m.id === dataset.defaultMeasure)) return dataset.defaultMeasure;
  return allowed[0]?.id ?? dataset.defaultMeasure;
}

/**
 * A partner for the relationship method. Two totals are trivially related (bigger groups have more of
 * everything), so a total is paired with a rate (preferably the one it is the denominator of) and a rate
 * with another rate.
 */
function secondMeasure(dataset: AnalysisDataset, first: string) {
  const firstDef = findMeasure(dataset, first);
  const others = dataset.measures.filter((m) => m.id !== first);
  const ratios = others.filter(isRatio);
  if (!firstDef) return others[0]?.id ?? first;
  if (isRatio(firstDef)) {
    if (ratios[0]) return ratios[0].id;
    const denominator = others.find((m) => m.column !== null && m.column === firstDef.denominator);
    return (denominator ?? others[0] ?? firstDef).id;
  }
  const perUnit = ratios.find((m) => m.denominator === firstDef.column);
  return (perUnit ?? ratios[0] ?? others[0] ?? firstDef).id;
}

function relationshipPair(dataset: AnalysisDataset): [string, string] {
  const ratios = dataset.measures.filter(isRatio);
  const fallback = dataset.measures[0];
  const defaultDef = findMeasure(dataset, dataset.defaultMeasure) ?? fallback;
  if (!defaultDef) return [dataset.defaultMeasure, dataset.defaultMeasure];
  if (ratios.length >= 2) {
    const y = isRatio(defaultDef) ? defaultDef : ratios[0]!;
    return [secondMeasure(dataset, y.id), y.id];
  }
  if (ratios.length === 1) return [secondMeasure(dataset, ratios[0]!.id), ratios[0]!.id];
  return [defaultDef.id, secondMeasure(dataset, defaultDef.id)];
}

export function defaultConfig(
  dataset: AnalysisDataset,
  method: BuildMethodId,
  presets: BuildPresets = {},
): BuildConfig {
  const dims = dataset.dimensions.map((d) => d.id);
  const dimension =
    presets.dimension && dims.includes(presets.dimension)
      ? presets.dimension
      : (dims[0] ?? "month");
  const [measure, measureY] =
    method === "relationship" && !presets.measure
      ? relationshipPair(dataset)
      : [
          pickMeasure(dataset, method, presets.measure),
          secondMeasure(dataset, pickMeasure(dataset, method, presets.measure)),
        ];
  const months = dataset.months.map((m) => m.id);
  const filters = Object.fromEntries(
    Object.entries(presets.filters ?? {}).filter(([dim, value]) =>
      dataset.dimensions.some((d) => d.id === dim && d.values.includes(value)),
    ),
  );
  return {
    datasetId: dataset.id,
    method,
    measure,
    measureY,
    dimension,
    grain: dataset.grains[0]?.id ?? dimension,
    split: "none",
    from: months[0] ?? "",
    to: months[months.length - 1] ?? "",
    filters,
    aggregation: "total",
    rateMethod: "pooled",
    display: "value",
    sort: "desc",
    centre: "median",
    outliers: "include",
    change: "level",
    smoothing: "none",
    correlation: "pearson",
    periodA: months[months.length - 2] ?? months[0] ?? "",
    periodB: months[months.length - 1] ?? "",
    changeView: "amount",
  };
}

/** Switch method but keep what the person already chose where it still applies. */
export function switchMethod(
  dataset: AnalysisDataset,
  config: BuildConfig,
  method: BuildMethodId,
): BuildConfig {
  const next = defaultConfig(dataset, method);
  const keepMeasure =
    method !== "relationship" && measuresFor(dataset, method).some((m) => m.id === config.measure);
  const measure = keepMeasure ? config.measure : next.measure;
  return {
    ...next,
    measure,
    measureY: measure !== next.measure ? secondMeasure(dataset, measure) : next.measureY,
    dimension: config.dimension,
    filters: config.filters,
    from: config.from,
    to: config.to,
  };
}

/** Switch dataset, falling back to fields the new dataset actually has. */
export function switchDataset(dataset: AnalysisDataset, config: BuildConfig): BuildConfig {
  const next = defaultConfig(dataset, config.method, {
    measure: config.measure,
    dimension: config.dimension,
    filters: config.filters,
  });
  const months = dataset.months.map((m) => m.id);
  return {
    ...next,
    from: months.includes(config.from) ? config.from : next.from,
    to: months.includes(config.to) ? config.to : next.to,
  };
}
