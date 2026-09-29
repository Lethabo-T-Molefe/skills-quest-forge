import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookMarked,
  ChartNoAxesCombined,
  Database,
  House,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Users,
  Wand2,
} from "lucide-react";
import { canAdmin, canApprove, type CurrentUser } from "@/features/auth";

export interface NavItem {
  to: "/workspace" | "/datasets" | "/clean" | "/analyse" | "/dashboards" | "/monitors" | "/semantic" | "/governance" | "/audit" | "/admin";
  label: string;
  icon: LucideIcon;
  /** One line on what the page is for, shown on hover and to screen readers. */
  hint: string;
  /** Position in the analysis workflow, shown so the order is visible. */
  step?: number;
  exact?: boolean;
  /** Hide the item from roles that cannot use it. The page itself still guards its actions. */
  visible?: (user: CurrentUser) => boolean;
  /** Shows the number of datasets waiting for approval. */
  badge?: "pendingApprovals";
}

export interface NavSection {
  id: string;
  title?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    id: "home",
    items: [{ to: "/workspace", label: "Home", icon: House, hint: "Your next steps and what needs attention", exact: true }],
  },
  {
    id: "workflow",
    title: "Your workflow",
    items: [
      { to: "/datasets", label: "Datasets", icon: Database, hint: "Bring data in and find what exists", step: 1 },
      { to: "/clean", label: "Clean", icon: Wand2, hint: "Fix problems before the data is used", step: 2 },
      { to: "/analyse", label: "Analyse", icon: ChartNoAxesCombined, hint: "Answer a question with the method you choose", step: 3 },
      { to: "/dashboards", label: "Dashboards", icon: LayoutDashboard, hint: "Save and share results", step: 4 },
      { to: "/monitors", label: "Monitors", icon: Bell, hint: "Watch metrics and explain their changes", step: 5 },
    ],
  },
  {
    id: "governance",
    title: "Governance",
    items: [
      { to: "/semantic", label: "Metrics", icon: BookMarked, hint: "Shared metric definitions everyone uses" },
      {
        to: "/governance",
        label: "Approvals",
        icon: ShieldCheck,
        hint: "Datasets waiting for a steward's decision",
        visible: canApprove,
        badge: "pendingApprovals",
      },
      { to: "/audit", label: "Audit trail", icon: ScrollText, hint: "Who did what, and when" },
      { to: "/admin", label: "Users and roles", icon: Users, hint: "Members, roles and quotas", visible: canAdmin },
    ],
  },
];
