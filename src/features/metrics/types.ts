export interface MetricSummary {
  name: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  definition: string;
}

export interface MetricDefinition {
  id: string;
  name: string;
  owner: string;
  expression: string;
  description: string;
  usedBy: number;
  grain: string;
  status: "published" | "draft";
}
