import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { Notice } from "@/components";
import { errorMessage } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { sqlTablesQuery } from "../api/workbench";
import { starterQuery } from "../starter";

/** The approved tables this member may query, with their columns. Choosing one starts a query on it. */
export function TableBrowser({ onPick }: { onPick: (sql: string) => void }) {
  const tables = useQuery(sqlTablesQuery());

  if (tables.isPending) return <p className="text-sm text-muted-foreground">Loading tables…</p>;
  if (tables.isError) {
    return (
      <Notice tone="signal" title="The tables did not load">
        {errorMessage(tables.error)}
      </Notice>
    );
  }
  if (tables.data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No approved tables yet. A dataset can be queried once it is cleaned and a steward approves
        it.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {tables.data.map((table) => (
        <li key={table.table}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <button
              type="button"
              className="font-mono text-[13px] break-all text-signal-strong underline-offset-4 hover:underline"
              title="Start a query on this table"
              onClick={() => onPick(starterQuery(table))}
            >
              {table.table}
            </button>
            <span className="num text-xs text-muted-foreground">
              {table.name} · {formatNumber(table.rows)} rows
              {table.rowPolicy ? " · row policy applies" : ""}
            </span>
          </div>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {table.columns.map((column) => (
              <li
                key={column.name}
                className="inline-flex items-center gap-1 bg-surface-alt px-2 py-0.5 font-mono text-xs"
                title={
                  column.masked
                    ? "Personal information: this column cannot be selected"
                    : column.type
                }
              >
                {column.masked ? (
                  <Lock
                    className="size-3 text-signal-strong"
                    strokeWidth={1.75}
                    aria-label="Masked"
                  />
                ) : null}
                {column.name}
                <span className="font-sans text-muted-foreground">{column.type}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
