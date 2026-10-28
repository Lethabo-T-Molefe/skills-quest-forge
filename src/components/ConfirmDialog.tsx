import { useEffect, useId, useRef, type ReactNode } from "react";
import { QuietButton } from "./QuietButton";
import { SignalButton } from "./SignalButton";

/** Asks before an action that cannot simply be undone. Escape cancels; focus returns to the trigger. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  busy = false,
  confirmDisabled = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  /** Keeps the dialog open and disables confirm while the action runs. */
  busy?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    confirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) closeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [open, busy]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/55"
        aria-label="Close"
        tabIndex={-1}
        disabled={busy}
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
        className="relative w-full max-w-md border border-border bg-surface-raised p-6"
      >
        <h2 id={titleId} className="heading-2">
          {title}
        </h2>
        <div className="mt-3 text-sm text-muted-foreground">{children}</div>
        <div className="mt-6 flex flex-wrap gap-2">
          <SignalButton
            ref={confirmRef}
            disabled={busy || confirmDisabled}
            onClick={() => {
              onConfirm();
            }}
          >
            {busy ? "Working…" : confirmLabel}
          </SignalButton>
          <QuietButton disabled={busy} onClick={onClose}>
            Cancel
          </QuietButton>
        </div>
      </div>
    </div>
  );
}
