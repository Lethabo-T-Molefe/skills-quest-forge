export interface MetricSummary {
  name: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  definition: string;
}

export interface MetricDefinition {
  name: string;
  owner: string;
  expression: string;
  usedBy: number;
}
