import type { ReactNode } from "react";

export type ChipTone = "neutral" | "signal" | "ok" | "warn";

const tones: Record<ChipTone, string> = {
  neutral: "bg-surface-alt text-muted-foreground",
  signal: "bg-signal-tint text-signal-strong",
  ok: "bg-surface-alt text-success",
  warn: "bg-surface-alt text-warning",
};

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: ChipTone }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[999px] px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
