import { Link } from "@tanstack/react-router";
import { MediaFrame, signalButtonClass } from "@/components";
import { media } from "@/config/media";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md">
        <MediaFrame {...media.empty} ratio="16 / 9" className="mb-8" />
        <p className="label-paren">(unavailable)</p>
        <h1 className="heading-1 mt-1">This page is not here</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The address does not match a screen you can open. Head back to your workspace, or search
          the catalogue.
        </p>
        <div className="mt-6">
          <Link to="/" className={signalButtonClass}>
            Go to DataForge
          </Link>
        </div>
      </div>
    </div>
  );
}
