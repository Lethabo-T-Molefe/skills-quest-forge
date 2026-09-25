export interface AssistantTurn {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  sql: string;
  refused?: boolean;
  groundedIn?: string[];
  table?: { columns: string[]; rows: (string | number)[][] };
}
