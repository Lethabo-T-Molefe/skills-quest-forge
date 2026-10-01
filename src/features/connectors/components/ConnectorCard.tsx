import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, ConfirmDialog, Notice, QuietButton } from "@/components";
import { hasPermission, useCurrentUser } from "@/features/auth";
import { errorMessage } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import {
  approveConnector,
  connectorTablesQuery,
  deleteConnector,
  importTable,
  refreshConnectors,
  syncConnector,
  testConnector,
  uploadWorkbook,
} from "../api/connectors";
import type { Connector } from "../types";

const smallButton = "px-3 py-1.5 text-xs";

const statusTone = { connected: "ok", pending: "warn", error: "signal" } as const;

/** One connection: its state, what a member may do with it, and its tables once it is connected. */
export function ConnectorCard({ connector }: { connector: Connector }) {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const workbook = useRef<HTMLInputElement>(null);
  const [browsing, setBrowsing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const mine = connector.ownerId === user.id;
  const mayTest = mine || connector.canManage;
  const mayImport = hasPermission(user, "upload") && connector.status === "connected";
  const tables = useQuery({
    ...connectorTablesQuery(connector.id),
    enabled: browsing && connector.status === "connected",
  });

  const change = useMutation({
    mutationFn: (action: "approve" | "test") =>
      action === "approve" ? approveConnector(connector.id) : testConnector(connector.id),
    onSuccess: async (updated) => {
      await refreshConnectors(queryClient);
      if (updated.status === "connected") {
        toast.success(`${updated.name} is connected`, {
          description: `${updated.tables} ${updated.tables === 1 ? "table" : "tables"} can be imported.`,
        });
      } else if (updated.status === "error") {
        toast.error(`${updated.name} could not connect`, {
          description: updated.lastError ?? undefined,
        });
      } else {
        toast.success(`${updated.name} works`, {
          description: "It still needs a steward's approval.",
        });
      }
    },
    onError: notifyError("The connection could not be checked."),
  });

  const upload = useMutation({
    mutationFn: (file: File) => uploadWorkbook(connector.id, file),
    onSuccess: async () => {
      await refreshConnectors(queryClient);
      await queryClient.invalidateQueries({ queryKey: ["connectors", connector.id] });
      toast.success("Workbook uploaded", { description: "Each sheet is offered as a table." });
    },
    onError: notifyError("The workbook could not be uploaded."),
    onSettled: () => {
      if (workbook.current) workbook.current.value = "";
    },
  });

  const bring = useMutation({
    mutationFn: (table: string) => importTable(connector.id, table),
    onSuccess: async (dataset) => {
      await refreshConnectors(queryClient);
      toast.success(`${dataset.name} imported`, {
        description: "It landed as raw data and is ready to clean.",
      });
    },
    onError: notifyError("The table could not be imported."),
  });

  const sync = useMutation({
    mutationFn: () => syncConnector(connector.id),
    onSuccess: async (datasets) => {
      await refreshConnectors(queryClient);
      toast.success(
        datasets.length === 0
          ? "Nothing to refresh yet"
          : `${datasets.length} ${datasets.length === 1 ? "dataset" : "datasets"} refreshed`,
        {
          description:
            datasets.length === 0
              ? "Import a table first."
              : "Each has a new version. Rerun its recipe to clean it.",
        },
      );
    },
    onError: notifyError("The source could not be synced."),
  });

  const remove = useMutation({
    mutationFn: () => deleteConnector(connector.id),
    onSuccess: async () => {
      await refreshConnectors(queryClient);
      toast.success(`${connector.name} removed`);
    },
    onError: notifyError("The connector could not be removed."),
  });

  const busy = change.isPending || upload.isPending || sync.isPending || remove.isPending;

  return (
    <li className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{connector.name}</p>
          <p className="text-xs break-words text-muted-foreground">{connector.sourcePath}</p>
        </div>
        <Chip tone={statusTone[connector.status]}>{connector.status}</Chip>
      </div>
      <p className="num mt-2 text-xs text-muted-foreground">
        {connector.tables} {connector.tables === 1 ? "table" : "tables"} · owner {connector.owner} ·
        synced {connector.lastSync.toLowerCase()}
      </p>
      {connector.status === "error" && connector.lastError ? (
        <p className="mt-2 text-xs text-destructive">{connector.lastError}</p>
      ) : null}
      {connector.status === "pending" && !connector.canManage ? (
        <p className="mt-2 text-xs text-muted-foreground">Waiting for a steward to approve it.</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {connector.status === "connected" ? (
          <QuietButton
            className={smallButton}
            aria-expanded={browsing}
            onClick={() => setBrowsing((open) => !open)}
          >
            {browsing ? "Hide the tables" : "Browse tables"}
          </QuietButton>
        ) : null}
        {connector.canManage && connector.status !== "connected" ? (
          <QuietButton
            className={smallButton}
            disabled={busy}
            onClick={() => change.mutate("approve")}
          >
            {change.isPending && change.variables === "approve"
              ? "Connecting…"
              : "Test and approve"}
          </QuietButton>
        ) : null}
        {mayTest ? (
          <QuietButton
            className={smallButton}
            disabled={busy}
            onClick={() => change.mutate("test")}
          >
            {change.isPending && change.variables === "test" ? "Testing…" : "Test"}
          </QuietButton>
        ) : null}
        {connector.kind === "spreadsheet" && mayTest ? (
          <>
            <input
              ref={workbook}
              type="file"
              accept=".xlsx,.xlsm"
              className="sr-only"
              aria-label={`Workbook for ${connector.name}`}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload.mutate(file);
              }}
            />
            <QuietButton
              className={smallButton}
              disabled={busy}
              onClick={() => workbook.current?.click()}
            >
              {upload.isPending ? "Uploading…" : "Upload the workbook"}
            </QuietButton>
          </>
        ) : null}
        {connector.status === "connected" && mayTest && hasPermission(user, "upload") ? (
          <QuietButton className={smallButton} disabled={busy} onClick={() => sync.mutate()}>
            {sync.isPending ? "Syncing…" : "Sync its datasets"}
          </QuietButton>
        ) : null}
        {connector.canManage ? (
          <QuietButton className={smallButton} disabled={busy} onClick={() => setRemoving(true)}>
            Remove
          </QuietButton>
        ) : null}
      </div>

      {browsing && connector.status === "connected" ? (
        <div className="mt-3 border-t border-border pt-3">
          {tables.isPending ? (
            <p className="text-sm text-muted-foreground">Reading the source…</p>
          ) : tables.isError ? (
            <Notice tone="signal" title="The tables could not be listed">
              {errorMessage(tables.error)}
            </Notice>
          ) : tables.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">This source has no tables to read.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {tables.data.map((table) => (
                <li key={table.name} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="font-mono text-[13px] break-all">{table.name}</span>
                    <span className="num block text-xs text-muted-foreground">
                      {table.columns} columns
                    </span>
                  </span>
                  {mayImport ? (
                    <QuietButton
                      className={smallButton}
                      disabled={bring.isPending}
                      onClick={() => bring.mutate(table.name)}
                    >
                      {bring.isPending && bring.variables === table.name ? "Importing…" : "Import"}
                      <span className="sr-only"> {table.name}</span>
                    </QuietButton>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {bring.data ? (
            <p className="mt-2 text-sm">
              <Link
                to="/datasets/$datasetId"
                params={{ datasetId: bring.data.id }}
                className="text-signal-strong underline-offset-4 hover:underline"
              >
                Open {bring.data.name}
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={removing}
        title={`Remove ${connector.name}?`}
        confirmLabel="Remove the connector"
        onConfirm={() => remove.mutate()}
        onClose={() => setRemoving(false)}
      >
        The connection and its stored credentials are deleted. Datasets already imported from it
        stay, but can no longer be synced.
      </ConfirmDialog>
    </li>
  );
}
