import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight, Banknote, ShieldCheck, GraduationCap, Building2, Award,
  Database, Sparkles,
} from "lucide-react";
import { RingArcs, RingCluster, RingDonutLight } from "@/components/lab/circle-decor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CHIETA Data Lab — Innovating for Impact" },
      { name: "description", content: "CHIETA: the Chemical Industries Education & Training Authority — and the Data Lab built to turn its skills data into intelligence." },
    ],
  }),
  component: Home,
});

const SERVICES = [
  { icon: Banknote, title: "Discretionary & Mandatory Grants", desc: "DG and MG funding for employers in the chemical industries sector to invest in workforce training." },
  { icon: ShieldCheck, title: "ETQA & Quality Assurance", desc: "Provider accreditation, workplace approval, assessor/moderator oversight and Recognition of Prior Learning." },
  { icon: GraduationCap, title: "Skills Programmes", desc: "Apprenticeships, learnerships and skills programmes that build a pipeline of qualified chemical-sector talent." },
  { icon: Award, title: "Industrial Futures Bursaries", desc: "The CHIETA Industrial Futures Bursary Programme supporting students into the sector." },
  { icon: Building2, title: "Smart Skills Centres", desc: "Training infrastructure placed close to industry, extending hands-on skills delivery across the provinces." },
];

