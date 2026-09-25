import type { ReactNode } from "react";

export function QuietButton({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-[999px] border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-transparent bg-surface-inverse text-background"
          : "border-line-strong bg-transparent hover:bg-accent/60"
      }`}
    >
      {children}
    </button>
  );
}
