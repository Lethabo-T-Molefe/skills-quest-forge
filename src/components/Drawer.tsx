import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button type="button" className="absolute inset-0 bg-foreground/55" aria-label="Close" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-surface-raised shadow-[0_24px_64px_-16px_rgba(28,31,32,0.28)]">
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <h2 className="heading-2">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-accent">
            <X className="size-5" strokeWidth={1.5} />
            <span className="sr-only">Close</span>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </aside>
    </div>
  );
}
