import { useEffect, useRef, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Notice, QuietButton } from "@/components";
import { getSession, pendingEmail, resendVerification, verifyEmail } from "@/features/auth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { errorMessage } from "@/lib/api";

type State =
  | { kind: "waiting" }
  | { kind: "checking" }
  | { kind: "done"; email: string }
  | { kind: "failed"; message: string };

/** Opened from the verification email (with a token), or right after registering (without one). */
export function VerifyPage() {
  const { token } = useSearch({ from: "/verify" });
  const queryClient = useQueryClient();
  const email = pendingEmail();
  const [state, setState] = useState<State>(token ? { kind: "checking" } : { kind: "waiting" });
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verifyEmail(token)
      .then((result) => {
        setState({ kind: "done", email: result.email });
        void queryClient.invalidateQueries({ queryKey: ["auth"] });
      })
      .catch((caught: unknown) => setState({ kind: "failed", message: errorMessage(caught) }));
  }, [token, queryClient]);

  const next = getSession()
    ? { to: "/workspace" as const, label: "Go to your workspace" }
    : { to: "/sign-in" as const, label: "Sign in" };

  return (
    <AuthLayout label="verify your email" title="Confirm you can receive mail here">
      {state.kind === "waiting" ? (
        <>
          <p className="text-sm text-muted-foreground">
            We sent a link to {email ?? "your inbox"}. Open it to verify your address. Until then
            you can sign in and look around, but analysis stays locked.
          </p>
          {email ? (
            <QuietButton
              className="mt-5"
              onClick={() =>
                void resendVerification(email).then(() =>
                  toast.success("A new link is on its way."),
                )
              }
            >
              Send the link again
            </QuietButton>
          ) : null}
        </>
      ) : null}
      {state.kind === "checking" ? (
        <p className="text-sm text-muted-foreground">Checking your link…</p>
      ) : null}
      {state.kind === "done" ? (
        <Notice tone="ok" title="Email verified">
          {state.email} is confirmed. Analysis is unlocked.
        </Notice>
      ) : null}
      {state.kind === "failed" ? (
        <Notice tone="signal" title="This link did not work">
          {state.message}
        </Notice>
      ) : null}
      <Link
        to={next.to}
        className="mt-6 inline-block text-signal-strong underline-offset-4 hover:underline"
      >
        {next.label}
      </Link>
    </AuthLayout>
  );
}
