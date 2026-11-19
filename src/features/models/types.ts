import type { PredictionModel } from "@/features/predictions";

/** What one column is for in a trained model, and why. */
export interface ColumnPlan {
  name: string;
  label: string;
  role: "feature" | "target" | "protected" | "key" | "time" | "excluded";
  kind: "numeric" | "categorical" | "text" | "time" | "other";
  reason: string;
  warning?: string;
}

export interface Confusion {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  precision: number;
  recall: number;
  f1: number;
  flaggedShare: number;
}

export interface ModelMetrics {
  rocAuc: number;
  prAuc: number;
  brier: number;
  atThreshold: Confusion;
  /** [false positive rate, true positive rate] points. */
  roc: [number, number][];
  /** [recall, precision] points. */
  pr: [number, number][];
  /** [mean predicted, observed share] per bin. */
  calibration: [number, number][];
  crossValidation: {
    folds: number;
    rocAuc: { mean: number; sd: number };
    prAuc: { mean: number; sd: number };
  };
}

export interface Baseline {
  label: string;
  rocAuc: number;
  prAuc?: number;
  column?: string;
}

export interface FairnessGroup {
  group: string;
  n: number;
  prevalence: number;
  selectionRate: number;
  recall: number;
  falseNegativeRate: number | null;
  falsePositiveRate: number;
  precision: number;
  tooSmall: boolean;
}

export interface FairnessAttribute {
  attribute: string;
  label: string;
  groups: FairnessGroup[];
  selectionRateRatio: number | null;
  recallGap: number | null;
  flags: string[];
  tooSmallGroups: string[];
}

export interface Fairness {
  audited: boolean;
  criterion?: string;
  attributes?: FairnessAttribute[];
  flags: string[];
  flagged?: boolean;
}

export interface Drift {
  columns: { column: string; label: string; psi: number; status: "stable" | "watch" | "drift" }[];
  max: number;
  status: "stable" | "watch" | "drift";
  guide: string;
}

export interface ModelCard {
  title: string;
  algorithm: string;
  predicts: string;
  intendedUse: string;
  notFor: string[];
  data: {
    dataset: string;
    version: number;
    labelled: number;
    positives: number;
    prevalence: number;
    trainRows: number;
    testRows: number;
    unlabelled: number;
    notes: string[];
  };
  features: ColumnPlan[];
  excluded: ColumnPlan[];
  warnings: string[];
  performance: {
    rocAuc: number;
    prAuc: number;
    brier: number;
    liftOverHeuristic: number | null;
  };
  baselines: Record<string, Baseline>;
  threshold: { value: number; policy: string; target: number | null; chosenOn: string };
  fairness: { audited: boolean; flags: string[]; criterion: string };
  limitations: string[];
  humanInTheLoop: string;
  importance?: { column: string; label: string; aucDrop: number }[];
  trainedBy: string;
  trainedAt: string;
}

export interface ScoringRun {
  id: string;
  rows: number;
  flagged: number;
  threshold: number | null;
  datasetVersion: number;
  drift: Drift | null;
  at: string;
}

export interface ModelDetail extends PredictionModel {
  card: ModelCard | null;
  fullMetrics: ModelMetrics | null;
  features: ColumnPlan[] | null;
  fairness: Fairness;
  drift: Drift | null;
  lastScoring: ScoringRun | null;
  canApprove: boolean;
  canScore: boolean;
  isAuthor: boolean;
}

export interface TrainOptions {
  dataset: { id: string; name: string; rows: number; timeColumn: string | null };
  months: string[];
  outcomes: { name: string; label: string; values: string[] }[];
  protected: string[];
  columns: { name: string; type: string; distinct: number; personal: boolean }[];
  algorithms: { id: string; label: string }[];
  thresholdPolicies: string[];
}

export interface TrainRequest {
  datasetId: string;
  name: string;
  version: string;
  description?: string;
  outcome: {
    column: string;
    positive: string;
    unlabelled: string[];
    label: string;
    entity: string;
  };
  protected: string[];
  exclude: string[];
  trainUntil?: string;
  algorithms: string[];
  threshold: { policy: string; target?: number };
}

export interface ScoredRecord {
  record: string;
  score: number;
  band: "High" | "Watch" | "Low";
  drivers: string[];
  [column: string]: unknown;
}

export interface ScoredView {
  scored: boolean;
  message?: string;
  title?: string;
  entity?: string;
  groupedBy?: string | null;
  dimensions?: string[];
  total?: number;
  flagged?: number | string;
  threshold?: number | null;
  groups: { group: string; records: number; flagged: number | string; averageScore: number }[];
  records: ScoredRecord[];
  recordsShown?: boolean;
  rowPolicy?: boolean;
  scoredAt?: string;
  note?: string;
}
