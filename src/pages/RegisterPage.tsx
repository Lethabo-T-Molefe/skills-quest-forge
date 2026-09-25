import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Field, inputClass, SignalButton } from "@/components";
import { AuthLayout } from "@/layouts/AuthLayout";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <AuthLayout label="self-service registration" title="Create your DataForge account">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length < 2 || !email.includes("@") || password.length < 8) {
            setError("Use your real name, a work email, and a password of at least 8 characters.");
            return;
          }
          window.sessionStorage.setItem("dataforge.pending-name", name);
          window.sessionStorage.setItem("dataforge.pending-email", email);
          void navigate({ to: "/verify" });
        }}
      >
        <Field label="Full name" error={error}>
          <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Work email">
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Password" hint="At least 8 characters. Hashed with a modern adaptive algorithm in production.">
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <SignalButton type="submit" className="w-full">
          Send a verification email
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
