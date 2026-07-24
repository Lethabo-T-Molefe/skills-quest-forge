import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { CodeEditor } from "@/components/lab/code-editor";
import { DataTable } from "@/components/lab/data-table";
import { UploadPanel } from "@/components/lab/upload-panel";
import { Play, Loader2 } from "lucide-react";
import { executeSql } from "@/lib/api/bi";
import type { Dataset } from "@/lib/api";

export const Route = createFileRoute("/app/sql")({ component: Page });

const DEFAULT_SQL = "SELECT province, SUM(allocated) AS total_allocated\nFROM bronze.grants\nGROUP BY province\nORDER BY total_allocated DESC";

export function Page() {
  const [sql, setSql] = useState(DEFAULT_SQL);
  const runMutation = useMutation({ mutationFn: executeSql });

  function handleUploaded(dataset: Dataset) {
    setSql(`SELECT * FROM bronze.${dataset.warehouse_table} LIMIT 100`);
  }

  return (
    <>
      <PageHeader
        title="SQL Workspace"
        subtitle="Query the shared warehouse — Superset's SQL Lab runs the query, this page is the only editor you see"
      />

      <UploadPanel
        onUploaded={handleUploaded}
        subtitle="Upload CSV, TSV, JSON or Excel — query it right below"
      />

      <Panel
        title="Query"
        subtitle="Read-only SELECT statements only"
        action={<Badge tone="muted">engine: Superset</Badge>}
      >
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-ink overflow-hidden">
            <CodeEditor value={sql} onChange={setSql} language="sql" height="160px" />
          </div>
          <button
            onClick={() => runMutation.mutate(sql)}
            disabled={!sql.trim() || runMutation.isPending}
            className="self-start text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 disabled:opacity-40"
          >
            {runMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {runMutation.isPending ? "Running…" : "Run"}
          </button>
          {runMutation.isError && (
            <div className="text-sm text-danger">{(runMutation.error as Error).message}</div>
          )}
        </div>
      </Panel>

      {runMutation.data && (
        <Panel title="Results" subtitle={`${runMutation.data.rows.length} rows`}>
          <DataTable columns={runMutation.data.columns} rows={runMutation.data.rows} />
        </Panel>
      )}
    </>
  );
}
