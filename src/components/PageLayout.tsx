import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Page-level layout pieces. The page always scrolls as one: nothing locks itself to the height of the
 * window, so content keeps its natural size instead of being squeezed into small scroll boxes.
 */

/**
 * A side column (settings, steps, suggestions) next to the main content. On large screens it stays in
 * view while the page scrolls, and scrolls on its own only when it is taller than the window.
 */
export function SideRail({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <aside
      aria-label={label}
      className={cn(
        "min-w-0 lg:sticky lg:top-[5.25rem] lg:max-h-[calc(100dvh-6.5rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain",
        className,
      )}
    >
      {children}
    </aside>
  );
}

/** A tool layout: a side rail beside the main content on large screens, stacked on small ones. */
export function SplitLayout({
  rail,
  children,
  railWidth = "20rem",
  railSide = "left",
  railFirstOnMobile = false,
}: {
  rail: ReactNode;
  children: ReactNode;
  railWidth?: string;
  railSide?: "left" | "right";
  /** On a phone the main content comes first, unless the rail holds what must be chosen first. */
  railFirstOnMobile?: boolean;
}) {
  const columns =
    railSide === "left"
      ? "lg:grid-cols-[var(--rail)_minmax(0,1fr)]"
      : "lg:grid-cols-[minmax(0,1fr)_var(--rail)]";
  return (
    <div
      className={cn("grid items-start gap-6 lg:gap-8", columns)}
      style={{ "--rail": railWidth } as CSSProperties}
    >
      <div
        className={cn(
          railFirstOnMobile ? "order-1" : "order-2",
          railSide === "left" ? "lg:order-1" : "lg:order-2",
        )}
      >
        {rail}
      </div>
      <div
        className={cn(
          "min-w-0",
          railFirstOnMobile ? "order-2" : "order-1",
          railSide === "left" ? "lg:order-2" : "lg:order-1",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Actions that must stay reachable on a long page (Next, Run, Ask). They sit at the end of their section and
 * stick to the bottom of the window while that section is on screen.
 */
export function StickyActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 flex flex-wrap items-center gap-3 border-t border-border bg-surface-raised/95 px-5 py-3 backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A table that keeps its natural height and scrolls sideways only when its columns are wider than the page. */
export function TableFrame({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    // Focusable so keyboard users can scroll a wide table sideways.
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn("overflow-x-auto border border-border bg-surface-raised", className)}
    >
      {children}
    </div>
  );
}
