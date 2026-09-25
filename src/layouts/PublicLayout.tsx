import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Logo, quietButtonClass, signalButtonClass } from "@/components";
import { publicNav } from "@/config/public";
import { getSession } from "@/features/auth";

export function PublicLayout({ children }: { children: ReactNode }) {
  const session = getSession();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="page-grid" aria-hidden="true" />
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-5 py-4 md:px-10">
          <Link to="/" className="block w-40 shrink-0 md:w-44">
            <Logo variant="secondary" className="w-full" />
          </Link>
          <nav className="ml-8 hidden items-center gap-1 lg:flex">
            {publicNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-surface-inverse text-background" }}
                inactiveProps={{ className: "text-muted-foreground hover:bg-accent/60" }}
                className="rounded-[999px] px-3 py-1.5 text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            {session ? (
              <Link to="/workspace" className={signalButtonClass}>
                Open workspace
              </Link>
            ) : (
              <>
                <Link to="/sign-in" className={quietButtonClass}>
                  Sign in
                </Link>
                <Link to="/register" className={signalButtonClass}>
                  Open a workspace
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="ml-auto rounded-full p-2 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            {open ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
            <span className="sr-only">Menu</span>
          </button>
        </div>
        {open ? (
          <nav className="flex flex-col gap-1 border-t border-border px-5 py-3 lg:hidden">
            {publicNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-[999px] px-3 py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link to={session ? "/workspace" : "/register"} className={`${signalButtonClass} mt-2`} onClick={() => setOpen(false)}>
              {session ? "Open workspace" : "Open a workspace"}
            </Link>
          </nav>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="bg-surface-inverse text-background">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-16 md:grid-cols-12 md:px-10">
          <div className="md:col-span-5">
            <img
              src="/images/hero-plot.png"
              alt=""
              className="mb-6 aspect-[16/9] w-full max-w-sm object-cover opacity-80"
            />
            <Logo variant="primary" tone="reverse" className="w-48" />
            <p className="mt-6 max-w-[36ch] text-sm leading-relaxed text-white/70">
              A governed AI data analyst that a non-technical person can actually use. One organisation, one instance,
              self-hosted.
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="text-sm text-white/50">Site</p>
            <ul className="mt-3 space-y-2 text-sm">
              {publicNav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <p className="text-sm text-white/50">A person at the end</p>
            <p className="mt-3 font-medium">Amina Patel</p>
            <p className="mt-1 text-sm text-white/70">Platform contact · English and isiZulu</p>
            <Link to="/contact" className="mt-4 inline-block text-sm text-white underline-offset-4 hover:underline">
              Write to Amina
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
