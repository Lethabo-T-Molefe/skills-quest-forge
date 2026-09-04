import { Bell, Search, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { logout as logoutRequest } from "@/lib/api/auth";

export function LabTopbar() {
  const { role, user, token, signOut } = useRole();
  const navigate = useNavigate();

  async function handleSignOut() {
    if (token) await logoutRequest(token);
    signOut();
    navigate({ to: "/signin" });
  }

  const initials = user
    ? user.name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
    : "?";

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
        <div className="flex items-center gap-3 rounded-full pl-1 pr-2 py-1" title={user?.email ?? ""}>
          <div className="size-9 rounded-full bg-ink text-background border border-ink grid place-items-center font-bold text-sm shrink-0">{initials}</div>
          <div className="text-right leading-tight hidden sm:block">
            <div className="text-sm font-medium">{user?.name ?? "Unknown"}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink/60">{role}</div>
          </div>
        </div>
        <button onClick={handleSignOut} className="p-2 rounded-full border border-ink hover:bg-muted" title="Sign out">
          <LogOut className="size-4 text-ink/60" />
        </button>
      </div>
    </header>
  );
}
