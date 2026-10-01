export type CleaningDepth = "everyday" | "expert";
export type MethodAudience = "everyday" | "expert";
export type ChapterKind = "profile" | "transform" | "governance";

/** A cleaning method as the catalogue describes it, before it is tried on a dataset. */
export interface MethodInfo {
  id: string;
  chapterId: string;
  name: string;
  audience: MethodAudience;
  recommended: boolean;
  plain: string;
  expert: string;
  caution: string;
  operation: string;
}

/** What a method does to a sample of this dataset, as the recipe so far has left it. */
export interface MethodPreview {
  before: string[];
  after: string[];
  summary?: string;
  rowsBefore?: number;
  rowsAfter?: number;
  cellsChanged?: number;
  /** The columns the method touches. */
  affected?: string[];
  sampleSize?: number;
}

/** A method worked out for one dataset: its settings, the code it records and a before-and-after. */
export interface CleaningMethod extends MethodInfo {
  params: Record<string, unknown>;
  /** False when nothing in this data needs the method, or it cannot run on it. */
  applicable: boolean;
  unavailableReason: string | null;
  code: string;
  preview: MethodPreview;
  /** The affected columns, as one line of text. */
  affected: string;
}

export interface ChapterInfo {
  id: string;
  kind: ChapterKind;
  number: string;
  title: string;
  plain: string;
  expert: string;
  recommendedMethodId: string;
}

export interface CleaningChapter extends ChapterInfo {
  /** What profiling found in this dataset for this family of problems. */
  finding: string;
}

export interface ValueCount {
  value: string;
  count: number;
}

export interface PatternCount {
  pattern: string;
  example: string;
  count: number;
  rare?: boolean;
}

export interface ColumnProfileDeep {
  name: string;
  declaredType: string;
  inferredType: string;
  nulls: number;
  nullPct: number;
  distinct: number;
  min?: string;
  max?: string;
  mean?: string;
  median?: string;
  std?: string;
  lengthMin?: number;
  lengthMax?: number;
  topValues: ValueCount[];
  patterns: PatternCount[];
  missingness: "MCAR" | "MAR" | "MNAR" | "none";
  missingNote: string;
  masked?: boolean;
  piiKind?: string | null;
}

export interface FunctionalDependency {
  left: string;
  right: string;
  hold: boolean;
  support: string;
  violations: number;
}

export interface CrossTableCheck {
  parent: string;
  child: string;
  orphanPct: number;
  note: string;
}

export interface CleaningProfile {
  rows: number;
  columns: ColumnProfileDeep[];
  littlesMcar: { statistic: string; pValue: string; reading: string };
  dependencies: FunctionalDependency[];
  candidateKeys: string[];
  crossTable: CrossTableCheck[];
  dimensions: { name: string; score: string; note: string }[];
}

export interface RecipeStep {
  stepId: string;
  methodId: string;
  chapterId: string;
  /** The chapter's title. */
  title: string;
  /** The chosen method's name. */
  option: string;
  status: "accepted" | "skipped";
  params: Record<string, unknown>;
  summary: string;
  code: string;
  position: number;
}

export interface CleaningRecipe {
  id: string;
  datasetId: string;
  version: number;
  name: string;
  status: "draft" | "applied";
  visibility: "private" | "team" | "organisation";
  steps: RecipeStep[];
  savedAt: string;
  saved: string;
  outputTable: string | null;
  outputRows: number | null;
  outputChecksum: string | null;
  /** The whole recipe as one script. */
  code: string;
}

/** Everything the cleaning screen needs for one dataset. */
export interface CleaningStudio {
  datasetId: string;
  layer: "bronze" | "silver" | "gold";
  chapters: CleaningChapter[];
  methods: CleaningMethod[];
  /** How many rows the previews were worked out on. */
  sampleSize: number;
  columnsNow: string[];
  profile: CleaningProfile | null;
  /** The member's draft, or for members who cannot clean this dataset the latest recipe (if any). */
  recipe: CleaningRecipe | null;
  canEdit: boolean;
}

export interface CleaningCatalogue {
  chapters: ChapterInfo[];
  methods: MethodInfo[];
}

/** The result of running a recipe over the full raw data. */
export interface CleaningRun {
  recipe: CleaningRecipe;
  rows: number;
  table: string;
  masked: string[];
  checksum: string;
  steps: { summary: string; rowsBefore: number; rowsAfter: number; cellsChanged: number }[];
  nextStep: string;
  /** Reruns only: whether the output matched the earlier run exactly. Null when there was nothing to compare. */
  reproduced?: boolean | null;
  note?: string;
}
