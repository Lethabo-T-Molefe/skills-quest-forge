import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Field, SignalButton, TextInput } from "@/components";
import { completeMfa, hasMfaChallenge } from "@/features/auth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { errorMessage } from "@/lib/api";

export function MfaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [challenge] = useState(hasMfaChallenge);

  if (!challenge) {
    return (
      <AuthLayout label="multi-factor authentication" title="Sign in first">
        <p className="text-sm text-muted-foreground">
          This step follows your password. The challenge expires after five minutes or one attempt.
        </p>
        <Link
          to="/sign-in"
          className="mt-5 inline-block text-signal-strong underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout label="multi-factor authentication" title="Approve this sign-in">
      <p className="mb-6 text-sm text-muted-foreground">
        Enter the six-digit code from your authenticator app. A wrong code blocks this attempt, and
        you sign in again.
      </p>
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
              void navigate({ to: "/workspace" });
            })
            .catch((caught: unknown) => {
              setError(errorMessage(caught));
              window.setTimeout(() => void navigate({ to: "/sign-in" }), 2500);
            })
            .finally(() => setBusy(false));
        }}
      >
        <Field label="Authenticator code" error={error}>
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
          {busy ? "Checking…" : "Enter workspace"}
        </SignalButton>
      </form>
    </AuthLayout>
  );
}
