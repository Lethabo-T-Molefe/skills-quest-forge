import type { TableCell } from "@/components";
import type { BuildMethodId } from "@/features/analysis";

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
}
