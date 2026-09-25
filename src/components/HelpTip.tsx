import type { ReactNode } from "react";

export function HelpTip({ title = "Why this?", children }: { title?: string; children: ReactNode }) {
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-signal-strong underline-offset-4 hover:underline">{title}</summary>
      <div className="mt-2 max-w-[68ch] text-muted-foreground">{children}</div>
    </details>
  );
}
