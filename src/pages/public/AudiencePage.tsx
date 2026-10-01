import { Link } from "@tanstack/react-router";
import { MediaFrame, signalButtonClass } from "@/components";
import { media } from "@/config/media";
import { PublicLayout } from "@/layouts/PublicLayout";

const roles = [
  {
    name: "Everyday Analyst",
    body: "The primary user. Uploads or connects data, cleans it through the wizard, explores by point and click, and asks the assistant in plain English.",
  },
  {
    name: "Data Practitioner",
    body: "Works in code. Uses the SQL workbench and notebooks, opens any no-code action as editable code, and helps define shared metrics.",
  },
  {
    name: "Data Steward",
    body: "Approves datasets, sets classification, manages connectors, curates the semantic layer, and oversees masking and quality.",
  },
  {
    name: "Executive and Viewer",
    body: "A read-only consumer of dashboards and insights. Sees governed results without the ability to change data.",
  },
  {
    name: "Administrator",
    body: "Manages users, roles, quotas and platform operation for the one organisation that runs the instance.",
  },
  {
    name: "Auditor",
    body: "Inspects the audit log and lineage. Cannot alter anything.",
  },
  {
    name: "Model Curator",
    body: "Registers, versions and monitors predictive models, and reviews drift and fairness before a model is promoted.",
  },
];

export function AudiencePage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="label-paren">(who it is for)</p>
            <h1 className="heading-1 mt-2 max-w-[18ch]">One organisation, many skill levels.</h1>
            <p className="mt-6 max-w-[68ch] text-muted-foreground">
              DataForge serves the members of a single organisation. There is no tenant separation
              and no hosting of external organisations. Access is granted by role. Each role carries
              permissions and fair-use quotas.
            </p>
          </div>
          <div className="lg:col-span-6">
            <MediaFrame {...media.hands} />
          </div>
        </div>

        <ul className="mt-16 divide-y divide-border border-y border-border">
          {roles.map((role) => (
            <li key={role.name} className="grid gap-3 py-6 md:grid-cols-12">
              <h2 className="font-medium md:col-span-4">{role.name}</h2>
              <p className="max-w-[58ch] text-sm leading-relaxed text-muted-foreground md:col-span-8">
                {role.body}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-12 max-w-[60ch] text-sm text-muted-foreground">
          The platform is sized for a few thousand registered members and about five hundred
          concurrent users, as a single-region deployment.
        </p>
        <Link to="/register" className={`${signalButtonClass} mt-8`}>
          Create an account
        </Link>
      </article>
    </PublicLayout>
  );
}
