import type { TableCell } from "@/components";
import type { AnalysisResult, BuildMethodId } from "@/features/analysis";

/** One governance step an answer went through, with the evidence behind it. */
export interface TraceStep {
  key:
    | "screen"
    | "catalogue"
    | "planner"
    | "plan"
    | "validation"
    | "privacy"
    | "sql"
    | "sandbox"
    | "audit";
  label: string;
  status: "passed" | "blocked" | "info";
  detail: string;
  data?: Record<string, unknown>;
}

export interface AssistantTurn {
  id: string;
  question: string;
  answer: string;
  /** How the answer was worked out, or why the assistant would not answer. */
  explanation: string;
  /** The SQL that ran. Empty for a refusal. */
  sql: string;
  refused: boolean;
  /** The shared metrics and tables the answer rests on. */
  groundedIn: string[];
  /** Whether the question was read as a follow-up to the previous answer. */
  followsUp: boolean;
  when: string;
  table?: { columns: string[]; rows: TableCell[][] };
  /** The same question as a chart-builder setup, so the answer can be taken further by point and click. */
  build?: {
    method: BuildMethodId;
    dataset: string;
    measure: string;
    dimension?: string;
    /** The second measure, for a relationship. */
    measureY?: string;
  };
  /** How the answer was governed, step by step. Empty for answers given before traces were kept. */
  trace?: TraceStep[];
  /** The answer drawn as a chart. */
  chart?: Pick<AnalysisResult, "visual" | "format" | "axisFormat">;
  /** Why it refused: personal, injection, prediction, ungrounded… */
  refusalReason?: string;
}
