export interface CleaningStepDef {
  id: string;
  title: string;
  question: string;
  options: string[];
  preview: { before: string[]; after: string[] };
  affected: string;
}
