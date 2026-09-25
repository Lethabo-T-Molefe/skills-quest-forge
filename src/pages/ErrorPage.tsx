import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { MediaFrame, QuietButton, SignalButton } from "@/components";
import { media } from "@/config/media";

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md">
        <MediaFrame {...media.empty} ratio="16 / 9" className="mb-8" />
        <p className="label-paren">(something went wrong)</p>
        <h1 className="heading-1 mt-1">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something failed on our end. You can try again, or go back to your workspace.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <SignalButton
            onClick={() => {
              void router.invalidate();
              reset();
            }}
          >
            Try again
          </SignalButton>
          <a href="/">
            <QuietButton>Go home</QuietButton>
          </a>
        </div>
      </div>
    </div>
  );
}
