import { Link } from "@tanstack/react-router";
import { MediaFrame, signalButtonClass } from "@/components";
import { media } from "@/config/media";
import { PublicLayout } from "@/layouts/PublicLayout";

const safeguards = [
  {
    title: "Classification is mandatory",
    body: "Every dataset is restricted-personal, internal-confidential or internal-general. Classification drives how the data may be used.",
  },
  {
    title: "Personal information is masked",
    body: "Incoming data is scanned for known patterns. Matching columns are masked before promotion beyond the raw layer.",
  },
  {
    title: "Approval before use",
    body: "Until a Steward approves a dataset, it is not queryable in silver or gold. The decision, the member and the reason are recorded.",
  },
  {
    title: "Least-privilege execution",
    body: "Generated and member code runs in an ephemeral sandbox with CPU, memory, time and network caps. No sandbox can reach the host or another workspace.",
  },
  {
    title: "An immutable audit trail",
    body: "Sign-in, upload, cleaning, queries, AI actions, predictions, exports, sharing and role changes are tagged with the member and the resource. No role can alter an entry.",
  },
  {
    title: "Grounded, or refused",
    body: "The assistant answers against defined metrics and permitted data. Ungroundable requests return a clear refusal, not a guessed number.",
  },
];

export function SecurityPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="label-paren">(security and governance)</p>
            <h1 className="heading-1 mt-2 max-w-[16ch]">Built to be accountable.</h1>
            <p className="mt-6 max-w-[68ch] text-muted-foreground">
              Access is controlled by role. Personal information is masked. Every meaningful action is recorded. The design
              aligns with POPIA: accountability, processing limitation, purpose specification, security safeguards and
              information quality.
            </p>
          </div>
          <div className="lg:col-span-6">
            <MediaFrame {...media.masked} />
          </div>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
          <MediaFrame {...media.sandbox} ratio="16 / 10" />
          <MediaFrame {...media.audit} ratio="16 / 10" />
        </div>

        <ul className="mt-16 grid gap-10 md:grid-cols-2">
          {safeguards.map((item) => (
            <li key={item.title} className="border-l-2 border-signal pl-5">
              <h2 className="font-medium">{item.title}</h2>
              <p className="mt-2 max-w-[50ch] text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>

        <section className="mt-20 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label-paren">(POPIA)</p>
            <h2 className="heading-2 mt-2">What alignment looks like in the product.</h2>
          </div>
          <dl className="space-y-5 text-sm lg:col-span-6 lg:col-start-7">
            <div>
              <dt className="font-medium">Accountability</dt>
              <dd className="mt-1 text-muted-foreground">The audit log reconstructs how any figure was produced.</dd>
            </div>
            <div>
              <dt className="font-medium">Processing limitation</dt>
              <dd className="mt-1 text-muted-foreground">Classification, approval and least-privilege roles.</dd>
            </div>
            <div>
              <dt className="font-medium">Purpose specification</dt>
              <dd className="mt-1 text-muted-foreground">The catalogue records the purpose and definition of each object.</dd>
            </div>
            <div>
              <dt className="font-medium">Information quality</dt>
              <dd className="mt-1 text-muted-foreground">Profiling, guided cleaning and anomaly detection before promotion.</dd>
            </div>
          </dl>
        </section>

        <div className="mt-16">
          <Link to="/contact" className={signalButtonClass}>
            Talk to us about a deployment
          </Link>
        </div>
      </article>
    </PublicLayout>
  );
}
