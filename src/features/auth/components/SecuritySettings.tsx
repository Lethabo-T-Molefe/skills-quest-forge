import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Field, Notice, Panel, QuietButton, SignalButton, TextInput } from "@/components";
import { notifyError } from "@/lib/notify";
import { changePassword, disableMfa, enableMfa, signOut, startMfaSetup } from "../api/session";
import { PASSWORD_MIN_LENGTH, passwordHint } from "../constants";
import { useCurrentUser } from "../hooks/use-current-user";

/** The member's own sign-in security: a second factor from an authenticator app, and their password. */
export function SecuritySettings() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <MfaPanel />
      <PasswordPanel />
    </div>
  );
}

function MfaPanel() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [turningOff, setTurningOff] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["auth"] });

  const setup = useMutation({
    mutationFn: startMfaSetup,
    onError: notifyError("Set-up could not be started."),
  });

  const enable = useMutation({
    mutationFn: () => enableMfa(code),
    onSuccess: async () => {
      await refresh();
      setup.reset();
      setCode("");
      toast.success("Multi-factor authentication is on", {
        description: "You will be asked for a code each time you sign in.",
      });
    },
    onError: notifyError("That code was not accepted."),
  });

  const disable = useMutation({
    mutationFn: () => disableMfa(password, code),
    onSuccess: async () => {
      await refresh();
      setTurningOff(false);
      setCode("");
      setPassword("");
      toast.success("Multi-factor authentication is off");
    },
    onError: notifyError("Multi-factor authentication could not be turned off."),
  });

  return (
    <Panel>
      <h2 className="heading-2">Multi-factor authentication</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {user.mfaEnabled
          ? "On. Signing in needs your password and a code from your authenticator app."
          : "Off. Add a second step, so a stolen password is not enough to sign in as you."}
      </p>

      {user.mfaEnabled ? (
        turningOff ? (
          <form
            className="mt-4 space-y-4"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              disable.mutate();
            }}
          >
            <Field label="Your password">
              <TextInput
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>
            <Field label="A code from your authenticator app">
              <TextInput
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                maxLength={10}
                required
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <SignalButton type="submit" disabled={disable.isPending}>
                {disable.isPending ? "Turning off…" : "Turn it off"}
              </SignalButton>
              <QuietButton onClick={() => setTurningOff(false)}>Keep it on</QuietButton>
            </div>
          </form>
        ) : (
          <QuietButton className="mt-4" onClick={() => setTurningOff(true)}>
            Turn it off
          </QuietButton>
        )
      ) : setup.data ? (
        <form
          className="mt-4 space-y-4"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            enable.mutate();
          }}
        >
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              Scan this with an authenticator app, such as Google Authenticator or Authy.
              <div className="mt-3 w-fit bg-white p-3">
                <QRCodeSVG
                  value={setup.data.otpauthUri}
                  size={168}
                  title="Authenticator set-up code"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Cannot scan it? Enter this key by hand:{" "}
                <code className="font-mono break-all text-foreground">{setup.data.secret}</code>
              </p>
            </li>
            <li>Enter the six-digit code the app shows, to confirm it works.</li>
          </ol>
          <Field label="Code from the app">
            <TextInput
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              maxLength={10}
              required
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <SignalButton type="submit" disabled={enable.isPending}>
              {enable.isPending ? "Checking…" : "Turn it on"}
            </SignalButton>
            <QuietButton
              onClick={() => {
                setup.reset();
                setCode("");
              }}
            >
              Cancel
            </QuietButton>
          </div>
        </form>
      ) : (
        <SignalButton className="mt-4" disabled={setup.isPending} onClick={() => setup.mutate()}>
          {setup.isPending ? "Starting…" : "Set it up"}
        </SignalButton>
      )}
    </Panel>
  );
}

function PasswordPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const mismatch = repeat.length > 0 && next !== repeat;

  const change = useMutation({
    mutationFn: () => changePassword(current, next),
    onSuccess: async () => {
      // The API ends every session when a password changes, so this one signs in again.
      await signOut();
      queryClient.clear();
      toast.success("Password changed", { description: "Sign in with your new password." });
      await navigate({ to: "/sign-in" });
    },
    onError: notifyError("The password could not be changed."),
  });

  return (
    <Panel>
      <h2 className="heading-2">Password</h2>
      <form
        className="mt-4 space-y-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          if (!mismatch) change.mutate();
        }}
      >
        <Field label="Current password">
          <TextInput
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            required
          />
        </Field>
        <Field label="New password" hint={passwordHint}>
          <TextInput
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(event) => setNext(event.target.value)}
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={256}
            required
          />
        </Field>
        <Field
          label="New password, again"
          {...(mismatch ? { error: "The two passwords are not the same." } : {})}
        >
          <TextInput
            type="password"
            autoComplete="new-password"
            value={repeat}
            onChange={(event) => setRepeat(event.target.value)}
            maxLength={256}
            required
          />
        </Field>
        <Notice title="You will be signed out everywhere">
          Changing your password ends every session, including this one.
        </Notice>
        <SignalButton type="submit" disabled={change.isPending || mismatch}>
          {change.isPending ? "Changing…" : "Change password"}
        </SignalButton>
      </form>
    </Panel>
  );
}
