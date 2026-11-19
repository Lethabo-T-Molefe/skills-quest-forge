import type { BuildMethodId } from "@/features/analysis";

export interface RootCauseFactor {
  factor: string;
  contribution: string;
  detail: string;
}

/** One month behind an alert: the value, and the expected value and band where the detector set one. */
export interface SeriesPoint {
  month: string;
  value: number;
  expected: number | null;
  low: number | null;
  high: number | null;
  anomaly: boolean;
}

/** How an alert's month was judged. */
export interface Detector {
  method: "seasonal" | "trend" | "band" | "insufficient";
  methodLabel?: string;
  expected?: number | null;
  low?: number | null;
  high?: number | null;
  /** How many robust standard deviations from the expected value. */
  z: number | null;
  k: number;
  history?: number;
  direction?: "above" | "below" | null;
}

export interface Alert {
  id: string;
  /** Empty for alerts the scheduled scan raised. */
  monitorId: string | null;
  datasetId: string | null;
  /** monitor: someone's monitor tripped · scan: the scheduled anomaly scan found it. */
  source: "monitor" | "scan";
  metric: string;
  message: string;
  when: string;
  createdAt: string;
  severity: "high" | "low";
  rootCause: RootCauseFactor[];
  /** The chart-builder setup that lets someone explore this change themselves. */
  explore: { dataset: string; method: BuildMethodId; measure: string; dimension?: string } | null;
  acknowledged: boolean;
  month: string;
  /** The month the change is explained against: last month, or the same month last year. */
  previousMonth: string;
  value: number | null;
  series: SeriesPoint[];
  detector: Detector | null;
}

/** What the scheduled scan has found that the member may see. */
export interface InsightFeed {
  alerts: Alert[];
  lastScan: string | null;
  everyHours: number;
  method: string;
}

export interface ScanResult {
  scanned: number;
  found: Alert[];
}

/** What trips a monitor. */
export type RuleKind = "change" | "above" | "below" | "band" | "anomaly";
export type Cadence = "hourly" | "daily" | "weekly";

export interface MonitorRule {
  kind: RuleKind;
  /** Per cent for a change, a value for above or below, standard deviations for a band. */
  threshold: number;
  /** How many months of history a band is worked out from. */
  window: number;
}

export interface Monitor {
  id: string;
  name: string;
  metric: string;
  /** The rule in plain words. */
  threshold: string;
  cadence: string;
  owner: string;
  ownerId: string | null;
  status: "watching" | "paused";
  lastChecked: string;
  datasetId: string;
  measure: string;
  filters: Record<string, string>;
  rule: MonitorRule;
  notifySlack: boolean;
  notifyEmail: boolean;
  /** False when the data it watches is no longer available to analyse. */
  available: boolean;
}

export interface MonitorDraft {
  name: string;
  datasetId: string;
  measure: string;
  filters: Record<string, string>;
  rule: MonitorRule;
  cadence: Cadence;
  notifySlack: boolean;
  /** Email the owner when it trips. */
  notifyEmail: boolean;
}

export interface MonitorCheck {
  monitorId: string;
  triggered: boolean;
  message: string;
  /** The alert raised by this check, when it tripped. */
  alert?: Alert | null;
}
