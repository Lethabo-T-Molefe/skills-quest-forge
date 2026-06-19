import { Bell, Search, LogOut, ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { ROLES, ROLE_IDENTITY } from "@/lib/roles";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

export function LabTopbar() {
  const { role, setRole } = useRole();
  const identity = ROLE_IDENTITY[role];
  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur border-b-2 border-ink flex items-center gap-4 px-6">
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        <div className="flex items-center gap-2 px-3 h-9 rounded-xl bg-white border border-ink w-full focus-within:shadow-[0_3px_0_0_var(--ink)] transition-shadow">
          <Search className="size-4 text-ink/60" />
          <input
            placeholder="Search datasets, dashboards, users…"
            className="bg-transparent outline-none text-sm w-full placeholder:text-ink/50"
          />
          <kbd className="text-[10px] text-ink/60 border border-ink rounded px-1.5 py-0.5">⌘K</kbd>
        </div>
      </div>

      <button className="relative p-2 rounded-full border border-ink hover:bg-mint">
        <Bell className="size-4" />
        <span className="absolute top-1.5 right-1.5 size-1.5 bg-danger rounded-full" />
      </button>

      <div className="flex items-center gap-3 pl-3 border-l-2 border-ink">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full pl-1 pr-2 py-1 hover:bg-muted" title="Switch role (demo)">
              <div className="size-9 rounded-full bg-ink text-background border border-ink grid place-items-center font-bold text-sm shrink-0">{identity.initials}</div>
              <div className="text-right leading-tight hidden sm:block">
                <div className="text-sm font-medium">{identity.name}</div>
                <div className="text-[10px] uppercase tracking-wider text-ink/60">{role}</div>
              </div>
              <ChevronDown className="size-3.5 text-ink/50 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">View as role (demo)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={role} onValueChange={v => setRole(v as typeof role)}>
              {ROLES.map(r => <DropdownMenuRadioItem key={r} value={r}>{r}</DropdownMenuRadioItem>)}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link to="/" className="p-2 rounded-full border border-ink hover:bg-muted" title="Sign out">
          <LogOut className="size-4 text-ink/60" />
        </Link>
      </div>
    </header>
  );
}
