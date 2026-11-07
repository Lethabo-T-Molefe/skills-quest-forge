import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Field, PasswordInput, SignalButton, TextInput } from "@/components";
import { register } from "@/features/auth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { errorMessage } from "@/lib/api";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <AuthLayout label="self-service registration" title="Create your DataForge account">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setNameError("");
          setEmailError("");
          setPasswordError("");
          if (name.trim().length < 2) {
            setNameError("Enter your full name.");
            return;
          }
          if (!email.includes("@")) {
            setEmailError("Enter a work email.");
            return;
          }
          setBusy(true);
          register(name.trim(), email.trim(), password)
            .then(() => void navigate({ to: "/verify", search: { token: undefined } }))
            .catch((caught: unknown) => {
              const message = errorMessage(caught);
              const lower = message.toLowerCase();
              if (lower.includes("password")) setPasswordError(message);
              else if (lower.includes("email") || lower.includes("already")) setEmailError(message);
              else if (lower.includes("name")) setNameError(message);
              else setEmailError(message);
            })
            .finally(() => setBusy(false));
        }}
      >
        <Field label="Full name" error={nameError || undefined}>
          <TextInput
            autoComplete="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError("");
            }}
          />
        </Field>
        <Field label="Work email" error={emailError || undefined}>
          <TextInput
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError("");
            }}
          />
        </Field>
        <Field
          label="Password"
          hint="At least 10 characters, mixing three of: lower case, upper case, digits and symbols."
          error={passwordError || undefined}
        >
          <PasswordInput
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setPasswordError("");
            }}
          />
        </Field>
        <SignalButton type="submit" className="w-full" disabled={busy}>
          {busy ? "Creating your account…" : "Create account and send a verification email"}
        </SignalButton>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Already registered?{" "}
        <Link to="/sign-in" className="text-signal-strong underline-offset-4 hover:underline">
          Sign in
        </Link>
        {" · "}
        <Link to="/" className="text-signal-strong underline-offset-4 hover:underline">
          Back to the site
        </Link>
      </p>
    </AuthLayout>
  );
}
