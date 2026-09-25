import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { Connector } from "../types";

const connectors: Connector[] = [
  {
    id: "pg-servicedesk",
    name: "Service desk",
    kind: "postgres",
    status: "connected",
    tables: 14,
    owner: "Naledi Khumalo",
    lastSync: "5 days ago",
    sourcePath: "PostgreSQL · servicedesk.tickets",
  },
  {
    id: "wh-analytics",
    name: "Analytics warehouse",
    kind: "warehouse",
    status: "connected",
    tables: 38,
    owner: "Data Stewardship",
    lastSync: "Yesterday",
    sourcePath: "Warehouse · analytics.*",
  },
  {
    id: "sheet-fees",
    name: "Fee schedule",
    kind: "spreadsheet",
    status: "pending",
    tables: 1,
    owner: "Sipho Dlamini",
    lastSync: "Never",
    sourcePath: "Spreadsheet · fee_schedule.xlsx",
  },
];

export function fetchConnectors() {
  return mockResponse(connectors);
}

export const connectorsQuery = () => queryOptions({ queryKey: ["connectors"], queryFn: fetchConnectors });
