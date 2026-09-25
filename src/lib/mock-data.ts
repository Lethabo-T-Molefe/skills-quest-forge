/** Mock data for the DataForge frontend prototype. No backend is wired up. */

export type Classification = "restricted-personal" | "internal-confidential" | "internal-general";
export type DatasetStatus = "pending" | "approved" | "rejected";
export type Layer = "bronze" | "silver" | "gold";

export interface ColumnProfile {
  name: string;
  type: string;
  missingPct: number;
  distinct: number;
  masked?: boolean;
  sample: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  owner: string;
  source: "upload" | "connector";
  sourceName: string;
  layer: Layer;
  classification: Classification;
  status: DatasetStatus;
  rows: number;
  updated: string;
  quality: { completeness: number; conformance: number; duplicates: number; outliers: number };
  columns: ColumnProfile[];
  insights: { title: string; body: string; suggestion: string; kind: "pattern" | "quality" | "anomaly" }[];
}

export const currentUser = {
  name: "Thandi Mokoena",
  role: "Everyday Analyst",
  workspace: "Thandi's workspace",
  initials: "TM",
};

export const datasets: Dataset[] = [
  {
    id: "learner-enrolments",
    name: "Learner enrolments 2026",
    description: "Raw enrolment export from the training portal, one row per enrolment.",
    owner: "Thandi Mokoena",
    source: "upload",
    sourceName: "enrolments_q3.csv",
    layer: "bronze",
    classification: "restricted-personal",
    status: "pending",
    rows: 48213,
    updated: "2 hours ago",
    quality: { completeness: 87, conformance: 74, duplicates: 312, outliers: 45 },
    columns: [
      { name: "learner_id", type: "string", missingPct: 0, distinct: 47901, sample: "LR-100238" },
      { name: "full_name", type: "string", missingPct: 1, distinct: 47120, masked: true, sample: "T••••• M•••••" },
      { name: "id_number", type: "string", missingPct: 3, distinct: 47880, masked: true, sample: "••••••••••123" },
      { name: "enrolled_on", type: "mixed", missingPct: 6, distinct: 268, sample: "2026/03/14" },
      { name: "course", type: "string", missingPct: 0, distinct: 42, sample: "Data literacy" },
      { name: "region", type: "string", missingPct: 12, distinct: 9, sample: "Gauteng" },
      { name: "fee_paid", type: "string", missingPct: 4, distinct: 1904, sample: "R 1 250.00" },
    ],
    insights: [
      {
        kind: "quality",
        title: "Enrolment dates use three different formats",
        body: "6% of enrolled_on values are missing and the rest mix 2026/03/14, 14-03-2026 and March 14 2026.",
        suggestion: "Standardise the date format",
      },
      {
        kind: "pattern",
        title: "Gauteng accounts for 41% of enrolments",
        body: "Region is heavily concentrated, and 12% of rows have no region at all.",
        suggestion: "Chart enrolments by region",
      },
      {
        kind: "anomaly",
        title: "312 duplicate learner records",
        body: "The same learner_id appears more than once with identical course and date.",
        suggestion: "Remove duplicate rows",
      },
    ],
  },
  {
    id: "course-completions",
    name: "Course completions",
    description: "Cleaned completions with outcome and elapsed days, ready for analysis.",
    owner: "Sipho Dlamini",
    source: "connector",
    sourceName: "Warehouse · analytics.completions",
    layer: "silver",
    classification: "internal-confidential",
    status: "approved",
    rows: 31980,
    updated: "Yesterday",
    quality: { completeness: 99, conformance: 100, duplicates: 0, outliers: 8 },
    columns: [
      { name: "learner_id", type: "string", missingPct: 0, distinct: 31980, sample: "LR-100238" },
      { name: "course", type: "string", missingPct: 0, distinct: 42, sample: "Data literacy" },
      { name: "completed_on", type: "date", missingPct: 0, distinct: 301, sample: "2026-03-14" },
      { name: "outcome", type: "string", missingPct: 0, distinct: 3, sample: "passed" },
      { name: "days_to_complete", type: "integer", missingPct: 0, distinct: 180, sample: "27" },
    ],
    insights: [
      {
        kind: "pattern",
        title: "Completion time fell by 11 days since January",
        body: "Median days_to_complete dropped from 38 to 27 across the period.",
        suggestion: "Track this as a monitored metric",
      },
    ],
  },
  {
    id: "regional-revenue",
    name: "Regional revenue",
    description: "Analytics-ready revenue by region and month, governed by the semantic layer.",
    owner: "Data Stewardship",
    source: "connector",
    sourceName: "Warehouse · gold.revenue_by_region",
    layer: "gold",
    classification: "internal-general",
    status: "approved",
    rows: 1080,
    updated: "3 days ago",
    quality: { completeness: 100, conformance: 100, duplicates: 0, outliers: 2 },
    columns: [
      { name: "region", type: "string", missingPct: 0, distinct: 9, sample: "Western Cape" },
      { name: "month", type: "date", missingPct: 0, distinct: 12, sample: "2026-03-01" },
      { name: "revenue", type: "decimal", missingPct: 0, distinct: 1080, sample: "482300.00" },
      { name: "active_learners", type: "integer", missingPct: 0, distinct: 940, sample: "1284" },
    ],
    insights: [
      {
        kind: "anomaly",
        title: "Free State revenue dropped 23% in March",
        body: "The drop is outside the expected band for the last six months.",
        suggestion: "Ask for a root-cause explanation",
      },
    ],
  },
  {
    id: "support-tickets",
    name: "Support tickets",
    description: "Ticket log from the service desk connector, awaiting steward approval.",
    owner: "Naledi Khumalo",
    source: "connector",
    sourceName: "PostgreSQL · servicedesk.tickets",
    layer: "bronze",
    classification: "internal-confidential",
    status: "pending",
    rows: 12440,
    updated: "5 days ago",
    quality: { completeness: 92, conformance: 88, duplicates: 41, outliers: 17 },
    columns: [
      { name: "ticket_id", type: "string", missingPct: 0, distinct: 12440, sample: "TCK-8821" },
      { name: "opened_at", type: "timestamp", missingPct: 0, distinct: 11902, sample: "2026-03-14 09:12" },
      { name: "category", type: "string", missingPct: 8, distinct: 14, sample: "Access" },
      { name: "resolution_hours", type: "float", missingPct: 11, distinct: 2201, sample: "6.4" },
    ],
    insights: [
      {
        kind: "quality",
        title: "11% of tickets have no resolution time",
        body: "These are mostly still-open tickets, which will skew any average.",
        suggestion: "Filter out open tickets",
      },
    ],
  },
];

