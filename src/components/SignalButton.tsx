import type { ReactNode } from "react";

export function SignalButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-[999px] bg-signal-strong px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-signal"
    >
      {children}
    </button>
  );
}
