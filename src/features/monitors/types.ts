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
