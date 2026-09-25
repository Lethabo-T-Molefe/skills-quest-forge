export interface CleaningStepDef {
  id: string;
  title: string;
  question: string;
  options: string[];
  preview: { before: string[]; after: string[] };
  affected: string;
}

export interface RecipeStep {
  stepId: string;
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
