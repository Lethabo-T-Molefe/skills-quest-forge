import {
  Home, Database, Upload, ShieldCheck, GitBranch, Terminal, Notebook, TableProperties,
  LayoutDashboard, Briefcase, GraduationCap, BadgeCheck, Building2, Star, Sparkles,
  FileText, Calendar, History, Users, Shield, ScrollText, Activity, Settings,
  CheckSquare, Award, User, Lock, Scale, FlaskConical, Code2,
} from "lucide-react";
import { ROLES, type Role } from "./roles";

export type NavItem = { label: string; to: string; icon: any; roles: Role[] };
export type NavGroup = { title: string; items: NavItem[]; accent?: boolean };

const ALL = [...ROLES];
const ADMIN: Role[] = ["System Admin"];
const BUILDERS: Role[] = ["System Admin", "Data Steward", "Data Engineer", "Data Analyst", "Data Scientist", "Student Dev"];
const VIEWERS_TOO: Role[] = [...BUILDERS, "Viewer / Exec"];
const GOVERNANCE: Role[] = ["System Admin", "Data Steward", "Auditor"];

export const NAV: NavGroup[] = [
  { title: "Home", items: [
    { label: "Dashboard", to: "/app", icon: Home, roles: ALL },
  ]},
  { title: "Data", items: [
    { label: "Dataset Catalogue", to: "/app/datasets", icon: Database, roles: ["System Admin", "Data Steward", "Data Engineer", "Data Analyst", "Data Scientist", "Student Dev", "Auditor"] },
    { label: "Upload Dataset", to: "/app/upload", icon: Upload, roles: ["System Admin", "Data Steward", "Data Engineer", "Student Dev"] },
    { label: "Data Quality", to: "/app/quality", icon: ShieldCheck, roles: ["System Admin", "Data Steward", "Data Engineer", "Data Scientist", "Student Dev", "Auditor"] },
    { label: "Data Lineage", to: "/app/lineage", icon: GitBranch, roles: ["System Admin", "Data Steward", "Data Engineer", "Data Analyst", "Data Scientist", "Auditor"] },
  ]},
  { title: "Governance", items: [
    { label: "Data Governance & POPIA", to: "/app/governance", icon: Lock, roles: GOVERNANCE },
    { label: "Ethics & Bias Review", to: "/app/ethics", icon: Scale, roles: ["System Admin", "Data Steward", "Data Scientist", "Auditor"] },
  ]},
  { title: "Analytics", items: [
    { label: "SQL Workspace", to: "/app/sql", icon: Terminal, roles: BUILDERS },
    { label: "Notebooks", to: "/app/notebooks", icon: Notebook, roles: ["System Admin", "Data Engineer", "Data Analyst", "Data Scientist", "Student Dev"] },
    { label: "ML Experiments", to: "/app/ml-experiments", icon: FlaskConical, roles: ["System Admin", "Data Engineer", "Data Analyst", "Data Scientist", "Student Dev"] },
    { label: "Data Explorer", to: "/app/explorer", icon: TableProperties, roles: BUILDERS },
  ]},
  { title: "Dashboards", items: [
    { label: "Executive Cockpit", to: "/app/executive", icon: LayoutDashboard, roles: ALL },
    { label: "Grants Intelligence", to: "/app/grants", icon: Briefcase, roles: ALL },
    { label: "Learner Intelligence", to: "/app/learner", icon: GraduationCap, roles: ALL },
    { label: "ETQA Performance", to: "/app/etqa", icon: BadgeCheck, roles: ALL },
    { label: "Smart Skills Centres", to: "/app/centres", icon: Building2, roles: ALL },
    { label: "My Dashboards", to: "/app/my-dashboards", icon: Star, roles: VIEWERS_TOO },
    { label: "Superset Dashboards", to: "/app/superset-dashboards", icon: LayoutDashboard, roles: VIEWERS_TOO },
  ]},
  { title: "Prototype", accent: true, items: [
    { label: "Skills Intelligence Platform", to: "/app/prototype", icon: Sparkles, roles: VIEWERS_TOO },
  ]},
  { title: "Reports", items: [
    { label: "Generate Report", to: "/app/reports", icon: FileText, roles: ["System Admin", "Data Steward", "Data Engineer", "Data Analyst", "Data Scientist", "Viewer / Exec", "Auditor"] },
    { label: "Scheduled Reports", to: "/app/scheduled", icon: Calendar, roles: ["System Admin", "Data Steward", "Data Analyst", "Data Scientist", "Viewer / Exec"] },
    { label: "Report History", to: "/app/history", icon: History, roles: ["System Admin", "Data Steward", "Data Analyst", "Data Scientist", "Viewer / Exec", "Auditor"] },
  ]},
  { title: "Admin", items: [
    { label: "User Management", to: "/app/users", icon: Users, roles: ADMIN },
    { label: "Role Management", to: "/app/roles", icon: Shield, roles: ADMIN },
    { label: "Audit Logs", to: "/app/audit", icon: ScrollText, roles: ["System Admin", "Auditor"] },
    { label: "System Health", to: "/app/health", icon: Activity, roles: ["System Admin", "Data Engineer"] },
    { label: "Developer Workspace", to: "/app/dev-workspace", icon: Code2, roles: ["System Admin", "Data Engineer"] },
    { label: "Settings", to: "/app/settings", icon: Settings, roles: ALL },
  ]},
  { title: "My Workspace", items: [
    { label: "My Tasks", to: "/app/tasks", icon: CheckSquare, roles: BUILDERS },
    { label: "Contributions", to: "/app/contributions", icon: Award, roles: ["System Admin", "Student Dev"] },
    { label: "My Profile", to: "/app/profile", icon: User, roles: ALL },
  ]},
];
