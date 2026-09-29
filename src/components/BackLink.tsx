import { forwardRef, type AnchorHTMLAttributes } from "react";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const BackAnchor = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
        className,
      )}
      {...props}
    >
      <ArrowLeft className="size-3.5" strokeWidth={1.75} aria-hidden />
      {children}
    </a>
  ),
);
BackAnchor.displayName = "BackAnchor";

const CreatedBackLink = createLink(BackAnchor);

/** "Back to …" link above a page title. Typed like a router Link, so its route and params are checked. */
export const BackLink: LinkComponent<typeof BackAnchor> = (props) => <CreatedBackLink preload="intent" {...props} />;
