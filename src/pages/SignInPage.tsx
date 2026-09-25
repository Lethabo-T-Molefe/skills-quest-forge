import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Field, inputClass, QuietButton, SignalButton } from "@/components";
import { demoUser, signInDemo } from "@/features/auth";
import { AuthLayout } from "@/layouts/AuthLayout";

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(demoUser.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <AuthLayout label="welcome back" title="Sign in to your workspace">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!email.includes("@") || password.length < 1) {
            setError("Enter the work email and password you registered with.");
            return;
          }
          window.sessionStorage.setItem("dataforge.pending-email", email);
          void navigate({ to: "/mfa" });
        }}
      >
        <Field label="Work email" error={error}>
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
          />
        </Field>
        <Field label="Password">
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <SignalButton type="submit" className="w-full">
          Continue to second factor
        </SignalButton>
      </form>

      <QuietButton
        className="mt-3 w-full"
        onClick={() => {
          signInDemo();
          void navigate({ to: "/workspace" });
        }}
      >
        Use the demo workspace
      </QuietButton>

      <p className="mt-6 text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="text-signal-strong underline-offset-4 hover:underline">
          Create an account
        </Link>
        {" · "}
        <Link to="/" className="text-signal-strong underline-offset-4 hover:underline">
          Back to the site
        </Link>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Single sign-on through the organisation's identity provider is available in production. This prototype keeps
        the same screens.
      </p>
    </AuthLayout>
  );
}
