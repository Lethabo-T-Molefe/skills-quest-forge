import type { ReactNode } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

export function ScrollPane({
  children,
  className,
  orientation = "both",
}: {
  children: ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal" | "both";
}) {
  const showVertical = orientation === "vertical" || orientation === "both";
  const showHorizontal = orientation === "horizontal" || orientation === "both";

  return (
    <ScrollAreaPrimitive.Root className={cn("relative overflow-hidden", className)}>
      <ScrollAreaPrimitive.Viewport className="h-full max-h-full w-full">{children}</ScrollAreaPrimitive.Viewport>
      {showVertical ? (
        <ScrollAreaPrimitive.ScrollAreaScrollbar
          orientation="vertical"
          className="flex w-2 touch-none bg-surface-alt p-px"
        >
          <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 bg-line-strong" />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
      ) : null}
      {showHorizontal ? (
        <ScrollAreaPrimitive.ScrollAreaScrollbar
          orientation="horizontal"
          className="flex h-2 touch-none flex-col bg-surface-alt p-px"
        >
          <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 bg-line-strong" />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
      ) : null}
      <ScrollAreaPrimitive.Corner className="bg-surface-alt" />
    </ScrollAreaPrimitive.Root>
  );
}
