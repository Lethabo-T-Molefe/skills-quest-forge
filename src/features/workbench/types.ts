import type { TableCell } from "@/components";

export interface QueryResult {
  columns: string[];
  rows: TableCell[][];
  /** The SQL as the member wrote it. */
  sql: string;
  /** What ran and under which identity, or why the sandbox refused. */
  explanation: string;
  refused: boolean;
  /** True when the row cap cut the result short. */
  truncated: boolean;
  durationMs?: number;
}

export interface NotebookCell {
  id: string;
  kind: "markdown" | "sql";
  source: string;
  /** Goes up with every edit, so two people editing the same cell cannot overwrite each other silently. */
  revision: number;
  output?: QueryResult | null;
}

export interface Notebook {
  id: string;
  name: string;
  owner: string;
  ownerId: string | null;
  visibility: "private" | "team" | "organisation";
  updated: string;
  updatedAt: string;
  jupyterPath: string | null;
  cells: NotebookCell[];
}

/** A table the member may query, with its columns. */
export interface SqlTable {
  table: string;
  datasetId: string;
  name: string;
  rows: number;
  /** Whether a row policy limits the rows this member's role reads. */
  rowPolicy: boolean;
  columns: { name: string; type: string; masked: boolean }[];
}
