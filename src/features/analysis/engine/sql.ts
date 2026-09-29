import { analysisMethods } from "../data/methods";
import { grainDimensions, measures } from "../data/schemas";
import type { AnalysisDataset, BuildConfig, MeasureDef } from "../types";

/**
 * Generates the SQL that matches each method and option, so the code shown next to a chart
 * is exactly what the chart means. Written for PostgreSQL.
 */

function literal(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

export function measureSql(def: MeasureDef, rateMethod: BuildConfig["rateMethod"]) {
  if (def.kind === "additive") return `SUM(${def.column})`;
  if (rateMethod === "average") return `AVG(${def.numerator}::numeric / NULLIF(${def.denominator}, 0))`;
  return `SUM(${def.numerator})::numeric / NULLIF(SUM(${def.denominator}), 0)`;
}

function whereSql(config: BuildConfig, dataset: AnalysisDataset, period: "range" | "pair") {
  const conditions =
    period === "range"
      ? [`month BETWEEN ${literal(config.from)} AND ${literal(config.to)}`]
      : [`month IN (${literal(config.periodA)}, ${literal(config.periodB)})`];
  if (config.region !== "all") conditions.push(`region = ${literal(config.region)}`);
  if (config.course !== "all" && dataset.dimensions.includes("course")) conditions.push(`course = ${literal(config.course)}`);
  return `WHERE  ${conditions.join("\n  AND  ")}`;
}

function header(config: BuildConfig, dataset: AnalysisDataset) {
  const method = analysisMethods.find((item) => item.id === config.method);
  return `-- ${method?.name ?? config.method} · ${dataset.name}\n`;
}

function compareSql(config: BuildConfig, dataset: AnalysisDataset) {
  const def = measures[config.measure];
  const dim = config.dimension;
  const order = config.sort === "name" ? "1" : `2 ${config.sort === "asc" ? "ASC" : "DESC"}`;
  const where = whereSql(config, dataset, "range");

  if (def.kind === "additive" && config.aggregation !== "total") {
    const statistic =
      config.aggregation === "monthly-median"
        ? `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${def.id})`
        : `AVG(${def.id})`;
    const alias = `${config.aggregation === "monthly-median" ? "median" : "avg"}_monthly_${def.id}`;
    return `${header(config, dataset)}WITH monthly AS (
  SELECT ${dim}, month, SUM(${def.column}) AS ${def.id}
  FROM   ${dataset.table}
  ${where}
  GROUP  BY ${dim}, month
)
SELECT ${dim},
       ${statistic} AS ${alias}
FROM   monthly
GROUP  BY ${dim}
ORDER  BY ${order};`;
  }

  const expression = measureSql(def, config.rateMethod);
  const extra =
    config.display === "share" && def.kind === "additive"
      ? `,\n       ROUND(100.0 * ${expression} / SUM(${expression}) OVER (), 1) AS share_pct`
      : config.display === "index"
        ? `,\n       ROUND(100.0 * ${expression} / AVG(${expression}) OVER (), 0) AS index_vs_average`
        : "";
  return `${header(config, dataset)}SELECT ${dim},
       ${expression} AS ${def.id}${extra}
FROM   ${dataset.table}
${where}
GROUP  BY ${dim}
ORDER  BY ${order};`;
}

function summariseSql(config: BuildConfig, dataset: AnalysisDataset) {
  const def = measures[config.measure];
  const dims = grainDimensions(config.grain).join(", ");
  const exclude = config.outliers === "exclude";
  const fences = exclude
    ? `,
fences AS (
  SELECT PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY value) AS q1,
         PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) AS q3
  FROM   units
)`
    : "";
  const from = exclude
    ? `FROM   units CROSS JOIN fences
WHERE  value BETWEEN q1 - 1.5 * (q3 - q1) AND q3 + 1.5 * (q3 - q1)`
    : "FROM   units";
  return `${header(config, dataset)}WITH units AS (
  SELECT ${dims}, ${measureSql(def, config.rateMethod)} AS value
  FROM   ${dataset.table}
  ${whereSql(config, dataset, "range")}
  GROUP  BY ${dims}
)${fences}
SELECT COUNT(*) AS n,
       AVG(value) AS mean,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) AS median,
       STDDEV_SAMP(value) AS std_dev,
       MIN(value) AS min,
       MAX(value) AS max,
       PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY value) AS q1,
       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) AS q3
${from};`;
}

function trendSql(config: BuildConfig, dataset: AnalysisDataset) {
  const def = measures[config.measure];
  const split = config.split === "none" ? "" : config.split;
  const groupCols = split ? `month, ${split}` : "month";
  const partition = split ? `PARTITION BY ${split} ` : "";
  const where = whereSql(config, dataset, "range");
  const pooledRunning = config.change === "cumulative" && def.kind === "ratio" && config.rateMethod === "pooled";

  const monthly = pooledRunning
    ? `WITH monthly AS (
  SELECT ${groupCols},
         SUM(${def.numerator}) AS numerator,
         SUM(${def.denominator}) AS denominator
  FROM   ${dataset.table}
  ${where}
  GROUP  BY ${groupCols}
)`
    : `WITH monthly AS (
  SELECT ${groupCols}, ${measureSql(def, config.rateMethod)} AS value
  FROM   ${dataset.table}
  ${where}
  GROUP  BY ${groupCols}
)`;

  const transform = pooledRunning
    ? "SUM(numerator) OVER (w ROWS UNBOUNDED PRECEDING)::numeric\n         / NULLIF(SUM(denominator) OVER (w ROWS UNBOUNDED PRECEDING), 0)"
    : config.change === "mom"
      ? "100.0 * (value - LAG(value) OVER w) / NULLIF(LAG(value) OVER w, 0)"
      : config.change === "cumulative"
        ? // A running total only makes sense for totals; averaged rates get a running mean instead.
          `${def.kind === "additive" ? "SUM" : "AVG"}(value) OVER (w ROWS UNBOUNDED PRECEDING)`
        : "value";
  const valueName = config.change === "mom" ? "change_pct" : config.change === "cumulative" ? `running_${def.id}` : def.id;
  const order = split ? `${split}, month` : "month";

  if (config.smoothing === "none" && config.change === "level") {
    return `${header(config, dataset)}${monthly}
SELECT ${groupCols}, value AS ${def.id}
FROM   monthly
ORDER  BY ${order};`;
  }

  const shaped = `shaped AS (
  SELECT ${groupCols},
         ${transform} AS ${valueName}
  FROM   monthly
  WINDOW w AS (${partition}ORDER BY month)
)`;
  const finalValue =
    config.smoothing === "ma3"
      ? `AVG(${valueName}) OVER (${partition}ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS ${valueName}_3m_avg`
      : valueName;
  return `${header(config, dataset)}${monthly},
${shaped}
SELECT ${groupCols},
       ${finalValue}
FROM   shaped
ORDER  BY ${order};`;
}

function relationshipSql(config: BuildConfig, dataset: AnalysisDataset) {
  const x = measures[config.measure];
  const y = measures[config.measureY];
  const dims = grainDimensions(config.grain).join(", ");
  const exclude = config.outliers === "exclude";
  const source = exclude ? "kept" : "units";
  const trim = exclude
    ? `,
fences AS (
  SELECT PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY x) AS x1,
         PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY x) AS x3,
         PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY y) AS y1,
         PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY y) AS y3
  FROM   units
),
kept AS (
  SELECT units.*
  FROM   units CROSS JOIN fences
  WHERE  x BETWEEN x1 - 1.5 * (x3 - x1) AND x3 + 1.5 * (x3 - x1)
    AND  y BETWEEN y1 - 1.5 * (y3 - y1) AND y3 + 1.5 * (y3 - y1)
)`
    : "";
  const units = `${header(config, dataset)}WITH units AS (
  SELECT ${dims},
         ${measureSql(x, config.rateMethod)} AS x,  -- ${x.label}
         ${measureSql(y, config.rateMethod)} AS y   -- ${y.label}
  FROM   ${dataset.table}
  ${whereSql(config, dataset, "range")}
  GROUP  BY ${dims}
)${trim}`;

  if (config.correlation === "spearman") {
    return `${units},
ranked AS (
  -- Average ranks, so tied values share their rank
  SELECT (RANK() OVER (ORDER BY x) + COUNT(*) OVER () + 1 - RANK() OVER (ORDER BY x DESC)) / 2.0 AS rx,
         (RANK() OVER (ORDER BY y) + COUNT(*) OVER () + 1 - RANK() OVER (ORDER BY y DESC)) / 2.0 AS ry
  FROM   ${source}
)
SELECT CORR(rx, ry) AS spearman_rho,
       COUNT(*) AS n
FROM   ranked;`;
  }
  return `${units}
SELECT CORR(x, y) AS pearson_r,
       REGR_SLOPE(y, x) AS slope,
       REGR_INTERCEPT(y, x) AS intercept,
       COUNT(*) AS n
FROM   ${source};`;
}

function explainSql(config: BuildConfig, dataset: AnalysisDataset) {
  const def = measures[config.measure];
  const dim = config.dimension;
  const column = def.column ?? def.id;
  return `${header(config, dataset)}WITH periods AS (
  SELECT ${dim},
         COALESCE(SUM(${column}) FILTER (WHERE month = ${literal(config.periodA)}), 0) AS period_a,
         COALESCE(SUM(${column}) FILTER (WHERE month = ${literal(config.periodB)}), 0) AS period_b
  FROM   ${dataset.table}
  ${whereSql(config, dataset, "pair")}
  GROUP  BY ${dim}
)
SELECT ${dim},
       period_a,
       period_b,
       period_b - period_a AS change,
       ROUND(100.0 * (period_b - period_a) / NULLIF(period_a, 0), 1) AS change_pct,
       ROUND(100.0 * (period_b - period_a) / NULLIF(SUM(period_b - period_a) OVER (), 0), 1) AS share_of_change_pct
FROM   periods
ORDER  BY ${config.changeView === "percent" ? "ABS((period_b - period_a)::numeric / NULLIF(period_a, 0))" : "ABS(period_b - period_a)"} DESC;`;
}

export function buildSql(config: BuildConfig, dataset: AnalysisDataset) {
  switch (config.method) {
    case "summarise":
      return summariseSql(config, dataset);
    case "trend":
      return trendSql(config, dataset);
    case "relationship":
      return relationshipSql(config, dataset);
    case "explain":
      return explainSql(config, dataset);
    default:
      return compareSql(config, dataset);
  }
}
