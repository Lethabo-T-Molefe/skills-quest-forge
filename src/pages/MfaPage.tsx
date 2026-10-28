import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Field, SignalButton, TextInput } from "@/components";
import { completeMfa, hasMfaChallenge, mfaEnrollmentDetails } from "@/features/auth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { errorMessage } from "@/lib/api";

function safeRedirect(path: string | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/sign-in")) {
    return "/workspace";
  }
  return path;
}

export function MfaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { redirect: redirectTo } = useSearch({ from: "/mfa" });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [challenge] = useState(hasMfaChallenge);
  const [enrollment] = useState(mfaEnrollmentDetails);

  if (!challenge) {
    return (
      <AuthLayout label="multi-factor authentication" title="Sign in first">
        <p className="text-sm text-muted-foreground">
          This step follows your password. The challenge expires after five minutes or one attempt.
        </p>
        <Link
          to="/sign-in"
          search={redirectTo ? { redirect: redirectTo } : {}}
          className="mt-5 inline-block text-signal-strong underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  const enrolling = enrollment !== null;

  return (
    <AuthLayout
      label="multi-factor authentication"
      title={enrolling ? "Set up authenticator for admin access" : "Approve this sign-in"}
    >
      {enrolling ? (
        <div className="mb-6 space-y-3 text-sm text-muted-foreground">
          <p>
            Administrators must enrol multi-factor authentication before entering the workspace. Add
            this account to your authenticator app, then enter the six-digit code.
          </p>
          <p className="break-all rounded border border-border bg-surface-alt px-3 py-2 font-mono text-xs text-foreground">
            {enrollment.secret}
          </p>
          <p className="text-xs">
            Or open{" "}
            <a
              href={enrollment.otpauthUri}
              className="text-signal-strong underline-offset-4 hover:underline"
            >
              this authenticator link
            </a>
            .
          </p>
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">
          Enter the six-digit code from your authenticator app. A wrong code blocks this attempt,
          and you sign in again.
        </p>
      )}
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (code.replace(/\s/g, "").length !== 6) {
            setError("Enter the six-digit authenticator code.");
            return;
          }
          setBusy(true);
          completeMfa(code)
            .then(async () => {
              await queryClient.invalidateQueries({ queryKey: ["auth"] });
              void navigate({ to: safeRedirect(redirectTo) });
            })
            .catch((caught: unknown) => {
              setError(errorMessage(caught));
              window.setTimeout(
                () =>
                  void navigate({
                    to: "/sign-in",
                    search: redirectTo ? { redirect: redirectTo } : {},
                  }),
                2500,
              );
            })
            .finally(() => setBusy(false));
        }}
      >
        <Field label="Authenticator code" error={error || undefined}>
          <TextInput
            className="num tracking-[0.4em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={7}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setError("");
            }}
          />
        </Field>
        <SignalButton type="submit" className="w-full" disabled={busy}>
          {busy ? "Checking…" : enrolling ? "Turn on MFA and enter" : "Enter workspace"}
        </SignalButton>
      </form>
    </AuthLayout>
  );
}