export const classificationLabel: Record<Classification, string> = {
  "restricted-personal": "Restricted · personal",
  "internal-confidential": "Internal · confidential",
  "internal-general": "Internal · general",
};

export interface CleaningStepDef {
  id: string;
  title: string;
  question: string;
  options: string[];
  preview: { before: string[]; after: string[] };
  affected: string;
}

export const cleaningSteps: CleaningStepDef[] = [
  {
    id: "types",
    title: "Fix column types",
    question: "enrolled_on is stored as text. How should it be read?",
    options: ["Date (day first)", "Date (month first)", "Leave as text"],
    affected: "enrolled_on, fee_paid",
    preview: {
      before: ["2026/03/14", "14-03-2026", "March 14 2026", "—"],
      after: ["2026-03-14", "2026-03-14", "2026-03-14", "null"],
    },
  },
  {
    id: "missing",
    title: "Handle missing values",
    question: "region is empty in 12% of rows. What should happen to them?",
    options: ["Fill with 'Unknown'", "Drop those rows", "Leave blank"],
    affected: "region, fee_paid",
    preview: {
      before: ["Gauteng", "", "Limpopo", ""],
      after: ["Gauteng", "Unknown", "Limpopo", "Unknown"],
    },
  },
  {
    id: "duplicates",
    title: "Remove duplicates",
    question: "312 rows repeat the same learner, course and date. Remove them?",
    options: ["Keep the first row", "Keep the most recent row", "Keep all rows"],
    affected: "whole table",
    preview: {
      before: ["LR-100238 · Data literacy", "LR-100238 · Data literacy", "LR-100412 · SQL basics"],
      after: ["LR-100238 · Data literacy", "LR-100412 · SQL basics"],
    },
  },
  {
    id: "formats",
    title: "Standardise formats",
    question: "fee_paid mixes currency symbols and spacing. Normalise to a number?",
    options: ["Number, 2 decimals", "Keep formatted text"],
    affected: "fee_paid",
    preview: {
      before: ["R 1 250.00", "1250", "R1,250.00"],
      after: ["1250.00", "1250.00", "1250.00"],
    },
  },
  {
    id: "outliers",
    title: "Handle outliers",
    question: "45 fee values sit far outside the normal range. What should happen?",
    options: ["Flag only", "Cap at the 99th percentile", "Drop those rows"],
    affected: "fee_paid",
    preview: {
      before: ["1250.00", "980000.00", "1400.00"],
      after: ["1250.00", "1250.00 (flagged)", "1400.00"],
    },
  },
  {
    id: "columns",
    title: "Rename or drop columns",
    question: "id_number is masked personal information. Drop it from the clean table?",
    options: ["Drop the column", "Keep it masked"],
    affected: "id_number",
    preview: {
      before: ["learner_id, full_name, id_number, …"],
      after: ["learner_id, full_name, …"],
    },
  },
];

