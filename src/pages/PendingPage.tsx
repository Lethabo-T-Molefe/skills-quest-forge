import { LoaderCircle } from "lucide-react";

/** Shown while a page's data is on its way, when that takes more than a moment. */
export function PendingPage() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center bg-background px-6"
      role="status"
      aria-live="polite"
    >
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" strokeWidth={2} aria-hidden />
        Loading…
      </p>
    </div>
  );
}
