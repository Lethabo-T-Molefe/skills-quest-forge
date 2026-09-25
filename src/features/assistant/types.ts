export interface AssistantTurn {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  sql: string;
  refused?: boolean;
  table?: { columns: string[]; rows: (string | number)[][] };
}
