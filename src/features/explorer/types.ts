export interface RegionRow {
  region: string;
  enrolments: number;
  completions: number;
  revenue: number;
}

export interface TrendPoint {
  month: string;
  value: number;
}

export type ChartType = "bar" | "line" | "table";
export type Aggregation = "count" | "sum" | "avg";

export interface ExploreDefinition {
  datasetId: string;
  datasetName: string;
  chartType: ChartType;
  xField: string;
  yField: string;
  aggregation: Aggregation;
  filterField: string;
  filterValue: string;
}

export interface ExploreResult {
  definition: ExploreDefinition;
  sql: string;
  explanation: string;
  columns: string[];
  rows: (string | number)[][];
  series: { name: string; value: number }[];
}
