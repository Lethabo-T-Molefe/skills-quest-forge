import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export function AuthLayout({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-12">
      <aside className="hidden bg-surface-inverse px-10 py-12 text-background lg:col-span-5 lg:flex lg:flex-col">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden />
          <span className="font-display text-2xl font-medium tracking-tight">{siteConfig.name}</span>
        </Link>
        <p className="mt-1 text-sm text-white/55">({siteConfig.tagline})</p>
        <p className="display-1 mt-16 max-w-[12ch]">Show the work.</p>
        <p className="mt-8 max-w-[36ch] text-sm leading-relaxed text-white/70">
          Every answer comes with the code behind it and a plain-language explanation. Access is role-checked. Personal
          information is masked. Nothing runs outside a sandbox.
        </p>
        <div className="mt-auto">
          <img
            src="/images/hero-plot.png"
            alt=""
            className="mb-6 aspect-[4/3] w-full object-cover opacity-80"
          />
          <p className="text-sm text-white/50">Amina Patel · platform contact · English and isiZulu</p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-16 lg:col-span-7">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-baseline gap-2 lg:hidden">
            <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden />
            <span className="font-display text-xl">{siteConfig.name}</span>
          </Link>
          <p className="label-paren">({label})</p>
          <h1 className="heading-1 mt-1">{title}</h1>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
