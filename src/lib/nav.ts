import {
  Home, Database, Upload, ShieldCheck, GitBranch, Terminal, Notebook, TableProperties,
  LayoutDashboard, Briefcase, GraduationCap, BadgeCheck, Building2, Star, Sparkles,
  FileText, Calendar, History, Users, Shield, ScrollText, Activity, Settings,
  CheckSquare, Award, User,
} from "lucide-react";

export type NavItem = { label: string; to: string; icon: any };
export type NavGroup = { title: string; items: NavItem[]; accent?: boolean };

export const NAV: NavGroup[] = [
  { title: "Home", items: [
    { label: "Dashboard", to: "/app", icon: Home },
  ]},
  { title: "Data", items: [
    { label: "Dataset Catalogue", to: "/app/datasets", icon: Database },
    { label: "Upload Dataset", to: "/app/upload", icon: Upload },
    { label: "Data Quality", to: "/app/quality", icon: ShieldCheck },
    { label: "Data Lineage", to: "/app/lineage", icon: GitBranch },
  ]},
  { title: "Analytics", items: [
    { label: "SQL Lab", to: "/app/sql", icon: Terminal },
    { label: "Notebooks", to: "/app/notebooks", icon: Notebook },
    { label: "Data Explorer", to: "/app/explorer", icon: TableProperties },
  ]},
  { title: "Dashboards", items: [
    { label: "Executive Cockpit", to: "/app/executive", icon: LayoutDashboard },
    { label: "Grants Intelligence", to: "/app/grants", icon: Briefcase },
    { label: "Learner Intelligence", to: "/app/learner", icon: GraduationCap },
    { label: "ETQA Performance", to: "/app/etqa", icon: BadgeCheck },
    { label: "Smart Skills Centres", to: "/app/centres", icon: Building2 },
    { label: "My Dashboards", to: "/app/my-dashboards", icon: Star },
  ]},
  { title: "Prototype", accent: true, items: [
    { label: "Skills Intelligence Platform", to: "/app/prototype", icon: Sparkles },
  ]},
  { title: "Reports", items: [
    { label: "Generate Report", to: "/app/reports", icon: FileText },
    { label: "Scheduled Reports", to: "/app/scheduled", icon: Calendar },
    { label: "Report History", to: "/app/history", icon: History },
  ]},
  { title: "Admin", items: [
    { label: "User Management", to: "/app/users", icon: Users },
    { label: "Role Management", to: "/app/roles", icon: Shield },
    { label: "Audit Logs", to: "/app/audit", icon: ScrollText },
    { label: "System Health", to: "/app/health", icon: Activity },
    { label: "Settings", to: "/app/settings", icon: Settings },
  ]},
  { title: "My Workspace", items: [
    { label: "My Tasks", to: "/app/tasks", icon: CheckSquare },
    { label: "Contributions", to: "/app/contributions", icon: Award },
    { label: "My Profile", to: "/app/profile", icon: User },
  ]},
];
