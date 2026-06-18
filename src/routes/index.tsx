import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Lock, Mail, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CHIETA Data Lab — Sign in" },
      { name: "description", content: "Evidence-based skills intelligence for South Africa." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("t.mokoena@chieta.org.za");
  const [password, setPassword] = useState("••••••••••");

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* animated gradient bg */}
      <div className="fixed inset-0 -z-10 sw-gradient-bg" />

      {/* scroll progress strip */}
      <div className="fixed inset-x-0 top-0 h-1 bg-ink z-50" />

      {/* floating header logo pill */}
      <header className="fixed inset-x-0 top-6 z-40 flex justify-center px-4">
        <div className="sw-card flex items-center gap-3 px-4 py-2 bg-white">
          <img src="/chieta-logo.png" alt="CHIETA" className="h-8 w-auto" />
          <span className="h-5 w-px bg-ink/30" />
          <span className="font-display font-extrabold tracking-tight lowercase">data lab.</span>
        </div>
      </header>

      <main className="relative pt-32 pb-40 px-6 md:px-16 max-w-[1600px] mx-auto">
        {/* eyebrow */}
        <div className="flex items-center gap-3 mb-8">
          <span className="sw-pill-white !py-2 !px-3 !shadow-none border-ink">
            <span className="size-6 grid place-items-center rounded-full border border-ink">
              <ArrowUpRight className="size-3.5" />
            </span>
            <span className="text-sm">Evidence without borders. Innovating for impact.</span>
          </span>
        </div>

        {/* hero headline */}
        <h1 className="sw-display text-foreground"
            style={{ fontSize: "clamp(3rem, 2rem + 9vw, 13rem)", letterSpacing: "-0.06em" }}>
          SKILLS DATA
          <br />
          <span className="inline-block">
            <span className="word-highlight">BECOMES</span>
          </span>
          <br />
          INTELLIGENCE.
        </h1>

        <p className="mt-8 max-w-xl text-lg md:text-xl font-medium text-ink/80">
          A secure analytics, governance and decision-support workbench for the
          Chemical Industries Education & Training Authority of South Africa.
        </p>

        {/* login + side card */}
        <div className="mt-16 grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/app" }); }}
            className="sw-card p-7 md:p-10 bg-white"
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
              Enter the Data Lab
              <span className="size-7 grid place-items-center rounded-full bg-yellow border border-ink">
                <ArrowUpRight className="size-4" />
              </span>
            </button>

            <div className="mt-6 text-[11px] text-ink/60 leading-relaxed">
              Access is monitored & logged for compliance with the Protection of Personal
              Information Act, 2013. Misuse may result in disciplinary or criminal action.
            </div>
          </form>

          {/* right card */}
          <div className="grid grid-rows-[auto_1fr_auto] gap-6">
            <div className="sw-card p-7 bg-mint">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold">
                <Sparkles className="size-4" /> Now in Phase 1
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold uppercase tracking-tight leading-[1]">
                Co-branded rollout across all 9 provinces.
              </p>
              <p className="mt-3 text-sm">23 datasets ingested · 47 Smart Skills Centres live · 84,230 learners tracked.</p>
            </div>

            <div className="sw-card p-7 bg-lavender flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold">What you can do</div>
                <ul className="mt-3 space-y-2 text-sm font-medium">
                  <li>· Upload, govern and certify datasets</li>
                  <li>· Query the warehouse from SQL Lab</li>
                  <li>· Publish executive-ready dashboards</li>
                  <li>· Run ML predictions & what-if scenarios</li>
                </ul>
              </div>
              <div className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight leading-[0.9]">
                Built for evidence.<br/>Built for action.
              </div>
            </div>

            <div className="sw-card p-5 bg-peach flex items-center justify-between">
              <span className="font-medium text-sm">New here? Request an account from your line manager.</span>
              <span className="size-8 grid place-items-center rounded-full bg-white border border-ink">
                <ArrowUpRight className="size-4" />
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* bottom bar */}
      <div className="fixed inset-x-0 bottom-6 z-40 px-6 flex items-center justify-between gap-3">
        <Link to="/" className="sw-pill !py-3 text-sm">
          FAQ
          <span className="size-6 grid place-items-center rounded-full bg-white border border-ink">
            <ArrowUpRight className="size-3.5" />
          </span>
        </Link>

        <div className="sw-pill-white !py-3 text-sm hidden md:inline-flex">
          <span>What is it?</span><span>·</span>
          <span>For executives</span><span>·</span>
          <span>For analysts</span><span>·</span>
          <span>Governance</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="sw-pill-white !py-3 text-sm">
            <span className="font-bold underline">EN</span>
            <span className="opacity-50">·</span>
            <span>ZU</span>
            <span className="opacity-50">·</span>
            <span>AF</span>
          </div>
          <div className="sw-pill-white !p-0 size-12 !rounded-full grid place-items-center">
            <svg viewBox="0 0 40 24" className="w-7">
              <ellipse cx="13" cy="12" rx="5" ry="6" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="27" cy="12" rx="5" ry="6" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="13" r="2" fill="currentColor" />
              <circle cx="28" cy="13" r="2" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
