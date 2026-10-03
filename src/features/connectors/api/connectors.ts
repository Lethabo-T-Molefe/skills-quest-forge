import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Dataset } from "@/features/datasets";
import type {
  Connector,
  ConnectorRequest,
  RefreshCadence,
  RefreshOutcome,
  SourceTable,
} from "../types";

const path = (connectorId: string, rest = "") =>
  `/connectors/${encodeURIComponent(connectorId)}${rest}`;

export const connectorsQuery = () =>
  queryOptions({ queryKey: ["connectors"], queryFn: () => api.get<Connector[]>("/connectors") });

/** The tables (or sheets) a connected source offers. */
export const connectorTablesQuery = (connectorId: string) =>
  queryOptions({
    queryKey: ["connectors", connectorId, "tables"],
    queryFn: () => api.get<SourceTable[]>(path(connectorId, "/tables")),
    retry: false,
  });

export function refreshConnectors(queryClient: QueryClient) {
  return Promise.all(
    [["connectors"], ["datasets"], ["audit"]].map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  );
}

/** Ask for a read-only connection. A steward's own request is tested and connected at once. */
export function requestConnector(request: ConnectorRequest) {
  return api.post<Connector>("/connectors", request);
}

export function approveConnector(connectorId: string) {
  return api.post<Connector>(path(connectorId, "/approve"));
}

/** Try the connection again and record whether it worked. */
export function testConnector(connectorId: string) {
  return api.post<Connector>(path(connectorId, "/test"));
}

/** Spreadsheet connectors read an uploaded workbook; each sheet is offered as a table. */
export function uploadWorkbook(connectorId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return api.post<Connector>(path(connectorId, "/workbook"), form);
}

/** Bring one source table in as a dataset. It lands in bronze and is profiled like an upload. */
export function importTable(connectorId: string, table: string, name?: string) {
  return api.post<Dataset>(path(connectorId, "/import"), { table, ...(name ? { name } : {}) });
}

/**
 * Refresh now: re-read every dataset from this source and rerun its saved recipe. An approved dataset stays
 * approved only when its columns, types and personal information are unchanged.
 */
export function syncConnector(connectorId: string) {
  return api.post<RefreshOutcome[]>(path(connectorId, "/sync"));
}

/** Stewards only: how often the source is re-read on its own. */
export function setRefreshCadence(connectorId: string, refreshCadence: RefreshCadence | null) {
  return api.patch<Connector>(path(connectorId), { refreshCadence });
}

export function deleteConnector(connectorId: string) {
  return api.delete(path(connectorId));
}
