/** Small, dependency-free statistics used by the analysis engine. */

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function mean(values: number[]) {
  return values.length === 0 ? Number.NaN : sum(values) / values.length;
}

/** Quantile with linear interpolation between order statistics (the default in R and NumPy). */
export function quantile(values: number[], q: number) {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const low = sorted[lower] ?? Number.NaN;
  const high = sorted[upper] ?? Number.NaN;
  return low + (high - low) * (position - lower);
}

export function median(values: number[]) {
  return quantile(values, 0.5);
}

/** Sample standard deviation (n − 1), matching SQL's STDDEV_SAMP. */
export function standardDeviation(values: number[]) {
  if (values.length < 2) return Number.NaN;
  const centre = mean(values);
  return Math.sqrt(sum(values.map((value) => (value - centre) ** 2)) / (values.length - 1));
}

/** Tukey fences: values beyond 1.5 × IQR outside the middle half are unusual. */
export function tukeyFences(values: number[]) {
  const q1 = quantile(values, 0.25);
  const q3 = quantile(values, 0.75);
  const iqr = q3 - q1;
  return { low: q1 - 1.5 * iqr, high: q3 + 1.5 * iqr };
}

export function pearson(xs: number[], ys: number[]) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return Number.NaN;
  const mx = mean(xs);
  const my = mean(ys);
  let covariance = 0;
  let vx = 0;
  let vy = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = (xs[i] ?? 0) - mx;
    const dy = (ys[i] ?? 0) - my;
    covariance += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  return vx === 0 || vy === 0 ? Number.NaN : covariance / Math.sqrt(vx * vy);
}

/** Ranks with ties sharing their average rank. */
export function ranks(values: number[]) {
  const order = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const result = new Array<number>(values.length).fill(0);
  let i = 0;
  while (i < order.length) {
    let j = i;
    while (j + 1 < order.length && order[j + 1]?.value === order[i]?.value) j += 1;
    const averageRank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k += 1) {
      const entry = order[k];
      if (entry) result[entry.index] = averageRank;
    }
    i = j + 1;
  }
  return result;
}

export function spearman(xs: number[], ys: number[]) {
  return pearson(ranks(xs), ranks(ys));
}

/** Ordinary least squares line through the points. */
export function linearFit(xs: number[], ys: number[]) {
  const mx = mean(xs);
  const my = mean(ys);
  let numerator = 0;
  let denominator = 0;
  xs.forEach((x, i) => {
    numerator += (x - mx) * ((ys[i] ?? 0) - my);
    denominator += (x - mx) ** 2;
  });
  if (denominator === 0) return null;
  const slope = numerator / denominator;
  return { slope, intercept: my - slope * mx };
}

/** Cohen's conventional reading of a correlation's size. */
export function correlationStrength(r: number) {
  const size = Math.abs(r);
  if (size < 0.1) return "no meaningful";
  if (size < 0.3) return "a weak";
  if (size < 0.5) return "a moderate";
  return "a strong";
}
