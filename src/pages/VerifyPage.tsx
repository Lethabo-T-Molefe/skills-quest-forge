import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Field, inputClass, SignalButton } from "@/components";
import { AuthLayout } from "@/layouts/AuthLayout";

export function VerifyPage() {
  const navigate = useNavigate();
  const email = window.sessionStorage.getItem("dataforge.pending-email") ?? "your inbox";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  return (
    <AuthLayout label="verify your email" title="Confirm you can receive mail here">
      <p className="mb-6 text-sm text-muted-foreground">
        An unverified account cannot run analysis. We sent a six-digit code to {email}.
      </p>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (code.replace(/\s/g, "").length !== 6) {
            setError("Enter the six-digit code from the email.");
            return;
          }
          void navigate({ to: "/mfa" });
        }}
      >
        <Field label="Verification code" error={error} hint="Any six digits works in this prototype.">
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
          Verify and continue
        </SignalButton>
      </form>
    </AuthLayout>
  );
}
