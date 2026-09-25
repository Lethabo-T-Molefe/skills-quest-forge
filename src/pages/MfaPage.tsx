import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Field, inputClass, SignalButton } from "@/components";
import { demoUser, initialsFromName, setSession } from "@/features/auth";
import { AuthLayout } from "@/layouts/AuthLayout";

export function MfaPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  return (
    <AuthLayout label="multi-factor authentication" title="Approve this sign-in">
      <p className="mb-6 text-sm text-muted-foreground">
        A failed second factor blocks the session. Enter the code from your authenticator app.
      </p>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (code.replace(/\s/g, "").length !== 6) {
            setError("Enter the six-digit authenticator code.");
            return;
          }
          const name = window.sessionStorage.getItem("dataforge.pending-name") ?? demoUser.name;
          const email = window.sessionStorage.getItem("dataforge.pending-email") ?? demoUser.email;
          setSession({
            ...demoUser,
            name,
            email,
            initials: initialsFromName(name) || demoUser.initials,
            workspace: `${name.split(" ")[0] ?? "Your"}'s workspace`,
          });
          void navigate({ to: "/workspace" });
        }}
      >
        <Field label="Authenticator code" error={error} hint="Use 123456 in this prototype.">
          <input
            className={`${inputClass} num tracking-[0.4em]`}
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setError("");
            }}
          />
        </Field>
        <SignalButton type="submit" className="w-full">
          Enter workspace
        </SignalButton>
      </form>
    </AuthLayout>
  );
}
