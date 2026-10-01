import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Notebook, NotebookCell, QueryResult, SqlTable } from "../types";

const notebookPath = (notebookId: string, rest = "") =>
  `/notebooks/${encodeURIComponent(notebookId)}${rest}`;

/**
 * Run a read-only query in the sandbox. A refusal is a result, not an error: it comes back with the reason
 * (a write statement, a table the member may not read, a masked column) so the page can explain it.
 */
export function runSql(sql: string, maxRows = 500) {
  return api.post<QueryResult>("/sql/run", { sql, maxRows });
}

export const sqlTablesQuery = () =>
  queryOptions({ queryKey: ["sql", "tables"], queryFn: () => api.get<SqlTable[]>("/sql/tables") });

export const notebooksQuery = () =>
  queryOptions({ queryKey: ["notebooks"], queryFn: () => api.get<Notebook[]>("/notebooks") });

export function createNotebook(name: string, cells?: Pick<NotebookCell, "kind" | "source">[]) {
  return api.post<Notebook>("/notebooks", { name, ...(cells ? { cells } : {}) });
}

export function deleteNotebook(notebookId: string) {
  return api.delete(notebookPath(notebookId));
}

export function addCell(notebookId: string, kind: NotebookCell["kind"], source = "") {
  return api.post<Notebook>(notebookPath(notebookId, "/cells"), { kind, source });
}

/** Save an edit. The revision the edit was based on is sent; a newer one from someone else is a 409. */
export function saveCell(notebookId: string, cell: NotebookCell, source: string) {
  return api.put<Notebook>(notebookPath(notebookId, `/cells/${encodeURIComponent(cell.id)}`), {
    kind: cell.kind,
    source,
    revision: cell.revision,
  });
}

export function deleteCell(notebookId: string, cellId: string) {
  return api.delete<Notebook>(notebookPath(notebookId, `/cells/${encodeURIComponent(cellId)}`));
}

export function runCell(notebookId: string, cellId: string) {
  return api.post<QueryResult>(
    notebookPath(notebookId, `/cells/${encodeURIComponent(cellId)}/run`),
  );
}
