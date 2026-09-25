import {
  LayoutDashboard,
  Database,
  Sparkles,
  BarChart3,
  Gauge,
  Bell,
  ScrollText,
  BookMarked,
} from "lucide-react";

export const mainNav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/datasets", label: "Datasets", icon: Database },
  { to: "/assistant", label: "Assistant", icon: Sparkles },
  { to: "/explorer", label: "Explorer", icon: BarChart3 },
  { to: "/dashboards", label: "Dashboards", icon: Gauge },
  { to: "/monitors", label: "Monitors", icon: Bell },
  { to: "/semantic", label: "Metrics", icon: BookMarked },
  { to: "/audit", label: "Audit trail", icon: ScrollText },
] as const;
