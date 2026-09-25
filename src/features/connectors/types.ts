export type ConnectorKind = "postgres" | "warehouse" | "spreadsheet";
export type ConnectorStatus = "connected" | "pending" | "error";

export interface Connector {
  id: string;
  name: string;
  kind: ConnectorKind;
  status: ConnectorStatus;
  tables: number;
  owner: string;
  lastSync: string;
  sourcePath: string;
}
