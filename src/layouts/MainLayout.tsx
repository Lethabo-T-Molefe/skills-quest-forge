import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { useCurrentUser } from "@/features/auth";

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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface-alt px-5 py-6 lg:flex">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden />
            <span className="font-display text-xl font-medium tracking-tight">{siteConfig.name}</span>
          </Link>
          <p className="label-paren mt-1">({siteConfig.tagline})</p>

          <nav className="mt-8 flex flex-col gap-0.5">
            {mainNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-surface-raised text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:bg-accent/60" }}
                className="flex items-center gap-3 rounded-[999px] px-3 py-2 text-sm transition-colors"
              >
                <item.icon className="size-[18px]" strokeWidth={1.5} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-surface-inverse text-xs font-semibold text-background">
                {currentUser.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{currentUser.name}</p>
                <p className="truncate text-xs text-muted-foreground">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
            <div className="flex items-center gap-4 px-6 py-3">
              <Link to="/" className="flex items-center gap-2 lg:hidden">
                <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden />
                <span className="font-display text-lg">{siteConfig.name}</span>
              </Link>
              <label className="relative hidden flex-1 items-center md:flex">
                <Search className="absolute left-4 size-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="sr-only">Search the catalogue</span>
                <input
                  placeholder="Search datasets, metrics and dashboards"
                  className="w-full max-w-md rounded-[999px] border border-border bg-surface-raised py-2 pr-4 pl-10 text-sm placeholder:text-muted-foreground"
                />
              </label>
              <span className="ml-auto text-xs text-muted-foreground">{currentUser.workspace}</span>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
              {mainNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
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
    </div>
  );
}
