import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { ScrollPane } from "./ScrollPane";

/**
 * A side panel for detail on demand. It behaves as a dialog: Escape closes it,
 * focus moves into it when it opens and returns to where it was when it closes.
 */
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
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button type="button" className="absolute inset-0 bg-foreground/55" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-surface-raised shadow-[0_24px_64px_-16px_rgba(28,31,32,0.28)] focus:outline-none"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <h2 id={titleId} className="heading-2">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-accent">
            <X className="size-5" strokeWidth={1.5} />
            <span className="sr-only">Close</span>
          </button>
        </header>
        <ScrollPane className="min-h-0 flex-1 px-6 py-5" orientation="vertical">
          {children}
        </ScrollPane>
      </aside>
    </div>
  );
}
