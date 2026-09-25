import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";
import { CircleHelp, Globe, LogOut, Search, Settings, Shield, Sparkles, Users } from "lucide-react";
import { Drawer } from "@/components";
import { mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { clearSession, useCurrentUser } from "@/features/auth";
import { pageHelp } from "@/features/help";

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
  const helpKey = pathname.includes("/clean") ? "/clean" : pathname;
  const help = pageHelp[helpKey] ?? pageHelp["/workspace"];

  function onSearch(event: FormEvent) {
    event.preventDefault();
    void navigate({ to: "/search", search: { q: query } });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface-alt px-5 py-6 lg:flex">
          <Link to="/workspace" className="flex items-baseline gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden />
            <span className="font-display text-xl font-medium tracking-tight">{siteConfig.name}</span>
          </Link>
          <p className="label-paren mt-1">({siteConfig.tagline})</p>

          <nav className="mt-8 flex flex-col gap-0.5">
            {mainNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/workspace" }}
                activeProps={{ className: "bg-surface-raised text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:bg-accent/60" }}
                className="flex items-center gap-3 rounded-[999px] px-3 py-2 text-sm transition-colors"
              >
                <item.icon className="size-[18px]" strokeWidth={1.5} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="relative mt-auto border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex w-full items-center gap-3 rounded-[14px] p-1 text-left hover:bg-accent/50"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-surface-inverse text-xs font-semibold text-background">
                {currentUser.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{currentUser.name}</p>
                <p className="truncate text-xs text-muted-foreground">{currentUser.role}</p>
              </div>
            </button>
            {menuOpen ? (
              <div className="absolute inset-x-0 bottom-14 border border-border bg-surface-raised p-2">
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
              <Link to="/workspace" className="flex items-center gap-2 lg:hidden">
                <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden />
                <span className="font-display text-lg">{siteConfig.name}</span>
              </Link>
              <form onSubmit={onSearch} className="relative hidden flex-1 items-center md:flex">
                <Search className="absolute left-4 size-4 text-muted-foreground" strokeWidth={1.5} />
                <label className="sr-only" htmlFor="catalogue-search">
                  Search the catalogue
                </label>
                <input
                  id="catalogue-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search datasets, metrics and dashboards"
                  className="w-full max-w-md rounded-[999px] border border-border bg-surface-raised py-2 pr-4 pl-10 text-sm placeholder:text-muted-foreground"
                />
              </form>
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
            <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
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
