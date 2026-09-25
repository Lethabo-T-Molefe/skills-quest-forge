import { mockDatasets } from "@/features/datasets/api/mock-datasets";
import { orgMembers } from "@/features/auth/constants";

export interface SearchHit {
  id: string;
  kind: "dataset" | "metric" | "dashboard" | "member";
  title: string;
  detail: string;
  to: string;
  params?: { datasetId?: string; dashboardId?: string };
}

const staticHits: SearchHit[] = [
  {
    id: "metric-active",
    kind: "metric",
    title: "Active learners",
    detail: "Learners with at least one session in the last 30 days",
    to: "/semantic",
  },
  {
    id: "metric-completion",
    kind: "metric",
    title: "Completion rate",
    detail: "Completions divided by enrolments in the period",
    to: "/semantic",
  },
  {
    id: "dash-exec",
    kind: "dashboard",
    title: "Executive overview",
    detail: "Organisation dashboard · 3 charts",
    to: "/dashboards/$dashboardId",
    params: { dashboardId: "exec-overview" },
  },
  {
    id: "dash-enrol",
    kind: "dashboard",
    title: "Enrolment health",
    detail: "Team dashboard · 2 charts",
    to: "/dashboards/$dashboardId",
    params: { dashboardId: "enrolment-health" },
  },
];

export function searchCatalogue(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const datasets: SearchHit[] = mockDatasets
    .filter((d) => `${d.name} ${d.description} ${d.sourceName}`.toLowerCase().includes(q))
    .map((d) => ({
      id: d.id,
      kind: "dataset" as const,
      title: d.name,
      detail: `${d.layer} · ${d.status} · ${d.description}`,
      to: "/datasets/$datasetId",
      params: { datasetId: d.id },
    }));

  const members: SearchHit[] = orgMembers
    .filter((m) => `${m.name} ${m.email} ${m.role}`.toLowerCase().includes(q))
    .map((m) => ({
      id: m.id,
      kind: "member" as const,
      title: m.name,
      detail: `${m.role} · ${m.email}`,
      to: "/admin",
    }));

  const other = staticHits.filter((hit) => `${hit.title} ${hit.detail}`.toLowerCase().includes(q));

  return [...datasets, ...other, ...members];
}
