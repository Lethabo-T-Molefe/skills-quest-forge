export interface RootCauseFactor {
  factor: string;
  contribution: string;
  detail: string;
}

export interface Alert {
  id: string;
  metric: string;
  message: string;
  when: string;
  severity: "high" | "low";
  rootCause: RootCauseFactor[];
  /** The chart-builder setup that lets someone explore this change themselves. */
  explore?: { dataset: string; method: "explain" | "trend"; measure: string; dimension?: string };
}

export interface Monitor {
  id: string;
  name: string;
  metric: string;
  threshold: string;
  cadence: string;
  owner: string;
  status: "watching" | "paused";
  lastChecked: string;
}

export interface PredictionFactor {
  name: string;
  weight: number;
  direction: "up" | "down";
  reading: string;
}

export interface Prediction {
  subject: string;
  outcome: string;
  score: number;
  band: string;
  modelVersion: string;
  factors: PredictionFactor[];
}
