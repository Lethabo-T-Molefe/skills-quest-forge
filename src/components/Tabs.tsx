import type { ComponentProps } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

/**
 * In-page tabs (style guide 15.5): pill list on Ivory 200, active tab on Ivory 50.
 * Radix handles arrow-key movement and the tab / tabpanel roles.
 */
export const TabsRoot = TabsPrimitive.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex max-w-full flex-wrap gap-1 rounded-[999px] bg-surface-alt p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[999px] px-3.5 py-1.5 text-sm text-muted-foreground transition-colors",
        "hover:text-foreground data-[state=active]:bg-surface-raised data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("focus-visible:outline-none", className)} {...props} />;
}
