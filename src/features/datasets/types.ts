export type Classification = "restricted-personal" | "internal-confidential" | "internal-general";
export type DatasetStatus = "pending" | "approved" | "rejected";
export type Layer = "bronze" | "silver" | "gold";

export interface ColumnProfile {
  name: string;
  type: string;
  missingPct: number;
  distinct: number;
  masked?: boolean;
  sample: string;
}

export interface DatasetInsight {
  title: string;
  body: string;
  suggestion: string;
  kind: "pattern" | "quality" | "anomaly";
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  owner: string;
  source: "upload" | "connector";
  sourceName: string;
  layer: Layer;
  classification: Classification;
  status: DatasetStatus;
  rows: number;
  updated: string;
  quality: { completeness: number; conformance: number; duplicates: number; outliers: number };
  columns: ColumnProfile[];
  insights: DatasetInsight[];
}
