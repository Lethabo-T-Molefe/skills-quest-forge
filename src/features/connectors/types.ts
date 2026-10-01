export type ConnectorKind = "postgres" | "warehouse" | "spreadsheet";
export type ConnectorStatus = "connected" | "pending" | "error";

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