const STATS = [
  { label: "Learners supported", value: "74,742" },
  { label: "SMMEs supported", value: "630" },
  { label: "Cooperatives supported", value: "211" },
  { label: "ETQA certificates issued", value: "3,720" },
];

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10 sw-gradient-bg" />
      <div className="fixed inset-x-0 top-0 h-1 bg-ink z-50" />

      <header className="fixed inset-x-0 top-6 z-40 flex justify-center px-4">
        <div className="sw-card flex items-center gap-3 px-4 py-2 bg-white">
          <img src="/chieta-logo.png" alt="CHIETA" className="h-8 w-auto" />
          <span className="h-5 w-px bg-ink/30" />
          <span className="font-display font-extrabold tracking-tight lowercase">data lab.</span>
        </div>
      </header>

      <main className="relative pt-32 pb-16 px-6 md:px-16 max-w-[1400px] mx-auto">
        <RingArcs className="hidden md:block absolute -top-10 right-0 w-72 md:w-96 -z-10 pointer-events-none" />

        {/* eyebrow */}
        <div className="flex items-center gap-3 mb-8">
          <span className="sw-pill-white !py-2 !px-3 !shadow-none border-ink">
            <span className="size-6 grid place-items-center rounded-full border border-ink">
              <ArrowUpRight className="size-3.5" />
            </span>
            <span className="text-sm">
              A statutory SETA under the Skills Development Act 97 of 1998.
            </span>
          </span>
        </div>

        {/* hero */}
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-10 items-end">
          <h1
            className="sw-display text-foreground"
            style={{ fontSize: "clamp(2.5rem, 1.8rem + 6vw, 7rem)", letterSpacing: "-0.05em" }}
          >
            INNOVATION LEADER IN
            <br />
            <span className="inline-block">
              <span className="word-highlight">EDUCATION</span>
            </span>{" "}
            & TRAINING.
          </h1>
          <p className="text-lg md:text-xl font-medium text-ink/80">
            The <strong>Chemical Industries Education &amp; Training Authority (CHIETA)</strong> is
            the SETA mandated to facilitate skills development across South Africa's chemical
            industries sector — grants, quality assurance, apprenticeships and bursaries that build
            sustainable livelihoods.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/signin" className="sw-pill !py-4 text-base">
            Sign in to the Data Lab
            <span className="size-7 grid place-items-center rounded-full bg-yellow border border-ink">
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
          <a
            href="https://chieta.org.za/"
            target="_blank"
            rel="noreferrer"
            className="sw-pill-white !py-4 text-base"
          >
            Visit chieta.org.za
          </a>
        </div>

        {/* impact stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="sw-card p-5 bg-white">
              <div className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                {s.value}
              </div>
              <div className="text-xs uppercase tracking-wider text-ink/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-ink/50 mt-2">
          FY2024/25 performance · clean audit outcome from the Auditor-General
        </div>

        {/* who we are */}
        <div className="relative mt-24 grid md:grid-cols-[1fr_1.4fr] gap-10">
          <RingCluster className="hidden lg:block absolute -bottom-24 -left-24 w-72 -z-10 pointer-events-none" />
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-ink/60">
              Who we are
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold uppercase tracking-tight mt-2 leading-[1.05]">
              Reimagining skills development with data & digital.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sw-card p-5 bg-mint">
              <div className="text-xs uppercase tracking-wider font-semibold">Vision — 2025</div>
              <p className="mt-2 text-sm font-medium">
                To be an innovation leader in education and training.
              </p>
            </div>
            <div className="sw-card p-5 bg-lavender">
              <div className="text-xs uppercase tracking-wider font-semibold">Mission</div>
              <p className="mt-2 text-sm font-medium">
                Reimagining skills development and training using the combined power of data and
                digital to provide innovative solutions for sustainable livelihoods.
              </p>
            </div>
            <div className="sw-card p-5 bg-peach">
              <div className="text-xs uppercase tracking-wider font-semibold">Purpose</div>
              <p className="mt-2 text-sm font-medium">To contribute to sustainable livelihoods.</p>
            </div>
          </div>
        </div>

        {/* what we do */}
        <div className="mt-24">
          <div className="text-xs uppercase tracking-wider font-semibold text-ink/60">
            What we do
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold uppercase tracking-tight mt-2">
            Five ways CHIETA serves the sector.
          </h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s) => (
              <div key={s.title} className="sw-card p-5 bg-white">
                <div className="size-9 rounded-full grid place-items-center bg-lime border border-ink">
                  <s.icon className="size-4" />
                </div>
                <div className="font-display font-extrabold uppercase tracking-tight mt-3">
                  {s.title}
                </div>
                <p className="text-sm text-ink/70 mt-1.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* data lab relevance */}
        <div className="relative mt-24 sw-card p-8 md:p-12 bg-ink text-background overflow-hidden">
          <RingDonutLight className="hidden sm:block absolute -top-12 -right-12 w-64 -z-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-primary">
            <Sparkles className="size-4" /> Why the Data Lab
          </div>
          <h2
            className="sw-display mt-3"
            style={{ fontSize: "clamp(2rem, 1.5rem + 4vw, 4.5rem)", letterSpacing: "-0.05em" }}
          >
            SKILLS DATA
            <br />
            BECOMES INTELLIGENCE.
          </h2>
          <div className="mt-6 grid md:grid-cols-[1.2fr_1fr] gap-10">
            <p className="text-base md:text-lg text-background/85 font-medium">
              CHIETA's own mission commits to "reimagining skills development and training using the
              combined power of data and digital." The{" "}
              <strong className="text-primary">Data Lab</strong> is how that commitment becomes
              real: a secure, browser-based environment where CHIETA's grants, learner, ETQA and
              Smart Skills Centre data are brought together, analysed, and turned into dashboards,
              predictions and decision support — built in direct support of CHIETA's broader
              strategic plan, with students working alongside the project team as co-developers
              rather than observers.
            </p>
            <ul className="space-y-2.5 text-sm font-medium">
              {[
                "Upload, govern and certify CHIETA datasets",
                "Query the warehouse from SQL Lab & notebooks",
                "Publish executive-ready dashboards per role",
                "Run ML predictions & what-if scenarios",
                "Track every student contribution end to end",
              ].map((l) => (
                <li key={l} className="flex items-start gap-2.5">
                  <Database className="size-4 mt-0.5 text-primary shrink-0" /> {l}
                </li>
              ))}
            </ul>
          </div>
          <Link to="/signin" className="sw-pill mt-8 !py-4 text-base">
            Sign in to the Data Lab
            <span className="size-7 grid place-items-center rounded-full bg-yellow border border-ink">
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </div>

        {/* footer bar */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-3">
          <a
            href="https://chieta.org.za/about-us/who-we-are/"
            target="_blank"
            rel="noreferrer"
            className="sw-pill !py-3 text-sm"
          >
            About CHIETA
            <span className="size-6 grid place-items-center rounded-full bg-white border border-ink">
              <ArrowUpRight className="size-3.5" />
            </span>
          </a>

          <div className="sw-pill-white !py-3 text-sm hidden md:inline-flex">
            <span>Grants</span>
            <span>·</span>
            <span>ETQA</span>
            <span>·</span>
            <span>Skills Programmes</span>
            <span>·</span>
            <span>Smart Skills Centres</span>
          </div>

          <Link to="/signin" className="sw-pill-white !py-3 text-sm">
            Sign in <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
