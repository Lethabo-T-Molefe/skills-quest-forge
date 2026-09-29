import { formatNumber } from "@/lib/format";
import { COURSES, MONTHS, REGIONS, factRows, monthLabel } from "../data/facts";
import {
  analysisDatasets,
  dimensionLabels,
  getAnalysisDataset,
  grainColumnLabels,
  grainDimensions,
  grainLabels,
  measures,
} from "../data/schemas";
import type {
  AnalysisDataset,
  AnalysisResult,
  BuildConfig,
  ChartPoint,
  DimensionId,
  FactRow,
  MeasureDef,
  UnitGrain,
} from "../types";
import { formatCompact, formatDelta, formatPercent, formatValue } from "./format";
import { buildSql } from "./sql";
import {
  correlationStrength,
  linearFit,
  mean,
  median,
  pearson,
  quantile,
  spearman,
  standardDeviation,
  sum,
  tukeyFences,
} from "./stats";

/* ------------------------------------------------------------------ rows */

const datasetRowCache = new Map<string, FactRow[]>();

/** Rows at the dataset's own grain. A dataset without a course column adds the courses together. */
function rowsFor(dataset: AnalysisDataset): FactRow[] {
  const cached = datasetRowCache.get(dataset.id);
  if (cached) return cached;
  let rows = factRows;
  if (!dataset.dimensions.includes("course")) {
    const byKey = new Map<string, FactRow>();
    for (const row of factRows) {
      const key = `${row.region}|${row.month}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.enrolments += row.enrolments;
        existing.completions += row.completions;
        existing.revenue += row.revenue;
        existing.sessions += row.sessions;
      } else {
        byKey.set(key, { ...row, course: "All courses" });
      }
    }
    rows = [...byKey.values()];
  }
  datasetRowCache.set(dataset.id, rows);
  return rows;
}

function period(config: BuildConfig): [string, string] {
  return config.from <= config.to ? [config.from, config.to] : [config.to, config.from];
}

function filterRows(config: BuildConfig, dataset: AnalysisDataset, scope: "range" | "pair") {
  const [from, to] = period(config);
  return rowsFor(dataset).filter(
    (row) =>
      (scope === "pair"
        ? row.month === config.periodA || row.month === config.periodB
        : row.month >= from && row.month <= to) &&
      (config.region === "all" || row.region === config.region) &&
      (config.course === "all" || !dataset.dimensions.includes("course") || row.course === config.course),
  );
}

const dimensionOrder: Record<DimensionId, readonly string[]> = {
  region: REGIONS,
  course: COURSES,
  month: MONTHS.map((month) => month.id),
};

interface Group {
  label: string;
  parts: string[];
  rows: FactRow[];
}

/** Groups rows by one or more dimensions, in each dimension's natural order. */
function groupRows(rows: FactRow[], dims: DimensionId[]): Group[] {
  const groups = new Map<string, Group>();
  for (const row of rows) {
    const parts = dims.map((dim) => row[dim]);
    const key = parts.join("|");
    let group = groups.get(key);
    if (!group) {
      group = {
        parts,
        label: parts.map((part, i) => (dims[i] === "month" ? monthLabel(part, true) : part)).join(" · "),
        rows: [],
      };
      groups.set(key, group);
    }
    group.rows.push(row);
  }
  return [...groups.values()].sort((a, b) => {
    for (let i = 0; i < dims.length; i += 1) {
      const dim = dims[i];
      if (!dim) continue;
      const diff = dimensionOrder[dim].indexOf(a.parts[i] ?? "") - dimensionOrder[dim].indexOf(b.parts[i] ?? "");
      if (diff !== 0) return diff;
    }
    return 0;
  });
}

/** A measure over a set of rows: added up, pooled (Σ numerator ÷ Σ denominator) or averaged per row. */
function measureValue(rows: FactRow[], def: MeasureDef, rateMethod: BuildConfig["rateMethod"]) {
  if (rows.length === 0) return Number.NaN;
  if (def.kind === "additive") {
    const column = def.column;
    return column ? sum(rows.map((row) => row[column])) : Number.NaN;
  }
  const { numerator, denominator } = def;
  if (!numerator || !denominator) return Number.NaN;
  if (rateMethod === "average") {
    return mean(rows.filter((row) => row[denominator] > 0).map((row) => row[numerator] / row[denominator]));
  }
  const total = sum(rows.map((row) => row[denominator]));
  return total === 0 ? Number.NaN : sum(rows.map((row) => row[numerator])) / total;
}

/* ------------------------------------------------------------------ wording */

const grainNouns: Record<UnitGrain, { one: string; many: string }> = {
  region: { one: "a region", many: "regions" },
  course: { one: "a course", many: "courses" },
  month: { one: "a month", many: "months" },
  "region-month": { one: "a region in one month", many: "region-months" },
  "course-month": { one: "a course in one month", many: "course-months" },
  "region-course": { one: "a course in one region", many: "course-region pairs" },
};

const dimensionNouns: Record<DimensionId, string> = { region: "regions", course: "courses", month: "months" };

function scopeText(config: BuildConfig, dataset: AnalysisDataset, scope: "range" | "pair") {
  const [from, to] = period(config);
  const parts =
    scope === "range" ? [from === to ? monthLabel(from) : `${monthLabel(from)} to ${monthLabel(to)}`] : [];
  if (config.region !== "all") parts.push(config.region);
  if (config.course !== "all" && dataset.dimensions.includes("course")) parts.push(config.course);
  return parts.join(", ");
}

function rateSentence(def: MeasureDef, rateMethod: BuildConfig["rateMethod"]) {
  if (def.kind === "additive") return `added up ${def.label.toLowerCase()}`;
  return rateMethod === "average"
    ? `averaged each row's ${def.label.toLowerCase()}, giving every row the same weight`
    : `pooled ${def.label.toLowerCase()}: total ${def.numerator} divided by total ${def.denominator}`;
}

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function listNames(names: string[], limit = 3) {
  if (names.length <= limit) return names.join(", ");
  return `${names.slice(0, limit).join(", ")} and ${names.length - limit} more`;
}

function emptyResult(config: BuildConfig, dataset: AnalysisDataset, title: string, reading?: string): AnalysisResult {
  return {
    title,
    reading: reading ?? "No rows match these settings. Widen the period or clear a filter.",
    method: "",
    notes: [],
    visual: { kind: "bars", points: [] },
    format: (value) => String(value),
    axisFormat: (value) => String(value),
    table: { columns: [], rows: [] },
    sql: buildSql(config, dataset),
    figures: [],
  };
}

/* ------------------------------------------------------------------ summarise */

function histogram(values: number[], format: (value: number) => string, count = 6): ChartPoint[] {
  const low = Math.min(...values);
  const high = Math.max(...values);
  if (low === high) return [{ name: format(low), value: values.length }];
  const width = (high - low) / count;
  const bins = Array.from({ length: count }, (_, i) => ({ low: low + i * width, high: low + (i + 1) * width, n: 0 }));
  for (const value of values) {
    const bin = bins[Math.min(count - 1, Math.floor((value - low) / width))];
    if (bin) bin.n += 1;
  }
  return bins.map((bin) => ({ name: `${format(bin.low)}–${format(bin.high)}`, value: bin.n }));
}

function summarise(config: BuildConfig, dataset: AnalysisDataset): AnalysisResult {
  const def = measures[config.measure];
  const fmt = (value: number) => formatValue(value, def.unit);
  const noun = grainNouns[config.grain];
  const title = `${def.label}, ${grainLabels[config.grain].toLowerCase()}`;

  const units = groupRows(filterRows(config, dataset, "range"), grainDimensions(config.grain))
    .map((group) => ({ label: group.label, value: measureValue(group.rows, def, config.rateMethod) }))
    .filter((unit) => Number.isFinite(unit.value));
  if (units.length === 0) return emptyResult(config, dataset, title);

  const fences = tukeyFences(units.map((unit) => unit.value));
  const unusual = (value: number) => value < fences.low || value > fences.high;
  const flagged = units.filter((unit) => unusual(unit.value));
  const used = config.outliers === "exclude" ? units.filter((unit) => !unusual(unit.value)) : units;
  const values = used.map((unit) => unit.value);
  if (values.length === 0) return emptyResult(config, dataset, title);

  const stats = {
    n: values.length,
    excluded: units.length - used.length,
    mean: mean(values),
    median: median(values),
    std: standardDeviation(values),
    q1: quantile(values, 0.25),
    q3: quantile(values, 0.75),
  };
  const centre = config.centre === "median" ? stats.median : stats.mean;
  const skew = stats.median === 0 ? 0 : (stats.mean - stats.median) / Math.abs(stats.median);

  let reading = `Across ${stats.n} ${noun.many}, the ${config.centre} ${def.label.toLowerCase()} is ${fmt(centre)}. The middle half sits between ${fmt(stats.q1)} and ${fmt(stats.q3)}.`;
  if (Math.abs(skew) > 0.1) {
    reading += ` The mean (${fmt(stats.mean)}) is ${skew > 0 ? "above" : "below"} the median, so a few ${skew > 0 ? "large" : "small"} values pull it.`;
  }
  if (flagged.length > 0) {
    reading += ` ${flagged.length} ${flagged.length === 1 ? "value sits" : "values sit"} outside the usual range (${listNames(flagged.map((unit) => unit.label))})${config.outliers === "exclude" ? " and are left out" : ""}.`;
  }

  const notes: string[] = [];
  if (stats.n < 10) notes.push(`Only ${stats.n} values. The spread and any unusual values are fragile.`);
  if (def.unit === "money" && config.centre === "mean") {
    notes.push("Money is usually skewed. The median is often the safer typical value.");
  }
  if (def.kind === "ratio" && config.rateMethod === "average") {
    notes.push("Averaging rates gives every row the same weight, whatever its size.");
  }

  return {
    title,
    reading,
    method: `Grouped ${dataset.name} into ${grainLabels[config.grain].toLowerCase()} (${scopeText(config, dataset, "range")}). For each, ${rateSentence(def, config.rateMethod)}. Then summarised the ${units.length} values${stats.excluded ? `, leaving out ${stats.excluded} beyond the Tukey fences (1.5 × IQR)` : ""}.`,
    notes,
    visual: { kind: "histogram", bins: histogram(values, (value) => formatCompact(value, def.unit)) },
    format: (value) => `${formatNumber(value)} ${value === 1 ? "value" : "values"}`,
    axisFormat: (value) => formatNumber(value),
    table: {
      columns: [grainColumnLabels[config.grain], def.label, "Unusual?"],
      rows: [...units]
        .sort((a, b) => b.value - a.value)
        .map((unit) => [
          unit.label,
          fmt(unit.value),
          unusual(unit.value) ? (config.outliers === "exclude" ? "Yes · left out" : "Yes") : "",
        ]),
    },
    sql: buildSql(config, dataset),
    figures: [
      { label: config.centre === "median" ? "Median" : "Mean", value: fmt(centre) },
      { label: "Middle half", value: `${fmt(stats.q1)} – ${fmt(stats.q3)}` },
      { label: "Standard deviation", value: fmt(stats.std) },
      {
        label: "Values",
        value: formatNumber(stats.n),
        ...(stats.excluded ? { detail: `${stats.excluded} left out` } : {}),
      },
    ],
  };
}

/* ------------------------------------------------------------------ compare */

const aggregationLabels: Record<BuildConfig["aggregation"], string> = {
  total: "Total",
  "monthly-mean": "Average monthly",
  "monthly-median": "Median monthly",
};

function compare(config: BuildConfig, dataset: AnalysisDataset): AnalysisResult {
  const def = measures[config.measure];
  const fmt = (value: number) => formatValue(value, def.unit);
  const dim = config.dimension;
  const additive = def.kind === "additive";
  const valueHeader = additive ? `${aggregationLabels[config.aggregation]} ${def.label.toLowerCase()}` : def.label;
  const title = `${valueHeader} by ${dim}`;

  const rows = groupRows(filterRows(config, dataset, "range"), [dim])
    .map((group) => {
      let value: number;
      if (additive && config.aggregation !== "total") {
        const monthly = groupRows(group.rows, ["month"]).map((month) => measureValue(month.rows, def, config.rateMethod));
        value = config.aggregation === "monthly-median" ? median(monthly) : mean(monthly);
      } else {
        value = measureValue(group.rows, def, config.rateMethod);
      }
      return { name: group.label, value, volume: sum(group.rows.map((row) => row.enrolments)) };
    })
    .filter((row) => Number.isFinite(row.value));
  if (rows.length === 0) return emptyResult(config, dataset, title);

  const total = sum(rows.map((row) => row.value));
  const average = mean(rows.map((row) => row.value));
  const display = !additive && config.display === "share" ? "value" : config.display;
  const enriched = rows.map((row) => ({
    ...row,
    share: total ? (row.value / total) * 100 : Number.NaN,
    index: average ? (row.value / average) * 100 : Number.NaN,
  }));
  const sorted = [...enriched].sort((a, b) =>
    config.sort === "name" ? a.name.localeCompare(b.name) : config.sort === "asc" ? a.value - b.value : b.value - a.value,
  );
  const byValue = [...enriched].sort((a, b) => b.value - a.value);
  const top = byValue[0]!;
  const bottom = byValue[byValue.length - 1]!;
  const shown = (row: (typeof enriched)[number]) =>
    display === "share" ? row.share : display === "index" ? row.index : row.value;
  const format =
    display === "share"
      ? (value: number) => `${value.toFixed(1)}%`
      : display === "index"
        ? (value: number) => value.toFixed(0)
        : fmt;

  let reading = `${top.name} is highest at ${fmt(top.value)} and ${bottom.name} is lowest at ${fmt(bottom.value)}.`;
  if (rows.length === 1) {
    reading = `${top.name}: ${fmt(top.value)}. Only one ${dim} matches the filters, so there is nothing to compare it with. Clear the ${dim} filter to compare.`;
  } else if (additive && config.aggregation === "total") {
    reading += ` ${top.name} alone accounts for ${top.share.toFixed(0)}% of the total.`;
  } else if (!additive) {
    reading += ` The gap between them is ${formatDelta(top.value - bottom.value, def.unit)}.`;
  }

  const largest = Math.max(...rows.map((row) => row.volume));
  const small = rows.filter((row) => row.volume < largest * 0.15).map((row) => row.name);
  const notes: string[] = [];
  if (small.length > 0) {
    notes.push(`${listNames(small)} ${small.length === 1 ? "is" : "are"} much smaller than the largest ${dim}, so ${small.length === 1 ? "its figure moves" : "their figures move"} more from month to month.`);
  }
  if (!additive && config.rateMethod === "average") {
    notes.push("Averaging rates gives small groups the same weight as large ones. Pooling is usually the fairer choice.");
  }
  if (!additive && config.display === "share") {
    notes.push("Shares of a total only make sense for measures that add up, so values are shown instead.");
  }

  const columns = [dimensionLabels[dim], valueHeader];
  if (additive) columns.push("Share of total");
  columns.push("Index (100 = average)", "Enrolments");

  return {
    title,
    reading,
    method: `For each ${dim} (${scopeText(config, dataset, "range")}), ${
      additive && config.aggregation !== "total"
        ? `added up ${def.label.toLowerCase()} per month, then took the ${config.aggregation === "monthly-median" ? "median" : "average"} month`
        : rateSentence(def, config.rateMethod)
    }.${display === "share" ? " Shares are each group's part of the sum of all groups." : ""}${display === "index" ? " The index divides each group by the average group and multiplies by 100." : ""}`,
    notes,
    visual: { kind: "bars", points: sorted.map((row) => ({ name: row.name, value: shown(row) })), ...(display === "index" ? { reference: 100 } : {}) },
    format,
    axisFormat: display === "value" ? (value) => formatCompact(value, def.unit) : format,
    table: {
      columns,
      rows: sorted.map((row) => {
        const cells: (string | number)[] = [row.name, fmt(row.value)];
        if (additive) cells.push(`${row.share.toFixed(1)}%`);
        cells.push(row.index.toFixed(0), formatNumber(row.volume));
        return cells;
      }),
    },
    sql: buildSql(config, dataset),
    figures: rows.length === 1 ? [{ label: top.name, value: fmt(top.value) }] : [
      { label: "Highest", value: fmt(top.value), detail: top.name },
      { label: "Lowest", value: fmt(bottom.value), detail: bottom.name },
      additive
        ? {
            label: "Highest ÷ lowest",
            value: bottom.value > 0 ? `${(top.value / bottom.value).toFixed(1)}×` : "—",
          }
        : { label: "Gap", value: formatDelta(top.value - bottom.value, def.unit) },
      { label: capitalise(dimensionNouns[dim]), value: String(rows.length) },
    ],
  };
}

/* ------------------------------------------------------------------ trend */

function trend(config: BuildConfig, dataset: AnalysisDataset): AnalysisResult {
  const def = measures[config.measure];
  const fmt = (value: number) => formatValue(value, def.unit);
  const [from, to] = period(config);
  const months = MONTHS.filter((month) => month.id >= from && month.id <= to).map((month) => month.id);
  const rows = filterRows(config, dataset, "range");
  const splitBy = config.split !== "none" && dataset.dimensions.includes(config.split) ? config.split : null;
  const changeLabel = config.change === "mom" ? "month-on-month change" : config.change === "cumulative" ? "running total" : "";
  const title = `${def.label}${changeLabel ? `, ${changeLabel}` : ""}${splitBy ? ` by ${splitBy}` : ""}, month by month`;
  if (rows.length === 0 || months.length === 0) return emptyResult(config, dataset, title);

  let groups: { name: string; rows: FactRow[] }[] = [{ name: def.label, rows }];
  let omitted = 0;
  if (splitBy) {
    const volume = (group: Group) =>
      def.kind === "additive"
        ? measureValue(group.rows, def, "pooled")
        : sum(group.rows.map((row) => (def.denominator ? row[def.denominator] : 0)));
    const ranked = groupRows(rows, [splitBy]).sort((a, b) => volume(b) - volume(a));
    groups = ranked.slice(0, 4).map((group) => ({ name: group.label, rows: group.rows }));
    omitted = Math.max(0, ranked.length - 4);
  }

  const series = groups.map((group) => {
    const perMonth = months.map((month) => group.rows.filter((row) => row.month === month));
    const level = perMonth.map((monthRows) => measureValue(monthRows, def, config.rateMethod));
    let values: (number | null)[];
    if (config.change === "mom") {
      values = level.map((value, i) => {
        const previous = level[i - 1];
        return i === 0 || previous === undefined || !Number.isFinite(previous) || previous === 0 || !Number.isFinite(value)
          ? null
          : ((value - previous) / previous) * 100;
      });
    } else if (config.change === "cumulative") {
      if (def.kind === "ratio" && config.rateMethod === "pooled" && def.numerator && def.denominator) {
        const { numerator, denominator } = def;
        let top = 0;
        let bottom = 0;
        values = perMonth.map((monthRows) => {
          top += sum(monthRows.map((row) => row[numerator]));
          bottom += sum(monthRows.map((row) => row[denominator]));
          return bottom === 0 ? null : top / bottom;
        });
      } else {
        let running = 0;
        values = level.map((value, i) => {
          running += Number.isFinite(value) ? value : 0;
          return def.kind === "additive" ? running : running / (i + 1);
        });
      }
    } else {
      values = level.map((value) => (Number.isFinite(value) ? value : null));
    }
    if (config.smoothing === "ma3") {
      values = values.map((_, i) => {
        const window = [values[i - 2], values[i - 1], values[i]];
        return i >= 2 && window.every((value) => value !== null && value !== undefined)
          ? mean(window as number[])
          : null;
      });
    }
    return { name: group.name, values };
  });

  const format = config.change === "mom" ? (value: number) => formatPercent(value) : fmt;
  const axisFormat = config.change === "mom" ? (value: number) => formatPercent(value, 0) : (value: number) => formatCompact(value, def.unit);
  const points = months.map((month, i) => {
    const point: Record<string, number | string | null> = { name: monthLabel(month, true) };
    for (const line of series) point[line.name] = line.values[i] ?? null;
    return point;
  });

  const firstAndLast = (values: (number | null)[]) => {
    const indexed = values.map((value, i) => ({ value, i })).filter((item): item is { value: number; i: number } => item.value !== null);
    return { first: indexed[0], last: indexed[indexed.length - 1] };
  };
  // Rates change in points; totals change in per cent.
  const changeText = (first: number, last: number) =>
    def.kind === "ratio"
      ? formatDelta(last - first, def.unit)
      : formatPercent(first === 0 ? Number.NaN : ((last - first) / Math.abs(first)) * 100);
  const runningNoun = def.kind === "additive" ? "total" : "figure";

  let reading: string;
  const figures: AnalysisResult["figures"] = [];
  const monthName = (i: number) => monthLabel(months[i] ?? "");

  if (config.change === "mom") {
    const all = series.flatMap((line) =>
      line.values.map((value, i) => ({ value, i, name: line.name })).filter((item): item is { value: number; i: number; name: string } => item.value !== null),
    );
    const rise = all.reduce<(typeof all)[number] | undefined>((best, item) => (!best || item.value > best.value ? item : best), undefined);
    const fall = all.reduce<(typeof all)[number] | undefined>((worst, item) => (!worst || item.value < worst.value ? item : worst), undefined);
    const who = (item: { name: string }) => (splitBy ? ` (${item.name})` : "");
    // Name the extremes honestly: if every month rose, the lowest value is the smallest rise, not a fall.
    const highName = rise && rise.value < 0 ? "Smallest fall" : "Biggest rise";
    const lowName = fall && fall.value >= 0 ? "Smallest rise" : "Biggest fall";
    reading =
      rise && fall
        ? `${highName} from one month to the next: ${formatPercent(rise.value)} in ${monthName(rise.i)}${who(rise)}. ${lowName}: ${formatPercent(fall.value)} in ${monthName(fall.i)}${who(fall)}.`
        : "Month-on-month change needs at least two months.";
    if (rise) figures.push({ label: highName, value: formatPercent(rise.value), detail: `${monthName(rise.i)}${who(rise)}` });
    if (fall) figures.push({ label: lowName, value: formatPercent(fall.value), detail: `${monthName(fall.i)}${who(fall)}` });
  } else if (!splitBy) {
    const line = series[0]!;
    const { first, last } = firstAndLast(line.values);
    if (!first || !last) {
      reading = "Not enough months with data to show a trend.";
    } else if (config.change === "cumulative") {
      reading = `By ${monthName(last.i)}, the running ${runningNoun} reached ${fmt(last.value)}, starting from ${fmt(first.value)} in ${monthName(first.i)}.`;
      figures.push(
        { label: `Running ${runningNoun} by ${monthName(last.i)}`, value: fmt(last.value) },
        { label: monthName(first.i), value: fmt(first.value) },
        { label: "Months", value: String(months.length) },
      );
    } else {
      const direction = last.value > first.value ? "rose" : last.value < first.value ? "fell" : "held steady";
      const peak = line.values.reduce<{ value: number; i: number } | undefined>(
        (best, value, i) => (value !== null && (!best || value > best.value) ? { value, i } : best),
        undefined,
      );
      reading = `${def.label} ${direction} from ${fmt(first.value)} in ${monthName(first.i)} to ${fmt(last.value)} in ${monthName(last.i)} (${changeText(first.value, last.value)}).${peak ? ` The highest month was ${monthName(peak.i)} at ${fmt(peak.value)}.` : ""}`;
      figures.push(
        { label: monthName(first.i), value: fmt(first.value) },
        { label: monthName(last.i), value: fmt(last.value) },
        { label: "Change", value: changeText(first.value, last.value) },
      );
      if (peak) figures.push({ label: "Highest month", value: fmt(peak.value), detail: monthName(peak.i) });
    }
  } else if (config.change === "cumulative") {
    const ends = series
      .map((line) => ({ name: line.name, last: firstAndLast(line.values).last }))
      .filter((line): line is { name: string; last: { value: number; i: number } } => Boolean(line.last))
      .sort((p, q) => q.last.value - p.last.value);
    const highest = ends[0];
    const lowest = ends[ends.length - 1];
    reading =
      highest && lowest
        ? `By ${monthName(highest.last.i)}, ${highest.name} has the highest running ${runningNoun} (${fmt(highest.last.value)}) and ${lowest.name} the lowest (${fmt(lowest.last.value)}).`
        : "Not enough months with data to compare lines.";
    for (const line of ends) figures.push({ label: line.name, value: fmt(line.last.value), detail: `by ${monthName(line.last.i)}` });
  } else {
    const changes = series
      .map((line) => ({ name: line.name, ...firstAndLast(line.values) }))
      .filter((line): line is { name: string; first: { value: number; i: number }; last: { value: number; i: number } } => Boolean(line.first && line.last))
      .map((line) => ({ name: line.name, first: line.first.value, last: line.last.value, delta: line.last.value - line.first.value }));
    const best = [...changes].sort((a, b) => b.delta - a.delta)[0];
    const worst = [...changes].sort((a, b) => a.delta - b.delta)[0];
    reading =
      best && worst
        ? `Of the ${changes.length} largest ${dimensionNouns[splitBy]}, ${best.name} ${best.delta < 0 ? "fell least" : "gained most"} (${changeText(best.first, best.last)}) and ${worst.name} ${worst.delta < 0 ? "fell most" : "gained least"} (${changeText(worst.first, worst.last)}).`
        : "Not enough months with data to compare lines.";
    for (const line of changes) figures.push({ label: line.name, value: fmt(line.last), detail: changeText(line.first, line.last) });
  }

  const notes: string[] = [];
  if (months.includes("2025-12")) notes.push("December is seasonally low. Compare like with like before calling a move a trend.");
  if (months.length < 4) notes.push(`Only ${months.length} months. That is too short to call a trend.`);
  if (omitted > 0) notes.push(`Showing the 4 largest ${dimensionNouns[splitBy ?? "region"]}. ${omitted} smaller ${omitted === 1 ? "one is" : "ones are"} left out to keep the chart readable.`);
  if (config.smoothing === "ma3") notes.push("The three-month average starts once three months are available.");
  if (config.change === "cumulative" && def.kind === "ratio" && config.rateMethod === "average") {
    notes.push("For averaged rates, the running figure is the mean of the monthly values so far.");
  }

  return {
    title,
    reading,
    method: `For each month (${scopeText(config, dataset, "range")}), ${rateSentence(def, config.rateMethod)}.${
      config.change === "mom" ? " Then took the percentage change from the month before." : ""
    }${config.change === "cumulative" ? " Then added the months up as they went." : ""}${
      config.smoothing === "ma3" ? " Finally, averaged each month with the two before it." : ""
    }`,
    notes,
    visual: { kind: "lines", points, series: series.map((line) => line.name) },
    format,
    axisFormat,
    table: {
      columns: ["Month", ...series.map((line) => line.name)],
      rows: months.map((month, i) => [
        monthLabel(month),
        ...series.map((line) => {
          const value = line.values[i];
          return value === null || value === undefined ? "—" : format(value);
        }),
      ]),
    },
    sql: buildSql(config, dataset),
    figures,
  };
}

/* ------------------------------------------------------------------ relationship */

function relationship(config: BuildConfig, dataset: AnalysisDataset): AnalysisResult {
  const x = measures[config.measure];
  const y = measures[config.measureY];
  const noun = grainNouns[config.grain];
  const title = `${y.label} against ${x.label}`;
  if (x.id === y.id) return emptyResult(config, dataset, title, "Choose two different measures to compare.");

  const units = groupRows(filterRows(config, dataset, "range"), grainDimensions(config.grain))
    .map((group) => ({
      name: group.label,
      x: measureValue(group.rows, x, config.rateMethod),
      y: measureValue(group.rows, y, config.rateMethod),
    }))
    .filter((unit) => Number.isFinite(unit.x) && Number.isFinite(unit.y));

  let kept = units;
  if (config.outliers === "exclude" && units.length >= 4) {
    const fx = tukeyFences(units.map((unit) => unit.x));
    const fy = tukeyFences(units.map((unit) => unit.y));
    kept = units.filter((unit) => unit.x >= fx.low && unit.x <= fx.high && unit.y >= fy.low && unit.y <= fy.high);
  }
  const excluded = units.length - kept.length;
  const xs = kept.map((unit) => unit.x);
  const ys = kept.map((unit) => unit.y);
  const isPearson = config.correlation === "pearson";
  const r = isPearson ? pearson(xs, ys) : spearman(xs, ys);
  const symbol = isPearson ? "r" : "ρ";
  const fit = isPearson ? linearFit(xs, ys) : null;
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  const notes = [
    "Two measures moving together is not proof that one causes the other.",
    `Each dot is ${noun.one}, not a learner. The result describes groups, not individual people.`,
  ];
  if (kept.length < 10) notes.push(`Only ${kept.length} dots. A correlation from so few points is unstable.`);
  if (x.kind === "ratio" || y.kind === "ratio") {
    notes.push(
      config.rateMethod === "average"
        ? "Rates are averaged per row within each dot."
        : "Rates are pooled within each dot: total numerator divided by total denominator.",
    );
  }

  const direction = r > 0 ? "positive" : "negative";
  const strength = Number.isFinite(r) ? correlationStrength(r) : "";
  let reading: string;
  if (!Number.isFinite(r)) {
    reading = "There are not enough varied points to measure a relationship. Widen the period or choose a finer unit.";
  } else {
    reading = `There is ${strength} ${direction} relationship between ${x.label.toLowerCase()} and ${y.label.toLowerCase()} across ${kept.length} ${noun.many} (${symbol} = ${r.toFixed(2)}).`;
    if (Math.abs(r) >= 0.1) {
      reading += ` Where ${x.label.toLowerCase()} is higher, ${y.label.toLowerCase()} tends to be ${r > 0 ? "higher" : "lower"}.`;
      if (isPearson) reading += ` A straight line accounts for about ${Math.round(r * r * 100)}% of the variation.`;
    }
  }

  const figures: AnalysisResult["figures"] = [
    { label: isPearson ? "Pearson r" : "Spearman ρ", value: Number.isFinite(r) ? r.toFixed(2) : "—" },
    { label: "Strength", value: Number.isFinite(r) ? capitalise(`${strength.replace(/^an? /, "")}, ${direction}`) : "—" },
  ];
  if (isPearson && Number.isFinite(r)) figures.push({ label: "Shared variation (r²)", value: `${Math.round(r * r * 100)}%` });
  figures.push({ label: "Dots", value: String(kept.length), ...(excluded ? { detail: `${excluded} left out` } : {}) });

  return {
    title,
    reading,
    method: `Grouped ${dataset.name} into ${grainLabels[config.grain].toLowerCase()} (${scopeText(config, dataset, "range")}) and worked out both measures for each. Then measured how closely they move together with ${
      isPearson ? "Pearson's correlation, which looks for a straight-line pattern" : "Spearman's rank correlation, which compares their order rather than their size"
    }${excluded ? `, after leaving out ${excluded} dots beyond the Tukey fences` : ""}.`,
    notes,
    visual: {
      kind: "scatter",
      points: kept,
      fit: fit && kept.length > 1 ? { x1: minX, y1: fit.intercept + fit.slope * minX, x2: maxX, y2: fit.intercept + fit.slope * maxX } : null,
      xLabel: x.label,
      yLabel: y.label,
      formatX: (value) => formatValue(value, x.unit),
      formatY: (value) => formatValue(value, y.unit),
      axisX: (value) => formatCompact(value, x.unit),
      axisY: (value) => formatCompact(value, y.unit),
    },
    format: (value) => formatValue(value, y.unit),
    axisFormat: (value) => formatCompact(value, y.unit),
    table: {
      columns: [grainColumnLabels[config.grain], x.label, y.label],
      rows: kept.map((unit) => [unit.name, formatValue(unit.x, x.unit), formatValue(unit.y, y.unit)]),
    },
    sql: buildSql(config, dataset),
    figures,
  };
}

/* ------------------------------------------------------------------ explain */

function explain(config: BuildConfig, dataset: AnalysisDataset): AnalysisResult {
  const def = measures[config.measure];
  const fmt = (value: number) => formatValue(value, def.unit);
  const dim = config.dimension;
  const a = config.periodA;
  const b = config.periodB;
  const percentView = config.changeView === "percent";
  const title = `What changed ${def.label.toLowerCase()} from ${monthLabel(a)} to ${monthLabel(b)}, by ${dim}`;
  if (def.kind !== "additive") {
    return emptyResult(config, dataset, title, "Contributions need a total, such as revenue or enrolments. Pick one of those.");
  }
  if (a === b) return emptyResult(config, dataset, title, "Pick two different months to compare.");

  const groups = groupRows(filterRows(config, dataset, "pair"), [dim]).map((group) => {
    const before = measureValue(group.rows.filter((row) => row.month === a), def, "pooled");
    const after = measureValue(group.rows.filter((row) => row.month === b), def, "pooled");
    const valueA = Number.isFinite(before) ? before : 0;
    const valueB = Number.isFinite(after) ? after : 0;
    const delta = valueB - valueA;
    return { name: group.label, a: valueA, b: valueB, delta, pct: valueA === 0 ? Number.NaN : (delta / valueA) * 100 };
  });
  if (groups.length === 0) return emptyResult(config, dataset, title);

  const totalA = sum(groups.map((group) => group.a));
  const totalB = sum(groups.map((group) => group.b));
  const totalDelta = totalB - totalA;
  const share = (delta: number) => (totalDelta === 0 ? Number.NaN : (delta / totalDelta) * 100);
  const byAmount = [...groups].sort((p, q) => Math.abs(q.delta) - Math.abs(p.delta));
  const byPercent = [...groups]
    .filter((group) => Number.isFinite(group.pct))
    .sort((p, q) => Math.abs(q.pct) - Math.abs(p.pct));
  const sorted = percentView ? byPercent : byAmount;
  const top = byAmount[0]!;
  const relative = byPercent[0];
  const opposite = groups.filter((group) => group.delta !== 0 && Math.sign(group.delta) === -Math.sign(totalDelta));
  const pct = totalA === 0 ? Number.NaN : (totalDelta / totalA) * 100;
  const verb = (delta: number) => (delta > 0 ? "rose" : delta < 0 ? "fell" : "did not change");

  let reading: string;
  if (totalDelta === 0) {
    reading = `Total ${def.label.toLowerCase()} did not change between ${monthLabel(a)} and ${monthLabel(b)}.`;
  } else {
    reading = `${def.label} ${verb(totalDelta)} by ${fmt(Math.abs(totalDelta))} (${formatPercent(pct)}) from ${monthLabel(a)} to ${monthLabel(b)}. ${top.name} ${verb(top.delta)} by ${fmt(Math.abs(top.delta))}, ${share(top.delta).toFixed(0)}% of the change.`;
    // The biggest amount usually comes from the biggest group. The biggest relative move can be a different story.
    if (relative && relative.name !== top.name) {
      reading += ` Relative to its own size, ${relative.name} moved most (${formatPercent(relative.pct)}).`;
    }
    if (opposite.length > 0) reading += ` ${listNames(opposite.map((group) => group.name))} moved the other way.`;
  }

  const notes = percentView
    ? [
        "Percentages compare each group with its own starting value, so small groups can show large swings on small amounts.",
        "Switch to amounts to see which groups make up the total change.",
      ]
    : ["Each group's change adds up to the total change, so the shares sum to 100%."];
  if (!percentView && opposite.length > 0) notes.push("Groups that moved against the total show a negative share of the change.");

  return {
    title,
    reading,
    method: `Added up ${def.label.toLowerCase()} for each ${dim} in ${monthLabel(a)} and in ${monthLabel(b)}${
      scopeText(config, dataset, "pair") ? ` (${scopeText(config, dataset, "pair")})` : ""
    }, then took the difference.${
      percentView
        ? ` Each ${dim}'s percentage is its difference divided by its own ${monthLabel(a)} value.`
        : ` Each ${dim}'s share is its difference divided by the total difference.`
    }`,
    notes,
    visual: {
      kind: "contribution",
      points: sorted.map((group) => ({ name: group.name, value: percentView ? group.pct : group.delta })),
    },
    format: percentView ? (value) => formatPercent(value) : (value) => formatDelta(value, def.unit),
    axisFormat: percentView ? (value) => formatPercent(value, 0) : (value) => formatCompact(value, def.unit),
    table: {
      columns: [dimensionLabels[dim], monthLabel(a), monthLabel(b), "Change", "Change %", "Share of change"],
      rows: sorted.map((group) => [
        group.name,
        fmt(group.a),
        fmt(group.b),
        formatDelta(group.delta, def.unit),
        formatPercent(group.pct),
        Number.isFinite(share(group.delta)) ? `${share(group.delta).toFixed(1)}%` : "—",
      ]),
    },
    sql: buildSql(config, dataset),
    figures: [
      { label: monthLabel(a), value: fmt(totalA) },
      { label: monthLabel(b), value: fmt(totalB) },
      { label: "Change", value: formatDelta(totalDelta, def.unit), detail: formatPercent(pct) },
      percentView && relative
        ? { label: "Biggest relative move", value: formatPercent(relative.pct), detail: relative.name }
        : {
            label: "Biggest driver",
            value: top.name,
            detail: `${Number.isFinite(share(top.delta)) ? share(top.delta).toFixed(0) : "—"}% of the change`,
          },
    ],
  };
}

/* ------------------------------------------------------------------ entry */

/** Runs one analysis on the mock fact table. Pure, so it can run on every change of a control. */
export function runAnalysis(config: BuildConfig): AnalysisResult {
  const dataset = getAnalysisDataset(config.datasetId) ?? analysisDatasets[0]!;
  switch (config.method) {
    case "summarise":
      return summarise(config, dataset);
    case "trend":
      return trend(config, dataset);
    case "relationship":
      return relationship(config, dataset);
    case "explain":
      return explain(config, dataset);
    default:
      return compare(config, dataset);
  }
}
