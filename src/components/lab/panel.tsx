import type { ReactNode } from "react";

export function Panel({ title, subtitle, action, children, className = "" }: {
  title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display font-semibold tracking-tight">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
        </div>
        {action}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({ tone = "muted", children }: { tone?: "muted" | "success" | "danger" | "warn" | "info" | "accent"; children: ReactNode }) {
  const map: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    success: "bg-success/20 text-success border border-success/40",
    danger: "bg-danger/20 text-danger border border-danger/40",
    warn: "bg-amber/20 text-amber border border-amber/40",
    info: "bg-teal/20 text-teal border border-teal/40",
    accent: "bg-accent/20 text-accent border border-accent/40",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider ${map[tone]}`}>{children}</span>;
}
