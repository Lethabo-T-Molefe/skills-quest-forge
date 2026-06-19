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

export const ROLE_IDENTITY: Record<Role, { name: string; initials: string }> = {
  "System Admin": { name: "T. Mokoena", initials: "TM" },
  "Data Steward": { name: "S. Naidoo", initials: "SN" },
  "Data Engineer": { name: "K. Botha", initials: "KB" },
  "Data Analyst": { name: "N. Khumalo", initials: "NK" },
  "Data Scientist": { name: "L. Patel", initials: "LP" },
  "Student Dev": { name: "R. Mahlangu", initials: "RM" },
  "Viewer / Exec": { name: "Dr. Z. Dube", initials: "ZD" },
  "Auditor": { name: "M. van Wyk", initials: "MW" },
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
