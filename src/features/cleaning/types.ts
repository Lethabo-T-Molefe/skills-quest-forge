export type CleaningDepth = "everyday" | "expert";
export type MethodAudience = "everyday" | "expert";
export type ChapterKind = "profile" | "transform" | "governance";

export interface CleaningMethod {
  id: string;
  chapterId: string;
  name: string;
  audience: MethodAudience;
  recommended?: boolean;
  plain: string;
  expert: string;
  caution: string;
  code: string;
  preview: { before: string[]; after: string[] };
  affected: string;
}

export interface CleaningChapter {
  id: string;
  kind: ChapterKind;
  number: string;
  title: string;
  plain: string;
  finding: string;
  expert: string;
  recommendedMethodId: string;
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
  chapterId: string;
  title: string;
  option: string;
  status: "accepted" | "skipped";
}

export interface CleaningRecipe {
  id: string;
  datasetId: string;
  version: number;
  steps: RecipeStep[];
  savedAt: string;
}

export interface CleaningStudioData {
  chapters: CleaningChapter[];
  methods: CleaningMethod[];
}
