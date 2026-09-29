export interface AssistantTurn {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  sql: string;
  refused?: boolean;
  groundedIn?: string[];
  table?: { columns: string[]; rows: (string | number)[][] };
  /** The same question as a chart-builder setup, so the answer can be taken further by point and click. */
  build?: { method: "summarise" | "compare" | "trend"; dataset: string; measure: string; dimension?: string };
}
