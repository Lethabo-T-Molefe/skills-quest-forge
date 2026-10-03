export type ConnectorKind = "postgres" | "warehouse" | "spreadsheet";
export type ConnectorStatus = "connected" | "pending" | "error";
export type RefreshCadence = "hourly" | "daily" | "weekly";

/** What a refresh did to one dataset read from the source. */
export interface RefreshOutcome {
  datasetId: string;
  name: string;
  /** current: approval kept · review: waits for a steward · raw: no recipe yet · unchanged · failed · skipped */
  status: "current" | "review" | "raw" | "unchanged" | "failed" | "skipped";
  detail: string;
}

export interface Connector {
  id: string;
  name: string;
  kind: ConnectorKind;
  status: ConnectorStatus;
  tables: number;
  owner: string;
  ownerId: string | null;
  lastSync: string;
  /** Where the source is, in words: "PostgreSQL · servicedesk.public". */
  sourcePath: string;
  /** Connection settings. The password is never returned. */
  config: Record<string, string | number>;
  /** Why the last connection attempt failed, when it did. */
  lastError: string | null;
  /** How often a steward has it re-read; null means only when someone asks. */
  refreshCadence: RefreshCadence | null;
  hasCredentials: boolean;
  /** Whether this member may test, approve or remove the connector. */
  canManage: boolean;
}

export interface ConnectorRequest {
  name: string;
  kind: ConnectorKind;
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  user?: string;
  password?: string;
  filename?: string;
}

export interface SourceTable {
  name: string;
  columns: number;
}
