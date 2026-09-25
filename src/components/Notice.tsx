import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  info: { icon: Info, bar: "border-line-strong", iconClass: "text-muted-foreground" },
  signal: { icon: CircleAlert, bar: "border-signal", iconClass: "text-signal" },
  ok: { icon: CircleCheck, bar: "border-success", iconClass: "text-success" },
  warn: { icon: CircleAlert, bar: "border-warning", iconClass: "text-warning" },
} as const;

export function Notice({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: keyof typeof tones;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const look = tones[tone];
  const Icon = look.icon;

  return (
    <div role="status" className={cn("flex gap-3 border-l-2 bg-surface-raised px-4 py-3", look.bar, className)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", look.iconClass)} strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {children ? <div className="mt-1 text-sm text-muted-foreground">{children}</div> : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </div>
  );
}
