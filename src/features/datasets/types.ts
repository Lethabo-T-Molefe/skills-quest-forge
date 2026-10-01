import type { JourneyStep, TableCell } from "@/components";
import type { CleaningProfile } from "@/features/cleaning";

export type Classification = "restricted-personal" | "internal-confidential" | "internal-general";
export type DatasetStatus = "pending" | "approved" | "rejected";
export type Layer = "bronze" | "silver" | "gold";
export type Visibility = "private" | "team" | "organisation";

export interface ColumnProfile {
  name: string;
  type: string;
  missingPct: number;
  distinct: number;
  masked?: boolean;
  sample: string | null;
}

export type InsightAction = "clean" | "chart" | "ask" | "monitor";

export interface DatasetInsight {
  id: string;
  kind: "pattern" | "quality" | "anomaly";
  title: string;
  body: string;
  suggestion: string;
  /** What the suggestion leads to. */
  action: InsightAction;
  /** The cleaning step or the column the suggestion acts on. */
  target: { value: string } | null;
  status: "open" | "accepted" | "dismissed";
}

export type NextStepKind = "clean" | "view" | "approve" | "wait" | "rejected" | "analyse";

/** The one thing to do next with a dataset, worked out by the API for the member's role. */
export interface NextStep {
  kind: NextStepKind;
  label: string;
  /** One sentence on why this is the next step. */
  reason: string;
}

export interface DatasetQuality {
  completeness: number;
  conformance: number;
  duplicates: number;
  outliers: number;
  /** The same measures on the cleaned table, once a recipe has run. */
  afterCleaning?: Omit<DatasetQuality, "afterCleaning">;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerId: string | null;
  source: "upload" | "connector";
  sourceName: string;
  layer: Layer;
  layerLabel: string;
  classification: Classification;
  classificationLabel: string;
  status: DatasetStatus;
  visibility: Visibility;
  rows: number;
  version: number;
  /** The table analysis reads, once the dataset is cleaned. */
  table: string | null;
  /** Approved and cleaned, so it can be analysed. */
  queryable: boolean;
  updated: string;
  updatedAt: string;
  quality: DatasetQuality;
  columns: ColumnProfile[];
  /** Personal columns and the kind of information each holds. */
  piiColumns: Record<string, string>;
  insights: DatasetInsight[];
  nextStep: NextStep;
  journey: JourneyStep[];
  decision: { reason: string | null; at: string | null } | null;
}

export interface DatasetDetail extends Dataset {
  profile: CleaningProfile | null;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  transform: "upload" | "connector" | "clean" | "promote" | "erase" | string;
  detail: string;
  recipeId: string | null;
  actor: string;
  at: string;
  when: string;
}

export interface DatasetVersion {
  version: number;
  layer: Layer;
  table: string;
  rows: number;
  checksum: string | null;
  at: string;
}

export interface RowsPreview {
  table: string;
  columns: string[];
  rows: TableCell[][];
  masked: string[];
}

export interface SharedMember {
  id: string;
  name: string;
  email: string;
}

export interface ErasureReceipt {
  datasetId: string;
  erasedAt: string;
  tablesDropped: string[];
  filesRemoved: boolean;
  reason: string;
  receipt: string;
}

export interface UploadOptions {
  name?: string;
  description?: string;
  classification: Classification;
  visibility: Visibility;
}
