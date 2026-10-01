import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Field, Notice, SignalButton, TextInput } from "@/components";
import { forgotPassword } from "@/features/auth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { errorMessage } from "@/lib/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await forgotPassword(email.trim());
      setSentTo(email.trim());
    } catch (caught) {
      setError(errorMessage(caught, "The link could not be sent. Try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout label="reset your password" title="Get a link to choose a new password">
      {sentTo ? (
        <Notice tone="ok" title="Check your inbox">
          If {sentTo} has an account, a link is on its way. It works once and expires after a short
          time.
        </Notice>
      ) : (
        <form className="space-y-4" onSubmit={(event) => void submit(event)}>
          <Field label="Work email" error={error}>
            <TextInput
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <SignalButton type="submit" className="w-full" disabled={busy}>
            {busy ? "Sending…" : "Send the link"}
          </SignalButton>
        </form>
      )}
      <p className="mt-6 text-sm">
        <Link to="/sign-in" className="text-signal-strong underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
