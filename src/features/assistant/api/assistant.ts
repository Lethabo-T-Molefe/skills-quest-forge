import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { AssistantTurn } from "../types";

const assistantExamples: AssistantTurn[] = [
  {
    id: "a1",
    question: "What was the average fee by region last quarter?",
    answer: "Gauteng leads on average fee at R1 348, with Free State lowest at R982.",
    explanation:
      "I used the shared metric average fee paid, filtered course completions to the last quarter, grouped by region and averaged the fee. Rows you are not permitted to see were excluded before the average was taken.",
    sql: `SELECT region,
       ROUND(AVG(fee_paid), 2) AS avg_fee
FROM   gold.enrolments_clean
WHERE  enrolled_on >= DATE '2026-01-01'
  AND  enrolled_on <  DATE '2026-04-01'
GROUP  BY region
ORDER  BY avg_fee DESC;`,
    table: {
      columns: ["Region", "Average fee", "Enrolments"],
      rows: [
        ["Gauteng", "R1 348", 19740],
        ["Western Cape", "R1 291", 9120],
        ["KwaZulu-Natal", "R1 154", 7480],
        ["Eastern Cape", "R1 043", 4310],
        ["Free State", "R982", 2390],
      ],
    },
  },
  {
    id: "a2",
    question: "Which learners are most likely to drop out next month?",
    answer:
      "I can't answer that from the data you are permitted to see. Drop-out risk is not a defined metric in the semantic layer, and learner-level personal data is masked for your role.",
    explanation:
      "I refused rather than guessing. Ask a Steward to define a drop-out risk metric, or try: how has completion rate changed by course this year?",
    sql: "",
    refused: true,
  },
];

export function fetchAssistantExamples() {
  return mockResponse(assistantExamples);
}

export const assistantExamplesQuery = () =>
  queryOptions({ queryKey: ["assistant", "examples"], queryFn: fetchAssistantExamples });
