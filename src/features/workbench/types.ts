export interface QueryResult {
  columns: string[];
  rows: (string | number)[][];
  sql: string;
  explanation: string;
  refused?: boolean;
}

export interface NotebookCell {
  id: string;
  kind: "markdown" | "sql";
  source: string;
  output?: QueryResult;
}

export interface Notebook {
  id: string;
  name: string;
  owner: string;
  updated: string;
  cells: NotebookCell[];
}
