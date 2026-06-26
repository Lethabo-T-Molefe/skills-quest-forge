export const ROLES = [
  "System Admin",
  "Data Steward",
  "Data Engineer",
  "Data Analyst",
  "Data Scientist",
  "Student Dev",
  "Viewer / Exec",
  "Auditor",
] as const;

export type Role = typeof ROLES[number];

export const ROLE_IDENTITY: Record<Role, { name: string; initials: string; email: string }> = {
  "System Admin": { name: "T. Mokoena", initials: "TM", email: "t.mokoena@chieta.org.za" },
  "Data Steward": { name: "S. Naidoo", initials: "SN", email: "s.naidoo@chieta.org.za" },
  "Data Engineer": { name: "K. Botha", initials: "KB", email: "k.botha@chieta.org.za" },
  "Data Analyst": { name: "N. Khumalo", initials: "NK", email: "n.khumalo@chieta.org.za" },
  "Data Scientist": { name: "L. Patel", initials: "LP", email: "l.patel@chieta.org.za" },
  "Student Dev": { name: "R. Mahlangu", initials: "RM", email: "r.mahlangu@cput.ac.za" },
  "Viewer / Exec": { name: "Dr. Z. Dube", initials: "ZD", email: "z.dube@chieta.org.za" },
  "Auditor": { name: "M. van Wyk", initials: "MW", email: "m.vanwyk@chieta.org.za" },
};

export const ROLE_BLURB: Record<Role, string> = {
  "System Admin": "Full platform control · users, roles, security, system health",
  "Data Steward": "Dataset approval, classification & POPIA governance",
  "Data Engineer": "Pipelines, ingestion, data quality & lineage",
  "Data Analyst": "Dashboards, SQL & reporting on approved data",
  "Data Scientist": "ML experiments, models & bias/fairness review",
  "Student Dev": "Assigned tasks, sandbox access & contributions",
  "Viewer / Exec": "Leadership dashboards, prototype & exports — read only",
  "Auditor": "Audit logs, compliance & access review — read only",
};
