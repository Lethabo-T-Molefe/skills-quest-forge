import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { MediaFrame, QuietButton, SignalButton } from "@/components";
import { media } from "@/config/media";
import { ApiError } from "@/lib/api";

/** What went wrong, in terms of what the person can do about it. */
function explain(error: unknown): { label: string; title: string; body: string } {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return {
        label: "no connection",
        title: "DataForge cannot be reached",
        body: "The service did not answer. Check your connection, then try again.",
      };
    }
    if (error.status === 403) {
      return {
        label: "not permitted",
        title: "Your role cannot open this",
        body: error.message,
      };
    }
    if (error.status === 429) {
      return {
        label: "slow down",
        title: "Too many requests",
        body: "Wait a moment, then try again.",
      };
    }
    if (error.status < 500) {
      return {
        label: "something went wrong",
        title: "This page did not load",
        body: error.message,
      };
    }
  }
  return {
    label: "something went wrong",
    title: "This page did not load",
    body: "Something failed on our end. You can try again, or go back to your workspace.",
  };
}

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const { label, title, body } = explain(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="max-w-md">
        <MediaFrame {...media.empty} ratio="16 / 9" className="mb-8" />
        <p className="label-paren">({label})</p>
        <h1 className="heading-1 mt-1">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{body}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <SignalButton
            onClick={() => {
              void router.invalidate();
              reset();
            }}
          >
            Try again
          </SignalButton>
          <a href="/workspace">
            <QuietButton>Go to your workspace</QuietButton>
          </a>
        </div>
      </div>
    </div>
  );
}
