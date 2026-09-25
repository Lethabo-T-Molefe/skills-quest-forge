import { Link } from "@tanstack/react-router";
import { Dateline } from "@/components/Dateline";
import { MediaFrame, quietButtonClass, signalButtonClass } from "@/components";
import { media } from "@/config/media";
import { getSession } from "@/features/auth";
import { PublicLayout } from "@/layouts/PublicLayout";

const steps = [
  { label: "01", title: "Bring data in", body: "Upload a file or connect a live source. Both are classified, profiled and scanned for personal information before anyone can use them.", image: media.raw },
  { label: "02", title: "Clean it in steps", body: "A guided wizard previews each operation on a sample. Accepted steps become a versioned recipe. Bronze data never changes.", image: media.cleaned },
  { label: "03", title: "Ask in English", body: "The assistant grounds itself in shared metrics and permitted data, then returns the result, the SQL and a plain-language explanation.", image: media.hero },
  { label: "04", title: "Share the answer", body: "Save a chart, watch a metric, or hand the same SQL to an expert. Every action is written to an immutable audit trail.", image: media.audit },
];

const capabilities = [
  { title: "Guided cleaning", body: "Fix types, missing values, duplicates and outliers one step at a time, with a before-and-after preview.", image: media.cleaned },
  { title: "Point-and-click explorer", body: "Filter, group and chart without code. The SQL is generated so an expert can take it further.", image: media.plot },
  { title: "Grounded assistant", body: "It answers against defined metrics. If it cannot ground a request, it refuses rather than guessing.", image: media.hero },
  { title: "Semantic layer", body: "Active learner is defined once. Dashboards, notebooks and the assistant all use the same figure.", image: media.hands },
  { title: "Explainable predictions", body: "A score in a fixed range, a ranked factor breakdown, and a reading of the top factors. Weights always sum to one.", image: media.plot },
  { title: "Metric monitoring", body: "When a number moves past its band, the platform explains why, with the contributing figures.", image: media.waiting },
];

export function LandingPage() {
  const session = getSession();

  return (
    <PublicLayout>
      <section className="mx-auto max-w-[1600px] px-5 pb-24 pt-16 md:px-10 md:pt-24">
        <Dateline />
        <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="display-xl max-w-[16ch]">
              <span className="hero-line block">Meet people</span>
              <span className="hero-line block pl-[8vw] md:pl-16">where they</span>
              <span className="hero-line block">are.</span>
            </h1>
            <p className="mt-8 max-w-[42ch] text-lg leading-relaxed text-muted-foreground">
              DataForge is a governed analytics platform that lets any member of an organisation do real data work,
              without installing anything and without needing SQL to get started.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={session ? "/workspace" : "/register"} className={signalButtonClass}>
                {session ? "Open workspace" : "Open a workspace"}
              </Link>
              <Link to="/product" className={quietButtonClass}>
                See how it works
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <MediaFrame {...media.hero} priority ratio="4 / 3" />
          </div>
        </div>
      </section>

      <section className="bg-surface-inverse text-background">
        <MediaFrame {...media.waiting} ratio="16 / 7" className="opacity-90" />
        <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
          <p className="label-paren text-white/50">(the problem)</p>
          <p className="mt-4 max-w-[22ch] font-display text-4xl font-light leading-[1.05] md:text-6xl">
            Routine questions pile up on the few people who can write a query.
          </p>
          <p className="mt-8 max-w-[62ch] text-sm leading-relaxed text-white/70">
            Everyone else waits, or works in a spreadsheet and gets the analysis wrong. Work done on personal machines
            breaks privacy rules and cannot be reconstructed later. DataForge closes that gap of skills, tooling and
            confidence, inside an auditable environment.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10">
        <p className="label-paren">(the path)</p>
        <h2 className="heading-1 mt-2 max-w-[20ch]">From a messy file to a shared answer.</h2>
        <ol className="mt-12 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
          {steps.map((step) => (
            <li key={step.label} className="grid bg-surface-raised sm:grid-cols-2">
              <MediaFrame {...step.image} ratio="1 / 1" />
              <div className="flex flex-col justify-end p-6">
                <p className="num text-sm text-muted-foreground">{step.label}</p>
                <h3 className="heading-2 mt-3">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-surface-alt px-5 py-24 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <p className="label-paren">(what it does)</p>
          <h2 className="heading-1 mt-2 max-w-[18ch]">The tools, not a course catalogue.</h2>
          <ul className="mt-12 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((item) => (
              <li key={item.title} className="bg-surface-raised">
                <MediaFrame {...item.image} ratio="16 / 10" />
                <div className="p-6">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/product" className={`${quietButtonClass} mt-12`}>
            Read the product
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label-paren">(trust)</p>
            <h2 className="heading-1 mt-2">Show the work. Govern everything.</h2>
            <MediaFrame {...media.sandbox} className="mt-8" />
          </div>
          <div className="max-w-[58ch] space-y-4 text-sm leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7">
            <p>
              <strong className="font-semibold text-foreground">No answer appears without the code</strong> and a
              plain-language explanation of what was done and why.
            </p>
            <p>
              <strong className="font-semibold text-foreground">The assistant refuses rather than guesses</strong> when a
              request does not map to a defined metric or to data you may see.
            </p>
            <p>
              <strong className="font-semibold text-foreground">All code runs in a sandbox</strong> with hard limits, so
              many people can work at once without reaching each other or the host.
            </p>
            <Link to="/security" className="inline-block text-signal-strong underline-offset-4 hover:underline">
              How DataForge protects data
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-5 py-20 md:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-8">
          <div>
            <p className="label-paren">(next)</p>
            <h2 className="heading-1 mt-2">Try the workspace.</h2>
            <p className="mt-3 max-w-[50ch] text-sm text-muted-foreground">
              The prototype runs on mock data. Sign in as Thandi, or create an account and walk the same path.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/sign-in" className={signalButtonClass}>
              Sign in
            </Link>
            <Link to="/who" className={quietButtonClass}>
              See who it is for
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
