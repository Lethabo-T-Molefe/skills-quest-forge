import { Bell, Search, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function LabTopbar() {
  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur border-b border-border flex items-center gap-4 px-6">
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        <div className="flex items-center gap-2 px-3 h-9 rounded-md bg-muted border border-border w-full">
          <Search className="size-4 text-muted-foreground" />
          <input
            placeholder="Search datasets, dashboards, users…"
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘K</kbd>
        </div>
      </div>

      <button className="relative p-2 rounded-md hover:bg-muted">
        <Bell className="size-4" />
        <span className="absolute top-1.5 right-1.5 size-1.5 bg-danger rounded-full" />
      </button>

      <div className="flex items-center gap-3 pl-3 border-l border-border">
        <div className="text-right leading-tight hidden sm:block">
          <div className="text-sm font-medium">T. Mokoena</div>
          <div className="text-[10px] uppercase tracking-wider text-accent">System Admin</div>
        </div>
        <div className="size-9 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold text-sm">TM</div>
        <Link to="/" className="p-2 rounded-md hover:bg-muted" title="Sign out">
          <LogOut className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </header>
  );
}
