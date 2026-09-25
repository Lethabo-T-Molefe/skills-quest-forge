import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { Dashboard, DashboardSummary } from "../types";

const dashboards: Dashboard[] = [
  {
    id: "exec-overview",
    name: "Executive overview",
    owner: "Data Stewardship",
    visibility: "Organisation",
    description: "Governed view of active learners, completion and regional revenue. Shared read-only.",
    updated: "Today",
    sharedWith: ["Organisation"],
    charts: [
      {
        id: "c1",
        title: "Active learners",
        type: "line",
        metric: "Active learners",
        explanation: "Learners with at least one session in the last 30 days, from the semantic layer.",
        sql: "SELECT month, COUNT(DISTINCT learner_id) FROM gold.sessions GROUP BY month;",
        points: [
          { name: "Oct", value: 10820 },
          { name: "Nov", value: 11140 },
          { name: "Dec", value: 10990 },
          { name: "Jan", value: 11610 },
          { name: "Feb", value: 11970 },
          { name: "Mar", value: 12480 },
        ],
      },
      {
        id: "c2",
        title: "Revenue by region",
        type: "bar",
        metric: "Regional revenue",
        explanation: "Sum of approved fees, grouped by region, with row-level security applied.",
        sql: "SELECT region, SUM(revenue) FROM gold.revenue_by_region GROUP BY region;",
        points: [
          { name: "Gauteng", value: 2410 },
          { name: "Western Cape", value: 1284 },
          { name: "KZN", value: 964 },
          { name: "Eastern Cape", value: 513 },
          { name: "Free State", value: 249 },
        ],
      },
      {
        id: "c3",
        title: "Completion rate",
        type: "area",
        metric: "Completion rate",
        explanation: "Completions divided by enrolments in the period.",
        sql: "SELECT month, completions / NULLIF(enrolments, 0) FROM gold.completions;",
        points: [
          { name: "Oct", value: 61 },
          { name: "Nov", value: 62 },
          { name: "Dec", value: 60 },
          { name: "Jan", value: 63 },
          { name: "Feb", value: 65 },
          { name: "Mar", value: 66 },
        ],
      },
    ],
  },
  {
    id: "enrolment-health",
    name: "Enrolment health",
    owner: "Thandi Mokoena",
    visibility: "Team",
    description: "Quality and volume of new enrolments for the learning operations team.",
    updated: "Yesterday",
    sharedWith: ["Sipho Dlamini", "Naledi Khumalo"],
    charts: [
      {
        id: "c4",
        title: "Enrolments by region",
        type: "bar",
        metric: "Enrolments",
        explanation: "Count of approved enrolments grouped by region.",
        sql: "SELECT region, COUNT(*) FROM gold.enrolments_clean GROUP BY region;",
        points: [
          { name: "Gauteng", value: 19740 },
          { name: "Western Cape", value: 9120 },
          { name: "KZN", value: 7480 },
          { name: "Eastern Cape", value: 4310 },
        ],
      },
      {
        id: "c5",
        title: "Open data issues",
        type: "line",
        metric: "Open data issues",
        explanation: "Quality flags on datasets owned by the team.",
        sql: "SELECT week, COUNT(*) FROM audit.quality_flags GROUP BY week;",
        points: [
          { name: "W1", value: 4 },
          { name: "W2", value: 5 },
          { name: "W3", value: 3 },
          { name: "W4", value: 7 },
        ],
      },
    ],
  },
  {
    id: "my-scratch",
    name: "My scratch board",
    owner: "Thandi Mokoena",
    visibility: "Private",
    description: "Private working charts. Not visible to anyone else.",
    updated: "3 days ago",
    sharedWith: [],
    charts: [
      {
        id: "c6",
        title: "Fee experiment",
        type: "bar",
        metric: "Average fee paid",
        explanation: "A private cut of average fee by course.",
        sql: "SELECT course, AVG(fee_paid) FROM gold.enrolments_clean GROUP BY course;",
        points: [
          { name: "Data literacy", value: 1250 },
          { name: "SQL basics", value: 980 },
          { name: "Python", value: 1400 },
        ],
      },
    ],
  },
];

export function fetchDashboards() {
  return mockResponse(dashboards);
}

export function fetchDashboard(id: string) {
  return mockResponse(dashboards.find((item) => item.id === id) ?? null);
}

export function toSummaries(items: Dashboard[]): DashboardSummary[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    owner: item.owner,
    visibility: item.visibility,
    updated: item.updated,
    charts: item.charts.length,
  }));
}

export const dashboardsQuery = () => queryOptions({ queryKey: ["dashboards"], queryFn: fetchDashboards });

export const dashboardQuery = (id: string) =>
  queryOptions({ queryKey: ["dashboards", id], queryFn: () => fetchDashboard(id) });
