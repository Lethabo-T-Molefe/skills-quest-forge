import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronsLeft, ChevronsRight, CircleHelp, Globe, LogOut, Menu, Search, Settings } from "lucide-react";
import { Drawer, Logo, SearchField } from "@/components";
import { navSections, type NavItem } from "@/config/navigation";
import { canApprove, clearSession, useCurrentUser, type CurrentUser } from "@/features/auth";
import { datasetsQuery } from "@/features/datasets";
import { helpFor } from "@/features/help";
import { cn } from "@/lib/utils";
import { toggleSidebar, useSidebarCollapsed } from "@/stores/sidebar-store";

const menuItemClass =
  "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm outline-none data-[highlighted]:bg-accent/60";

/**
 * App chrome: the grouped sidebar, the top bar and a compact page heading.
 * With `fill`, a tool page takes exactly the height of the screen on large displays,
 * so only its own panels scroll instead of the whole page.
 */
export function MainLayout({
  title,
  description,
  back,
  actions,
  toolbar,
  fill = false,
  children,
}: {
  title: string;
  /** One short line on what this page is for. Longer explanations belong in Help. */
  description?: string;
  /** A BackLink to the parent page, shown above the title. */
  back?: ReactNode;
  actions?: ReactNode;
  /** Controls that belong to the whole page, such as tabs, shown under the heading. */
  toolbar?: ReactNode;
  fill?: boolean;
  children: ReactNode;
}) {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [query, setQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const collapsed = useSidebarCollapsed();
  const help = helpFor(pathname);

  const datasets = useQuery({ ...datasetsQuery(), enabled: canApprove(currentUser) });
  const pendingApprovals = datasets.data?.filter((item) => item.status === "pending").length ?? 0;
  const badges = { pendingApprovals };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:rounded-[999px] focus:bg-surface-inverse focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface-alt py-6 transition-[width] duration-200 lg:flex",
            collapsed ? "w-[76px] px-3" : "w-60 px-5",
          )}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="absolute top-[94px] -right-3.5 z-10 flex size-7 items-center justify-center rounded-full border border-line-strong bg-surface-raised text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            {collapsed ? <ChevronsRight className="size-4" strokeWidth={1.75} /> : <ChevronsLeft className="size-4" strokeWidth={1.75} />}
          </button>

          <Link to="/workspace" className="block">
            {collapsed ? <Logo variant="submark" className="mx-auto size-11" /> : <Logo variant="secondary" className="w-full" />}
          </Link>

          <nav aria-label="Main" className="mt-7 min-h-0 flex-1 overflow-y-auto">
            <NavSections user={currentUser} collapsed={collapsed} badges={badges} />
          </nav>

          <div className="relative mt-4 border-t border-border pt-4">
            <AccountMenu user={currentUser} collapsed={collapsed} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/90 backdrop-blur">
            <div className="flex h-full items-center gap-3 px-4 sm:px-6">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="-ml-1 rounded-full p-2 text-muted-foreground hover:bg-accent/60 hover:text-foreground lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" strokeWidth={1.5} />
              </button>
              <Link to="/workspace" className="shrink-0 lg:hidden" aria-label="Home">
                <Logo variant="submark" className="size-8" />
              </Link>
              <SearchField
                id="catalogue-search"
                className="hidden max-w-md flex-1 md:block"
                value={query}
                onChange={setQuery}
                placeholder="Search datasets, metrics and dashboards"
                onSubmit={() => void navigate({ to: "/search", search: { q: query } })}
              />
              <div className="ml-auto flex items-center gap-4">
                <Link
                  to="/search"
                  search={{ q: "" }}
                  className="rounded-full p-2 text-muted-foreground hover:bg-accent/60 hover:text-foreground md:hidden"
                  aria-label="Search"
                >
                  <Search className="size-5" strokeWidth={1.5} />
                </Link>
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <CircleHelp className="size-4" strokeWidth={1.5} />
                  Help
                </button>
                <span className="hidden text-xs text-muted-foreground sm:inline">{currentUser.workspace}</span>
              </div>
            </div>
          </header>

          <main
            id="main"
            tabIndex={-1}
            className={cn(
              "px-4 py-5 focus:outline-none sm:px-6",
              fill && "lg:flex lg:h-[calc(100dvh-3.5rem)] lg:flex-col lg:overflow-hidden",
            )}
          >
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div className="min-w-0 max-w-3xl">
                {back ? <div className="mb-1">{back}</div> : null}
                <h1 className="heading-page">{title}</h1>
                {description ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p> : null}
              </div>
              {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
            {toolbar ? <div className="mt-4">{toolbar}</div> : null}
            <div className={cn("mt-5", fill && "lg:min-h-0 lg:flex-1")}>{children}</div>
          </main>
        </div>
      </div>

      <Drawer open={menuOpen} title="Menu" onClose={() => setMenuOpen(false)}>
        <nav aria-label="Main">
          <NavSections user={currentUser} collapsed={false} badges={badges} onNavigate={() => setMenuOpen(false)} />
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-sm font-medium">{currentUser.name}</p>
          <p className="text-xs text-muted-foreground">{currentUser.role}</p>
          <div className="mt-3 flex flex-col">
            <Link to="/settings" className={menuItemClass} onClick={() => setMenuOpen(false)}>
              <Settings className="size-4" strokeWidth={1.5} />
              Settings
            </Link>
            <Link to="/" className={menuItemClass} onClick={() => setMenuOpen(false)}>
              <Globe className="size-4" strokeWidth={1.5} />
              Public site
            </Link>
            <SignOutButton className={menuItemClass} />
          </div>
        </div>
      </Drawer>

      <Drawer open={helpOpen} title="Help for this page" onClose={() => setHelpOpen(false)}>
        <ul className="space-y-5">
          {help.map((topic) => (
            <li key={topic.title}>
              <p className="font-medium">{topic.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{topic.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
          Help sits inside each tool. There is no separate course to take.
        </p>
      </Drawer>
    </div>
  );
}

function NavSections({
  user,
  collapsed,
  badges,
  onNavigate,
}: {
  user: CurrentUser;
  collapsed: boolean;
  badges: Record<NonNullable<NavItem["badge"]>, number>;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-5">
      {navSections.map((section) => {
        const items = section.items.filter((item) => !item.visible || item.visible(user));
        if (items.length === 0) return null;
        return (
          <div key={section.id}>
            {section.title ? (
              collapsed ? (
                <div className="mx-auto mb-2 h-px w-8 bg-line-strong/60" aria-hidden />
              ) : (
                <p className="mb-1.5 px-3 text-xs font-medium text-muted-foreground">{section.title}</p>
              )
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => (
                <li key={item.to}>
                  <NavLink item={item} collapsed={collapsed} badge={item.badge ? badges[item.badge] : 0} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function NavLink({
  item,
  collapsed,
  badge,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  badge: number;
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.exact ?? false }}
      title={collapsed ? `${item.label}: ${item.hint}` : item.hint}
      activeProps={{ className: "bg-surface-raised text-foreground shadow-sm" }}
      inactiveProps={{ className: "text-muted-foreground hover:bg-accent/60 hover:text-foreground" }}
      className={cn(
        "relative flex items-center gap-3 rounded-[999px] py-2 text-sm transition-colors",
        collapsed ? "justify-center px-0" : "px-3",
      )}
      onClick={onNavigate}
    >
      <item.icon className="size-[18px] shrink-0" strokeWidth={1.5} aria-hidden />
      <span className={collapsed ? "sr-only" : "flex-1 truncate"}>{item.label}</span>
      {badge > 0 ? (
        <span
          className={cn(
            "num rounded-full bg-signal-strong px-1.5 text-[11px] leading-5 font-semibold text-background",
            collapsed && "absolute top-0 right-2",
          )}
        >
          {badge}
          <span className="sr-only"> waiting</span>
        </span>
      ) : null}
      {!collapsed && item.step && badge === 0 ? (
        <span className="num text-xs text-muted-foreground/70" aria-hidden>
          {item.step}
        </span>
      ) : null}
    </Link>
  );
}

function SignOutButton({ className }: { className: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <button
      type="button"
      className={cn(className, "w-full text-left")}
      onClick={() => {
        clearSession();
        queryClient.clear();
        void navigate({ to: "/sign-in" });
      }}
    >
      <LogOut className="size-4" strokeWidth={1.5} />
      Sign out
    </button>
  );
}

function AccountMenu({ user, collapsed }: { user: CurrentUser; collapsed: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          title={collapsed ? `${user.name} · ${user.role}` : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-[14px] p-1 text-left outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-signal",
            collapsed && "justify-center",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-inverse text-xs font-semibold text-background">
            {user.initials}
          </span>
          <span className={collapsed ? "sr-only" : "min-w-0"}>
            <span className="block truncate text-sm font-medium">{user.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{user.role}</span>
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={collapsed ? "right" : "top"}
          align={collapsed ? "end" : "start"}
          sideOffset={10}
          className="z-50 w-56 border border-border bg-surface-raised p-1.5 shadow-lg"
        >
          <DropdownMenu.Label className="truncate px-3 py-1.5 text-xs text-muted-foreground">{user.email}</DropdownMenu.Label>
          <DropdownMenu.Item className={menuItemClass} onSelect={() => void navigate({ to: "/settings" })}>
            <Settings className="size-4" strokeWidth={1.5} />
            Settings
          </DropdownMenu.Item>
          <DropdownMenu.Item className={menuItemClass} onSelect={() => void navigate({ to: "/" })}>
            <Globe className="size-4" strokeWidth={1.5} />
            Public site
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className={menuItemClass}
            onSelect={() => {
              clearSession();
              queryClient.clear();
              void navigate({ to: "/sign-in" });
            }}
          >
            <LogOut className="size-4" strokeWidth={1.5} />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
