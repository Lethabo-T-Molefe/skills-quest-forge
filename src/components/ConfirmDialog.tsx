import type { ReactNode } from "react";
import { QuietButton } from "./QuietButton";
import { SignalButton } from "./SignalButton";

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
      <button type="button" className="absolute inset-0 bg-foreground/55" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-md border border-border bg-surface-raised p-6"
      >
        <h2 id="confirm-title" className="heading-2">
          {title}
        </h2>
        <div className="mt-3 text-sm text-muted-foreground">{children}</div>
        <div className="mt-6 flex flex-wrap gap-2">
          <SignalButton
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </SignalButton>
          <QuietButton onClick={onClose}>Cancel</QuietButton>
        </div>
      </div>
    </div>
  );
}
