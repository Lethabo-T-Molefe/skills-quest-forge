import type { ReactNode } from "react";
import { InfoHint, type InfoContent } from "./info-hint";

export function Panel({ title, subtitle, action, children, className = "", info }: {
  title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string; info?: InfoContent;
}) {
  return (
    <div className={`sw-card bg-card p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <div className="font-display font-extrabold uppercase tracking-tight">{title}</div>
            {info && <InfoHint title={title} content={info} />}
          </div>
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
        <h1 className="font-display text-2xl md:text-3xl font-extrabold uppercase tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({ tone = "muted", children }: { tone?: "muted" | "success" | "danger" | "warn" | "info" | "accent"; children: ReactNode }) {
  const map: Record<string, string> = {
    muted: "bg-muted text-foreground border border-ink/20",
    success: "bg-success/15 text-success border border-success/40",
    danger: "bg-danger/15 text-danger border border-danger/40",
    warn: "bg-peach/50 text-ink border border-ink/40",
    info: "bg-lavender/40 text-ink border border-ink/40",
    accent: "bg-lime/50 text-ink border border-ink/40",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${map[tone]}`}>{children}</span>;
}
