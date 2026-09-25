import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  Globe,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { Drawer, Logo, ScrollPane, SearchField } from "@/components";
import { mainNav } from "@/config/navigation";
import { clearSession, useCurrentUser } from "@/features/auth";
import { pageHelp } from "@/features/help";
import { toggleSidebar, useSidebarCollapsed } from "@/stores/sidebar-store";

/** App chrome: sidebar navigation, top bar and the page heading block. */
export function MainLayout({
  label,
  title,
  intro,
  actions,
  children,
}: {
  label?: string;
  title: string;
  intro?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const collapsed = useSidebarCollapsed();
  const helpKey = pathname.includes("/clean") ? "/clean" : pathname;
  const help = pageHelp[helpKey] ?? pageHelp["/workspace"];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface-alt py-6 transition-[width] duration-200 lg:flex ${
            collapsed ? "w-[76px] px-3" : "w-60 px-5"
          }`}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="absolute top-[94px] -right-3.5 z-10 flex size-7 items-center justify-center rounded-full border border-line-strong bg-surface-raised text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            {collapsed ? (
              <ChevronsRight className="size-4" strokeWidth={1.75} />
            ) : (
              <ChevronsLeft className="size-4" strokeWidth={1.75} />
            )}
          </button>

          <Link to="/workspace" className="block">
            {collapsed ? (
              <Logo variant="submark" className="mx-auto size-11" />
            ) : (
              <Logo variant="secondary" className="w-full" />
            )}
          </Link>

          <nav className="mt-8 flex flex-col gap-0.5">
            {mainNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                activeOptions={{ exact: item.to === "/workspace" }}
                activeProps={{ className: "bg-surface-raised text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:bg-accent/60" }}
                className={`flex items-center gap-3 rounded-[999px] py-2 text-sm transition-colors ${
                  collapsed ? "justify-center px-0 py-2.5" : "px-3"
                }`}
              >
                <item.icon className="size-[18px] shrink-0" strokeWidth={1.5} />
                <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="relative mt-auto border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              title={collapsed ? `${currentUser.name} · ${currentUser.role}` : undefined}
              className={`flex w-full items-center gap-3 rounded-[14px] p-1 text-left hover:bg-accent/50 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-inverse text-xs font-semibold text-background">
                {currentUser.initials}
              </span>
              <div className={collapsed ? "sr-only" : "min-w-0"}>
                <p className="truncate text-sm font-medium">{currentUser.name}</p>
                <p className="truncate text-xs text-muted-foreground">{currentUser.role}</p>
              </div>
            </button>
            {menuOpen ? (
              <div
                className={`absolute z-20 border border-border bg-surface-raised p-2 ${
                  collapsed ? "bottom-0 left-full ml-3 w-56 shadow-lg" : "inset-x-0 bottom-14"
                }`}
              >
                <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50" onClick={() => setMenuOpen(false)}>
                  <Globe className="size-4" strokeWidth={1.5} />
                  Public site
                </Link>
                <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50" onClick={() => setMenuOpen(false)}>
                  <Settings className="size-4" strokeWidth={1.5} />
                  Settings
                </Link>
                <Link to="/predict" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50" onClick={() => setMenuOpen(false)}>
                  <Sparkles className="size-4" strokeWidth={1.5} />
                  Predict
                </Link>
                <Link to="/governance" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50" onClick={() => setMenuOpen(false)}>
                  <Shield className="size-4" strokeWidth={1.5} />
                  Approvals
                </Link>
                <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50" onClick={() => setMenuOpen(false)}>
                  <Users className="size-4" strokeWidth={1.5} />
                  Users and roles
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50"
                  onClick={() => {
                    clearSession();
                    void queryClient.clear();
                    void navigate({ to: "/sign-in" });
                  }}
                >
                  <LogOut className="size-4" strokeWidth={1.5} />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
            <div className="flex items-center gap-4 px-6 py-3">
              <Link to="/workspace" className="shrink-0 lg:hidden">
                <Logo variant="submark" className="size-9" />
              </Link>
              <SearchField
                id="catalogue-search"
                className="hidden flex-1 md:block"
                value={query}
                onChange={setQuery}
                placeholder="Search datasets, metrics and dashboards"
                onSubmit={() => void navigate({ to: "/search", search: { q: query } })}
              />
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="ml-auto inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <CircleHelp className="size-4" strokeWidth={1.5} />
                Help
              </button>
              <span className="hidden text-xs text-muted-foreground sm:inline">{currentUser.workspace}</span>
            </div>
            <ScrollPane className="lg:hidden" orientation="horizontal">
              <nav className="flex gap-1 px-4 pb-2">
                {mainNav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeOptions={{ exact: item.to === "/workspace" }}
                    activeProps={{ className: "bg-surface-inverse text-background" }}
                    inactiveProps={{ className: "text-muted-foreground" }}
                    className="shrink-0 rounded-[999px] px-3 py-1.5 text-xs"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </ScrollPane>
          </header>

          <main className="px-6 py-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                {label ? <p className="label-paren">({label})</p> : null}
                <h1 className="heading-1 mt-1">{title}</h1>
                {intro ? <p className="mt-3 max-w-[68ch] text-muted-foreground">{intro}</p> : null}
              </div>
              {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
            </div>
            <div className="mt-8">{children}</div>
          </main>
        </div>
      </div>

      <Drawer open={helpOpen} title="In-context help" onClose={() => setHelpOpen(false)}>
        <p className="text-sm text-muted-foreground">
          There is no separate course platform. Help sits in the tools as short optional walkthroughs.
        </p>
        <ul className="mt-5 space-y-5">
          {help?.map((topic) => (
            <li key={topic.title}>
              <p className="font-medium">{topic.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{topic.body}</p>
            </li>
          ))}
        </ul>
      </Drawer>
    </div>
  );
}
