import {
  LayoutDashboard,
  Database,
  Sparkles,
  BarChart3,
  Gauge,
  Bell,
  ScrollText,
  BookMarked,
  Terminal,
  Wand2,
} from "lucide-react";

export const mainNav = [
  { to: "/workspace", label: "Overview", icon: LayoutDashboard },
  { to: "/datasets", label: "Datasets", icon: Database },
  { to: "/clean", label: "Clean", icon: Wand2 },
  { to: "/assistant", label: "Assistant", icon: Sparkles },
  { to: "/explorer", label: "Explorer", icon: BarChart3 },
  { to: "/dashboards", label: "Dashboards", icon: Gauge },
  { to: "/monitors", label: "Monitors", icon: Bell },
  { to: "/semantic", label: "Metrics", icon: BookMarked },
  { to: "/workbench", label: "Workbench", icon: Terminal },
  { to: "/audit", label: "Audit trail", icon: ScrollText },
] as const;
