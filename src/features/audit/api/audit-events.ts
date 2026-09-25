import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { AuditEvent } from "../types";

const auditEvents: AuditEvent[] = [
  { id: "e1", when: "14:02", actor: "Thandi Mokoena", action: "Ran AI query", resource: "gold.enrolments_clean", detail: "Average fee by region, last quarter" },
  { id: "e2", when: "13:47", actor: "Thandi Mokoena", action: "Applied cleaning step", resource: "Learner enrolments 2026", detail: "Remove duplicates · keep first row" },
  { id: "e3", when: "13:44", actor: "Thandi Mokoena", action: "Applied cleaning step", resource: "Learner enrolments 2026", detail: "Fix column types · enrolled_on to date" },
  { id: "e4", when: "12:20", actor: "System", action: "Masked columns", resource: "Learner enrolments 2026", detail: "full_name, id_number detected as personal information" },
  { id: "e5", when: "12:19", actor: "Thandi Mokoena", action: "Uploaded dataset", resource: "enrolments_q3.csv", detail: "48 213 rows landed in bronze" },
  { id: "e6", when: "09:55", actor: "Sipho Dlamini", action: "Approved dataset", resource: "Course completions", detail: "Quality profile reviewed, classification internal-confidential" },
  { id: "e7", when: "09:31", actor: "Naledi Khumalo", action: "Connected source", resource: "PostgreSQL · servicedesk.tickets", detail: "Read-only connector, credentials from secrets service" },
  { id: "e8", when: "08:12", actor: "Thandi Mokoena", action: "Signed in", resource: "Identity provider", detail: "Multi-factor authentication passed" },
];

export function fetchAuditEvents() {
  return mockResponse(auditEvents);
}

export const auditEventsQuery = () => queryOptions({ queryKey: ["audit", "events"], queryFn: fetchAuditEvents });
