/** A share written as a percentage, or a dash when there is none. */
export const pct = (value: number | null | undefined, digits = 1) =>
  value === null || value === undefined ? "—" : `${(value * 100).toFixed(digits)}%`;
