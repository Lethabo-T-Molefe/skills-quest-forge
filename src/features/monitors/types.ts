import type { BuildMethodId } from "@/features/analysis";

export interface RootCauseFactor {
  factor: string;
  contribution: string;
  detail: string;
}

export interface Alert {
  id: string;
  monitorId: string;
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
  previousMonth: string;
}

/** What trips a monitor. */
export type RuleKind = "change" | "above" | "below" | "band";
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
}

export interface MonitorCheck {
  monitorId: string;
  triggered: boolean;
  message: string;
  /** The alert raised by this check, when it tripped. */
  alert?: Alert | null;
}