export const exploreRows = [
  { region: "Gauteng", enrolments: 19740, completions: 13418, revenue: 2410500 },
  { region: "Western Cape", enrolments: 9120, completions: 6870, revenue: 1284000 },
  { region: "KwaZulu-Natal", enrolments: 7480, completions: 4920, revenue: 964300 },
  { region: "Eastern Cape", enrolments: 4310, completions: 2611, revenue: 512800 },
  { region: "Limpopo", enrolments: 3180, completions: 1944, revenue: 388400 },
  { region: "Free State", enrolments: 2390, completions: 1402, revenue: 248900 },
  { region: "Mpumalanga", enrolments: 1993, completions: 1215, revenue: 214600 },
];

export const trendRows = [
  { month: "Oct", value: 412 },
  { month: "Nov", value: 448 },
  { month: "Dec", value: 391 },
  { month: "Jan", value: 503 },
  { month: "Feb", value: 561 },
  { month: "Mar", value: 432 },
];

export interface AssistantTurn {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  sql: string;
  refused?: boolean;
  table?: { columns: string[]; rows: (string | number)[][] };
}

export const assistantExamples: AssistantTurn[] = [
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

export const dashboards = [
  {
    id: "exec-overview",
    name: "Executive overview",
    owner: "Data Stewardship",
    visibility: "Organisation",
    charts: 6,
    updated: "Today",
  },
  { id: "enrolment-health", name: "Enrolment health", owner: "Thandi Mokoena", visibility: "Team", charts: 4, updated: "Yesterday" },
  { id: "my-scratch", name: "My scratch board", owner: "Thandi Mokoena", visibility: "Private", charts: 2, updated: "3 days ago" },
];

export const metrics = [
  { name: "Active learners", value: "12 480", delta: "+4.2%", trend: "up" as const, definition: "Learners with at least one session in the last 30 days" },
  { name: "Completion rate", value: "66.3%", delta: "+1.8%", trend: "up" as const, definition: "Completions divided by enrolments in the period" },
  { name: "Average fee paid", value: "R1 214", delta: "-2.1%", trend: "down" as const, definition: "Mean fee across approved enrolments" },
  { name: "Open data issues", value: "7", delta: "+3", trend: "down" as const, definition: "Quality flags raised on datasets you own" },
];

export const alerts = [
  {
    id: "al1",
    metric: "Revenue · Free State",
    message: "Fell 23% below the expected band in March",
    when: "2 days ago",
    severity: "high" as const,
    rootCause: [
      { factor: "Enrolments in Bloemfontein", contribution: "-14%", detail: "412 fewer enrolments than February" },
      { factor: "Average fee paid", contribution: "-6%", detail: "More learners on the subsidised rate" },
      { factor: "Refunds processed", contribution: "-3%", detail: "R38 400 refunded on cancelled cohorts" },
    ],
  },
  {
    id: "al2",
    metric: "Completion rate · SQL basics",
    message: "Crossed above its 70% target for the first time",
    when: "6 days ago",
    severity: "low" as const,
    rootCause: [
      { factor: "New guided practice module", contribution: "+8%", detail: "Introduced to cohorts from February" },
      { factor: "Shorter course length", contribution: "+3%", detail: "Median days to complete fell to 27" },
    ],
  },
];

export const prediction = {
  subject: "Learner cohort · March intake",
  outcome: "Likelihood to complete within 60 days",
  score: 72,
  band: "Moderate to high",
  modelVersion: "completion-heuristic v1.4",
  factors: [
    { name: "Prior course completed", weight: 0.32, direction: "up" as const, reading: "Learners who finished an earlier course complete again far more often." },
    { name: "Weekly session count", weight: 0.27, direction: "up" as const, reading: "This cohort averages 3.1 sessions a week, above the 2.4 baseline." },
    { name: "Days since last activity", weight: 0.21, direction: "down" as const, reading: "A fifth of the cohort has been inactive for over 10 days." },
    { name: "Region support coverage", weight: 0.12, direction: "up" as const, reading: "Most learners sit in regions with on-site facilitators." },
    { name: "Fee status", weight: 0.08, direction: "down" as const, reading: "Unpaid balances slightly reduce completion." },
  ],
};

export const auditEvents = [
  { id: "e1", when: "14:02", actor: "Thandi Mokoena", action: "Ran AI query", resource: "gold.enrolments_clean", detail: "Average fee by region, last quarter" },
  { id: "e2", when: "13:47", actor: "Thandi Mokoena", action: "Applied cleaning step", resource: "Learner enrolments 2026", detail: "Remove duplicates · keep first row" },
  { id: "e3", when: "13:44", actor: "Thandi Mokoena", action: "Applied cleaning step", resource: "Learner enrolments 2026", detail: "Fix column types · enrolled_on to date" },
  { id: "e4", when: "12:20", actor: "System", action: "Masked columns", resource: "Learner enrolments 2026", detail: "full_name, id_number detected as personal information" },
  { id: "e5", when: "12:19", actor: "Thandi Mokoena", action: "Uploaded dataset", resource: "enrolments_q3.csv", detail: "48 213 rows landed in bronze" },
  { id: "e6", when: "09:55", actor: "Sipho Dlamini", action: "Approved dataset", resource: "Course completions", detail: "Quality profile reviewed, classification internal-confidential" },
  { id: "e7", when: "09:31", actor: "Naledi Khumalo", action: "Connected source", resource: "PostgreSQL · servicedesk.tickets", detail: "Read-only connector, credentials from secrets service" },
  { id: "e8", when: "08:12", actor: "Thandi Mokoena", action: "Signed in", resource: "Identity provider", detail: "Multi-factor authentication passed" },
];

export const metricDefinitions = [
  { name: "Active learners", owner: "Data Stewardship", expression: "COUNT(DISTINCT learner_id) WHERE last_session >= today - 30", usedBy: 14 },
  { name: "Completion rate", owner: "Data Stewardship", expression: "completions / NULLIF(enrolments, 0)", usedBy: 9 },
  { name: "Average fee paid", owner: "Sipho Dlamini", expression: "AVG(fee_paid) WHERE status = 'approved'", usedBy: 6 },
];
