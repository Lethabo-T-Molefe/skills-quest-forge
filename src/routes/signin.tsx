import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { ROLES, ROLE_IDENTITY, ROLE_BLURB, type Role } from "@/lib/roles";
import { persistRole } from "@/lib/role-context";
import { RingCluster, RingArcs } from "@/components/lab/circle-decor";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "CHIETA Data Lab — Sign in" },
      { name: "description", content: "Sign in to the CHIETA Data Lab." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("System Admin");
  const [email, setEmail] = useState(ROLE_IDENTITY["System Admin"].email);
  const [password, setPassword] = useState("••••••••••");

  function selectRole(r: Role) {
    setRole(r);
    setEmail(ROLE_IDENTITY[r].email);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10 sw-gradient-bg" />
      <div className="fixed inset-x-0 top-0 h-1 bg-ink z-50" />

      <header className="fixed inset-x-0 top-6 z-40 flex justify-center px-4">
        <Link to="/" className="sw-card flex items-center gap-3 px-4 py-2 bg-white">
          <img src="/chieta-logo.png" alt="CHIETA" className="h-8 w-auto" />
          <span className="h-5 w-px bg-ink/30" />
          <span className="font-display font-extrabold tracking-tight lowercase">data lab.</span>
        </Link>
      </header>

      <main className="relative min-h-screen flex items-center justify-center px-6 py-32">
        <RingArcs className="hidden lg:block absolute -top-16 -left-16 w-80 -z-10 pointer-events-none" />
        <RingCluster className="hidden lg:block absolute -bottom-20 -right-20 w-96 -z-10 pointer-events-none" />
        <form
          onSubmit={(e) => { e.preventDefault(); persistRole(role); navigate({ to: "/app" }); }}
          className="sw-card p-7 md:p-10 bg-white w-full max-w-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 grid place-items-center rounded-full bg-lime border border-ink">
              <Lock className="size-4" />
            </div>
            <div>
              <div className="font-display text-xl font-extrabold uppercase tracking-tight">Sign in</div>
              <div className="text-xs text-ink/60">Authorised CHIETA personnel only.</div>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-xs uppercase tracking-wider font-semibold">Sign in as</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => selectRole(r)}
                  className={`text-left px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    role === r ? "bg-ink text-background border-ink" : "bg-white border-ink/30 hover:border-ink"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="text-xs text-ink/60 mt-2">{ROLE_BLURB[role]}</div>
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-wider font-semibold">Work email</span>
            <div className="mt-2 flex items-center gap-2 border border-ink rounded-xl px-4 py-3 bg-white focus-within:shadow-[0_4px_0_0_var(--ink)] transition-shadow">
              <Mail className="size-4 text-ink/60" />
              <input value={email} onChange={e => setEmail(e.target.value)}
                     className="flex-1 bg-transparent outline-none text-sm" type="email" />
            </div>
          </label>

          <label className="block mt-5">
            <span className="text-xs uppercase tracking-wider font-semibold">Password</span>
            <div className="mt-2 flex items-center gap-2 border border-ink rounded-xl px-4 py-3 bg-white focus-within:shadow-[0_4px_0_0_var(--ink)] transition-shadow">
              <Lock className="size-4 text-ink/60" />
              <input value={password} onChange={e => setPassword(e.target.value)}
                     className="flex-1 bg-transparent outline-none text-sm" type="password" />
            </div>
          </label>

          <div className="flex items-center justify-between mt-4 text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-ink" /> Remember device</label>
            <a className="underline underline-offset-2" href="#">Forgot password?</a>
          </div>

          <button type="submit" className="sw-pill mt-8 w-full !py-4 text-base">
            Enter as {role}
            <span className="size-7 grid place-items-center rounded-full bg-yellow border border-ink">
              <ArrowUpRight className="size-4" />
            </span>
          </button>

          <div className="mt-6 text-[11px] text-ink/60 leading-relaxed">
            Access is monitored & logged for compliance with the Protection of Personal
            Information Act, 2013. Misuse may result in disciplinary or criminal action.
            New here? Request an account from your line manager.
          </div>

          <Link to="/" className="block text-center text-xs underline underline-offset-2 mt-4 text-ink/70">← Back to chieta data lab overview</Link>
        </form>
      </main>
    </div>
  );
}
