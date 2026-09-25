import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const signalButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-[999px] bg-signal-strong px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-signal disabled:pointer-events-none disabled:opacity-50";

export function SignalButton({
  children,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button type={type} className={cn(signalButtonClass, className)} {...props}>
      {children}
    </button>
  );
}
