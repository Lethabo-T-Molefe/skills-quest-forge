import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/lab/panel";
import { UploadPanel } from "@/components/lab/upload-panel";
import { EXPLORABLE_TABLES } from "@/lib/api/analytics";
import { useExploreTable } from "@/lib/queries/analytics";
import type { Dataset } from "@/lib/api";

export const Route = createFileRoute("/app/explorer")({ component: Page });

function Page() {
  const [table, setTable] = useState<string>(EXPLORABLE_TABLES[0]);
  const [uploaded, setUploaded] = useState<Dataset | null>(null);
  const { data, isLoading, isError } = useExploreTable(table);
  const columns = data?.columns ?? [];
  const rows = data?.rows ?? [];

  return (
    <>
      <PageHeader
        title="Data Explorer"
        subtitle={`Visual table browser · bronze.${table}`}
        actions={
          <select
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="bg-muted border border-border rounded-md h-9 px-3 text-sm"
          >
            {EXPLORABLE_TABLES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        }
      />

      <UploadPanel
        onUploaded={setUploaded}
        subtitle="Upload CSV, TSV, JSON or Excel — browse it here via SQL Workspace or Notebooks"
      />
      {uploaded && (
        <div className="text-xs text-muted-foreground -mt-2">
          bronze.{uploaded.warehouse_table} isn't in this page's fixed table list yet — query it directly from{" "}
          <Link to="/app/sql" className="underline">SQL Workspace</Link>.
        </div>
      )}

      <Panel
        title="Sample rows"
        subtitle={isLoading ? "Loading…" : isError ? "Query failed" : `${rows.length} rows shown`}
      >
        {columns.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            {isLoading ? "Loading…" : isError ? "This table isn't loaded in the warehouse yet." : "No rows."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs font-mono">
              <thead className="bg-muted">
                <tr>
                  {columns.map((c) => (
                    <th key={c} className="text-left p-2 font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-t border-border odd:bg-muted/30">
                    {row.map((cell, j) => (
                      <td key={j} className="p-2">{cell === null || cell === undefined ? "—" : String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
