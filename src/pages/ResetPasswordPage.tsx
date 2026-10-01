import { useState, type FormEvent } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Field, Notice, SignalButton, TextInput } from "@/components";
import { PASSWORD_MIN_LENGTH, passwordHint, resetPassword, signOut } from "@/features/auth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { errorMessage } from "@/lib/api";

/** Opened from a reset email, or from the invitation an administrator sends to a new member. */
export function ResetPasswordPage() {
  const { token } = useSearch({ from: "/reset-password" });
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== repeat) {
      setError("The two passwords are not the same.");
      return;
    }
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      await resetPassword(token, password);
      // A reset ends every session for the account, so this browser signs in again with the new password.
      await signOut();
      queryClient.clear();
      setDone(true);
    } catch (caught) {
      setError(errorMessage(caught, "The password could not be changed. Try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout label="choose a password" title="Set a new password">
      {!token ? (
        <Notice tone="signal" title="This link is incomplete">
          Open the link from your email again, or ask for a new one.
        </Notice>
      ) : done ? (
        <Notice tone="ok" title="Your password is set">
          Sign in with it now. Any other session for your account was signed out.
        </Notice>
      ) : (
        <form className="space-y-4" onSubmit={(event) => void submit(event)}>
          <Field label="New password" hint={passwordHint}>
            <TextInput
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={256}
              required
            />
          </Field>
          <Field label="New password, again" error={error}>
            <TextInput
              type="password"
              autoComplete="new-password"
              value={repeat}
              onChange={(event) => setRepeat(event.target.value)}
              maxLength={256}
              required
            />
          </Field>
          <SignalButton type="submit" className="w-full" disabled={busy}>
            {busy ? "Saving…" : "Set the password"}
          </SignalButton>
        </form>
      )}
      <p className="mt-6 text-sm">
        <Link
          to={done ? "/sign-in" : "/forgot-password"}
          className="text-signal-strong underline-offset-4 hover:underline"
        >
          {done ? "Sign in" : "Ask for a new link"}
        </Link>
      </p>
    </AuthLayout>
  );
}
