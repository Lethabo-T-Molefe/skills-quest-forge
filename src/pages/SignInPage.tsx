import { useEffect, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Field,
  PasswordInput,
  QuietButton,
  SelectMenu,
  SignalButton,
  TextInput,
} from "@/components";
import { demoAvailable, roleLabels, signIn, signInDemo, type RoleId } from "@/features/auth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { errorMessage } from "@/lib/api";

const demoRoles = Object.entries(roleLabels) as [RoleId, string][];

function safeRedirect(path: string | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/sign-in")) {
    return "/workspace";
  }
  return path;
}

export function SignInPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { redirect: redirectTo } = useSearch({ from: "/sign-in" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(false);
  const [demoRole, setDemoRole] = useState<RoleId>("analyst");

  useEffect(() => {
    void demoAvailable().then(setDemo);
  }, []);

  async function enter(action: () => Promise<unknown>) {
    setBusy(true);
    setEmailError("");
    setPasswordError("");
    setFormError("");
    try {
      const outcome = await action();
      if (outcome === "mfa" || outcome === "mfa-enroll") {
        void navigate({
          to: "/mfa",
          search: redirectTo ? { redirect: redirectTo } : {},
        });
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      void navigate({ to: safeRedirect(redirectTo) });
    } catch (caught) {
      const message = errorMessage(caught, "Sign-in failed. Try again.");
      const lower = message.toLowerCase();
      if (lower.includes("password") && !lower.includes("email")) {
        setPasswordError(message);
      } else if (lower.includes("email") || lower.includes("account") || lower.includes("locked")) {
        setEmailError(message);
      } else if (lower.includes("email or password") || lower.includes("not correct")) {
        setPasswordError(message);
      } else {
        setFormError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout label="welcome back" title="Sign in to your workspace">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!email.includes("@")) {
            setEmailError("Enter the work email you registered with.");
            return;
          }
          if (password.length < 1) {
            setPasswordError("Enter your password.");
            return;
          }
          void enter(() => signIn(email.trim(), password));
        }}
      >
        <Field label="Work email" error={emailError || undefined}>
          <TextInput
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError("");
              setFormError("");
            }}
          />
        </Field>
        <Field label="Password" error={passwordError || formError || undefined}>
          <PasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setPasswordError("");
              setFormError("");
            }}
          />
        </Field>
        <SignalButton type="submit" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </SignalButton>
        <p className="text-sm">
          <Link
            to="/forgot-password"
            className="text-signal-strong underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
        </p>
      </form>

      {demo ? (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm font-medium">Explore the demo organisation</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in as a seeded member to see how the screens change for each role.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <SelectMenu
              size="sm"
              label="Role"
              className="min-w-48 flex-1"
              value={demoRole}
              onValueChange={(next) => setDemoRole(next as RoleId)}
              options={demoRoles.map(([value, label]) => ({ value, label }))}
            />
            <QuietButton disabled={busy} onClick={() => void enter(() => signInDemo(demoRole))}>
              Use the demo workspace
            </QuietButton>
          </div>
        </div>
      ) : null}

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
    </AuthLayout>
  );
}
