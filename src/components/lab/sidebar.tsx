import { Link, useRouterState } from "@tanstack/react-router";
import { NAV } from "@/lib/nav";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useState } from "react";

export function LabSidebar() {
  const path = useRouterState({ select: s => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      data-collapsed={collapsed}
      className="group/sb shrink-0 sticky top-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-[width] duration-200"
      style={{ width: collapsed ? 68 : 260 }}
    >
      <div className="h-16 px-4 flex items-center gap-2 border-b border-sidebar-border">
        <div className="size-9 rounded-md grid place-items-center bg-primary text-primary-foreground font-display font-black">C</div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold tracking-tight">CHIETA</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Data Lab</span>
          </div>
        )}
        <button onClick={() => setCollapsed(v => !v)} className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent">
          <ChevronLeft className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
        {NAV.map(group => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <div className={`px-3 mb-1 text-[10px] uppercase tracking-[0.18em] ${group.accent ? "text-accent" : "text-muted-foreground"}`}>
                {group.title}
              </div>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map(item => {
                const active = path === item.to;
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition
                        ${active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                          : group.accent
                            ? "text-accent hover:bg-sidebar-accent"
                            : "hover:bg-sidebar-accent text-sidebar-foreground/90"}`}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && group.accent && <Sparkles className="size-3 ml-auto opacity-70" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="m-3 p-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 text-xs text-muted-foreground">
          <div className="font-medium text-sidebar-foreground mb-1">Session secure</div>
          End-to-end encrypted · POPIA-aligned
        </div>
      )}
    </aside>
  );
}
