import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { Notebook, QueryResult } from "../types";

const defaultSql = `SELECT region,
       ROUND(AVG(fee_paid), 2) AS avg_fee
FROM   gold.enrolments_clean
WHERE  enrolled_on >= DATE '2026-01-01'
GROUP  BY region
ORDER  BY avg_fee DESC;`;

const regionResult: QueryResult = {
  sql: defaultSql,
  explanation: "Ran under a least-privilege identity against gold.enrolments_clean. Personal columns stay masked.",
  columns: ["region", "avg_fee"],
  rows: [
    ["Gauteng", 1348],
    ["Western Cape", 1291],
    ["KwaZulu-Natal", 1154],
    ["Eastern Cape", 1043],
    ["Free State", 982],
  ],
};

const notebooks: Notebook[] = [
  {
    id: "nb-enrolment",
    name: "Enrolment quality notes",
    owner: "Sipho Dlamini",
    updated: "Yesterday",
    cells: [
      {
        id: "md1",
        kind: "markdown",
        source:
          "A short notebook on enrolment quality. Each SQL cell runs in the sandbox against permitted gold tables only.",
      },
      {
        id: "sql1",
        kind: "sql",
        source: defaultSql,
        output: regionResult,
      },
      {
        id: "md2",
        kind: "markdown",
        source: "Free State is the outlier. Next: join regional revenue and ask the assistant for a root-cause read.",
      },
    ],
  },
];

export function fetchNotebooks() {
  return mockResponse(notebooks);
}

export const notebooksQuery = () => queryOptions({ queryKey: ["workbench", "notebooks"], queryFn: fetchNotebooks });

export async function runSql(sql: string): Promise<QueryResult> {
  await mockResponse(true, 480);
  const lower = sql.toLowerCase();
  if (lower.includes("insert") || lower.includes("update") || lower.includes("delete") || lower.includes("drop")) {
    return {
      sql,
      refused: true,
      explanation: "This identity can only read permitted objects. Write and administrative statements are blocked.",
      columns: [],
      rows: [],
    };
  }
  if (lower.includes("learner") && lower.includes("name")) {
    return {
      sql,
      refused: true,
      explanation: "full_name is masked personal information and is not available to this role.",
      columns: [],
      rows: [],
    };
  }
  return { ...regionResult, sql };
}

export const starterSql = defaultSql;
