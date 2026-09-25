import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { AssistantTurn } from "../types";

const feeByRegion: AssistantTurn = {
  id: "a1",
  question: "What was the average fee by region last quarter?",
  answer: "Gauteng leads on average fee at R1 348, with Free State lowest at R982.",
  explanation:
    "I used the shared metric average fee paid, filtered course completions to the last quarter, grouped by region and averaged the fee. Rows you are not permitted to see were excluded before the average was taken.",
  groundedIn: ["Metric · Average fee paid", "gold.enrolments_clean", "Role row filters"],
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
};

const completionTrend: AssistantTurn = {
  id: "a3",
  question: "How has completion rate changed by course this year?",
  answer: "Completion rate rose from 61.4% in January to 66.3% now. SQL basics crossed 70% for the first time.",
  explanation:
    "I used the shared metric completion rate, which is completions divided by enrolments in the period. I grouped by course and compared the current year to January.",
  groundedIn: ["Metric · Completion rate", "gold.completions"],
  sql: `SELECT course,
       ROUND(SUM(completed)::numeric / NULLIF(SUM(enrolled), 0), 3) AS completion_rate
FROM   gold.completions
WHERE  year = 2026
GROUP  BY course
ORDER  BY completion_rate DESC;`,
  table: {
    columns: ["Course", "Completion rate", "Enrolments"],
    rows: [
      ["SQL basics", "71.2%", 4120],
      ["Data literacy", "68.4%", 8940],
      ["Python for analysts", "64.1%", 5310],
      ["Stewardship 101", "59.8%", 2180],
    ],
  },
};

const activeLearners: AssistantTurn = {
  id: "a4",
  question: "How many active learners are there this month?",
  answer: "There are 12 480 active learners, up 4.2% from last month.",
  explanation:
    "Active learner is defined once in the semantic layer: a learner with at least one session in the last 30 days. I counted distinct learner IDs that match that definition.",
  groundedIn: ["Metric · Active learners", "gold.sessions"],
  sql: `SELECT COUNT(DISTINCT learner_id) AS active_learners
FROM   gold.sessions
WHERE  last_session >= CURRENT_DATE - INTERVAL '30 days';`,
  table: {
    columns: ["Active learners", "Previous month", "Change"],
    rows: [["12 480", "11 977", "+4.2%"]],
  },
};

const dropoutRefusal: AssistantTurn = {
  id: "a2",
  question: "Which learners are most likely to drop out next month?",
  answer:
    "I can't answer that from the data you are permitted to see. Drop-out risk is not a defined metric in the semantic layer, and learner-level personal data is masked for your role.",
  explanation:
    "I refused rather than guessing. Ask a Steward to define a drop-out risk metric, or try: how has completion rate changed by course this year?",
  sql: "",
  refused: true,
  groundedIn: [],
};

const ungrounded: AssistantTurn = {
  id: "ungrounded",
  question: "",
  answer:
    "I can't ground that request in a defined metric or in data you are allowed to see, so I won't guess at a number.",
  explanation:
    "Try asking about active learners, completion rate, average fee paid, or enrolments by region. Those are defined in the semantic layer.",
  sql: "",
  refused: true,
  groundedIn: [],
};

const assistantExamples: AssistantTurn[] = [feeByRegion, dropoutRefusal, completionTrend];

export function fetchAssistantExamples() {
  return mockResponse(assistantExamples);
}

export const assistantExamplesQuery = () =>
  queryOptions({ queryKey: ["assistant", "examples"], queryFn: fetchAssistantExamples });

export async function askAssistant(question: string): Promise<AssistantTurn> {
  const q = question.toLowerCase();
  await mockResponse(true, 720);

  let match: AssistantTurn = ungrounded;
  if (q.includes("drop") || q.includes("personal") || q.includes("id number") || q.includes("who is")) {
    match = dropoutRefusal;
  } else if (q.includes("fee") || q.includes("region") || q.includes("average")) {
    match = feeByRegion;
  } else if (q.includes("complete")) {
    match = completionTrend;
  } else if (q.includes("active") || q.includes("how many")) {
    match = activeLearners;
  }

  return {
    ...match,
    id: `q-${Date.now()}`,
    question,
  };
}
