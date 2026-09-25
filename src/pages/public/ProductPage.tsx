import { Link } from "@tanstack/react-router";
import { MediaFrame, quietButtonClass, signalButtonClass } from "@/components";
import { media } from "@/config/media";
import { PublicLayout } from "@/layouts/PublicLayout";

const layers = [
  { name: "Bronze", body: "Raw, immutable data as it arrived. An upload or a connector read lands here and is never overwritten.", image: media.raw },
  { name: "Silver", body: "Cleaned, typed, masked and deduplicated. Produced by a versioned recipe you can rerun.", image: media.cleaned },
  { name: "Gold", body: "Analytics-ready data for dashboards, insights and predictions, governed by role and by row- and column-level security.", image: media.plates },
];

export function ProductPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="label-paren">(the product)</p>
            <h1 className="heading-1 mt-2 max-w-[18ch]">From no-code to code, on the same artefact.</h1>
            <p className="mt-6 max-w-[68ch] text-muted-foreground">
              DataForge pairs guided workflows with an AI assistant that carries out the technical steps and explains them.
              A member who cannot write a query still gets a real answer, and sees how it was produced.
            </p>
          </div>
          <div className="lg:col-span-6">
            <MediaFrame {...media.hands} />
          </div>
        </div>

        <section className="mt-20 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label-paren">(progressive disclosure)</p>
            <h2 className="heading-2 mt-2">The everyday path is also the expert path.</h2>
          </div>
          <div className="max-w-[60ch] space-y-4 text-sm leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7">
            <p>
              <strong className="font-semibold text-foreground">A chart built by point and click</strong> generates SQL
              behind the scene. Open it in the workbench, add a join, rerun it in the sandbox. No rework.
            </p>
            <p>
              <strong className="font-semibold text-foreground">An assistant answer</strong> always includes the exact
              code it ran. That is why an expert can take an everyday result further without starting again.
            </p>
            <p>
              <strong className="font-semibold text-foreground">A cleaning recipe</strong> is a first-class artefact.
              Share it, version it, or rerun it on a new upload of the same source.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <p className="label-paren">(medallion layers)</p>
          <h2 className="heading-2 mt-2">One warehouse, three layers.</h2>
          <MediaFrame {...media.plates} className="mt-8" ratio="16 / 8" />
          <ul className="mt-0 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
            {layers.map((layer) => (
              <li key={layer.name} className="bg-surface-raised">
                <MediaFrame {...layer.image} ratio="16 / 10" />
                <div className="p-6">
                  <h3 className="font-medium">{layer.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{layer.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
          <div className="bg-surface-raised">
            <MediaFrame {...media.sandbox} ratio="16 / 10" />
            <div className="p-6">
              <h2 className="heading-2">The assistant</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                It plans, retrieves grounding from the catalogue and the semantic layer, drafts SQL, validates it against
                your permissions, and runs it inside a sandbox. You get the result, the code and an explanation.
              </p>
            </div>
          </div>
          <div className="bg-surface-raised">
            <MediaFrame {...media.empty} ratio="16 / 10" />
            <div className="p-6">
              <h2 className="heading-2">What we left out</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                There is no course catalogue, no certificates, no multi-tenant hosting and no subscription billing in the
                first release. Understanding is built into the tools through in-context help.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-16 flex flex-wrap gap-3">
          <Link to="/register" className={signalButtonClass}>
            Open a workspace
          </Link>
          <Link to="/security" className={quietButtonClass}>
            Read the security model
          </Link>
        </div>
      </article>
    </PublicLayout>
  );
}
