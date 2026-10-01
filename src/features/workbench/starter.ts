import type { SqlTable } from "./types";

/**
 * A first query for a table: its readable columns, by name. Masked personal columns are left out, because
 * the sandbox refuses a query that selects them (and so refuses SELECT * on a table that has any).
 */
export function starterQuery(table: SqlTable) {
  const columns = table.columns.filter((column) => !column.masked).map((column) => column.name);
  const list = columns.length > 0 ? columns.join(",\n       ") : "*";
  return `SELECT ${list}\nFROM   ${table.table}\nLIMIT  20;`;
}
