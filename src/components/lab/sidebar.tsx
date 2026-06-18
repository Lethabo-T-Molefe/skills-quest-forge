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
      className="group/sb shrink-0 sticky top-0 h-screen bg-sidebar text-sidebar-foreground border-r-2 border-ink flex flex-col transition-[width] duration-200"
      style={{ width: collapsed ? 68 : 260 }}
    >
      <div className="h-16 px-4 flex items-center gap-2 border-b-2 border-white/15">
        {collapsed ? (
          <div className="size-9 rounded-md grid place-items-center bg-white text-ink font-display font-black mx-auto">C</div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-white rounded-md p-1 shrink-0">
              <img src="/chieta-logo.png" alt="CHIETA" className="h-8 w-auto" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/60">Data Lab</span>
          </div>
        )}
        <button onClick={() => setCollapsed(v => !v)} className={`p-1.5 rounded-md border border-white/20 text-white hover:bg-white/10 ${collapsed ? "" : "ml-auto"}`}>
          <ChevronLeft className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
        {NAV.map(group => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <div className={`px-3 mb-1 text-[10px] uppercase tracking-[0.18em] ${group.accent ? "text-primary" : "text-white/40"}`}>
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
                      className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm transition border
                        ${active
                          ? "bg-primary text-primary-foreground font-bold border-primary"
                          : group.accent
                            ? "text-primary border-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary"
                            : "border-transparent hover:bg-white/10 hover:border-white/20 text-white/80"}`}
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
        <div className="m-3 p-3 rounded-lg border border-white/15 bg-white/10 text-xs text-white/70">
          <div className="font-semibold text-white mb-1">Session secure</div>
          End-to-end encrypted · POPIA-aligned
        </div>
      )}
    </aside>
  );
}
