import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={cn("panel p-6", className)}>{children}</section>;
}
