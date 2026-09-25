import type { CurrentUser, OrgMember, RoleId } from "./types";

export const roleLabels: Record<RoleId, string> = {
  analyst: "Everyday Analyst",
  practitioner: "Data Practitioner",
  steward: "Data Steward",
  executive: "Executive and Viewer",
  admin: "Administrator",
  auditor: "Auditor",
  curator: "Model Curator",
};

export const demoUser: CurrentUser = {
  name: "Thandi Mokoena",
  email: "thandi@dataforge.local",
  role: roleLabels.analyst,
  roleId: "analyst",
  workspace: "Thandi's workspace",
  initials: "TM",
  verified: true,
  mfaEnabled: true,
  quotas: { compute: "12 of 40 sandbox hours", storage: "1.8 GB of 10 GB", ai: "64 of 200 queries" },
};

export const orgMembers: OrgMember[] = [
  {
    id: "thandi",
    name: "Thandi Mokoena",
    email: "thandi@dataforge.local",
    role: roleLabels.analyst,
    roleId: "analyst",
    lastActive: "Just now",
    quotas: { compute: "12 / 40 h", storage: "1.8 / 10 GB", ai: "64 / 200" },
  },
  {
    id: "sipho",
    name: "Sipho Dlamini",
    email: "sipho@dataforge.local",
    role: roleLabels.practitioner,
    roleId: "practitioner",
    lastActive: "Yesterday",
    quotas: { compute: "28 / 80 h", storage: "6.4 / 25 GB", ai: "110 / 400" },
  },
  {
    id: "naledi",
    name: "Naledi Khumalo",
    email: "naledi@dataforge.local",
    role: roleLabels.steward,
    roleId: "steward",
    lastActive: "Today",
    quotas: { compute: "9 / 80 h", storage: "2.1 / 50 GB", ai: "41 / 400" },
  },
  {
    id: "lerato",
    name: "Lerato Naidoo",
    email: "lerato@dataforge.local",
    role: roleLabels.executive,
    roleId: "executive",
    lastActive: "3 days ago",
    quotas: { compute: "0 / 4 h", storage: "0.2 / 2 GB", ai: "8 / 40" },
  },
  {
    id: "amina",
    name: "Amina Patel",
    email: "amina@dataforge.local",
    role: roleLabels.admin,
    roleId: "admin",
    lastActive: "Today",
    quotas: { compute: "unlimited", storage: "unlimited", ai: "unlimited" },
  },
  {
    id: "johan",
    name: "Johan Venter",
    email: "johan@dataforge.local",
    role: roleLabels.auditor,
    roleId: "auditor",
    lastActive: "Last week",
    quotas: { compute: "0 / 0 h", storage: "0 / 0 GB", ai: "0 / 0" },
  },
  {
    id: "zola",
    name: "Zola Nkosi",
    email: "zola@dataforge.local",
    role: roleLabels.curator,
    roleId: "curator",
    lastActive: "Yesterday",
    quotas: { compute: "14 / 40 h", storage: "3.2 / 15 GB", ai: "22 / 120" },
  },
];

export const authPaths = ["/sign-in", "/register", "/verify", "/mfa"] as const;
