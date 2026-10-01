import { formatNumber } from "@/lib/format";
import type { MeasureUnit, ValueFormat } from "../types";

/** Formats a value in its measure's unit: 48 213, R1 214, 66.3% or 3.07. */
export function formatValue(value: number, unit: MeasureUnit) {
  if (!Number.isFinite(value)) return "—";
  switch (unit) {
    case "money":
      return `R${formatNumber(Math.round(value))}`;
    case "rate":
      return `${(value * 100).toFixed(1)}%`;
    case "decimal":
      return value.toFixed(2);
    default:
      return formatNumber(Math.round(value));
  }
}

/** Formats a difference with an explicit sign: +R12 400, −3.1 pts. */
export function formatDelta(value: number, unit: MeasureUnit) {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  if (unit === "rate") return `${sign}${Math.abs(value * 100).toFixed(1)} pts`;
  return `${sign}${formatValue(Math.abs(value), unit)}`;
}

export function formatPercent(value: number, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

/** Short form for chart axes and bin labels: R1.2m, R480k, 12k, 66%. */
export function formatCompact(value: number, unit: MeasureUnit) {
  if (!Number.isFinite(value)) return "—";
  if (unit === "rate") return `${(value * 100).toFixed(1)}%`;
  if (unit === "decimal") return value.toFixed(2);
  const prefix = unit === "money" ? "R" : "";
  const size = Math.abs(value);
  if (size >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(1)}m`;
  if (size >= 10_000) return `${prefix}${Math.round(value / 1_000)}k`;
  if (size >= 1_000) return `${prefix}${(value / 1_000).toFixed(1)}k`;
  return `${prefix}${Math.round(value)}`;
}

/** A formatter for a format the API describes (the unit, a percentage, a share, an index). */
export function formatterFor(format: ValueFormat): (value: number) => string {
  switch (format.type) {
    case "measure":
      return (value) => formatValue(value, format.unit);
    case "compact":
      return (value) => formatCompact(value, format.unit);
    case "percent":
      return (value) => formatPercent(value, format.digits);
    case "delta":
      return (value) => formatDelta(value, format.unit);
    case "share":
      return (value) => (Number.isFinite(value) ? `${value.toFixed(1)}%` : "—");
    case "index":
      return (value) => (Number.isFinite(value) ? value.toFixed(0) : "—");
    case "count":
      return (value) => `${formatNumber(value)} ${value === 1 ? format.singular : format.plural}`;
    default:
      return (value) => (Number.isFinite(value) ? formatNumber(value) : "—");
  }
}
