import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const quietButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-[999px] border border-line-strong bg-transparent px-4 py-2 text-sm transition-colors hover:bg-accent/60 disabled:pointer-events-none disabled:opacity-50";

export const quietButtonActiveClass = "border-transparent bg-surface-inverse text-background hover:bg-surface-inverse";

export function QuietButton({
  children,
  className,
  active,
  type = "button",
  ...props
}: ComponentProps<"button"> & { children: ReactNode; active?: boolean }) {
  return (
    <button type={type} className={cn(quietButtonClass, active && quietButtonActiveClass, className)} {...props}>
      {children}
    </button>
  );
}
