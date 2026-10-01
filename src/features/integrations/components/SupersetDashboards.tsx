import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip, Notice, QuietButton } from "@/components";
import { useCurrentUser } from "@/features/auth";
import { errorMessage } from "@/lib/api";
import {
  SUPERSET_ROLES,
  integrationStatusQuery,
  supersetDashboardsQuery,
} from "../api/integrations";
import { OpenSupersetButton } from "./OpenButtons";
import { SupersetEmbed } from "./SupersetEmbed";

/**
 * Dashboards built in Superset on the same governed data. Each can be viewed here, embedded with a guest
 * token that carries the viewer's row policies, or opened in Superset to edit.
 */
export function SupersetDashboards() {
  const user = useCurrentUser();
  const status = useQuery(integrationStatusQuery());
  const allowed = SUPERSET_ROLES.includes(user.roleId);
  const enabled = Boolean(status.data?.superset.enabled) && allowed;
  const dashboards = useQuery({ ...supersetDashboardsQuery(), enabled });
  const [viewing, setViewing] = useState<number | null>(null);

  if (!enabled) return null;
  const open = dashboards.data?.find((item) => item.id === viewing);

  return (
    <section aria-labelledby="superset-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h2 id="superset-heading" className="font-display text-xl">
            Built in Superset
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            For richer dashboards, Superset reads the same approved tables and shared metrics. You
            are signed in with your DataForge role, and your row policies apply there too.
          </p>
        </div>
        <OpenSupersetButton label="Open Superset" />
      </div>

      <div className="mt-4">
        {!status.data?.superset.reachable ? (
          <Notice tone="warn" title="Superset is not running">
            {status.data?.superset.detail || "It could not be reached. Try again in a moment."}
          </Notice>
        ) : dashboards.isPending ? (
          <p className="text-sm text-muted-foreground">Loading Superset dashboards…</p>
        ) : dashboards.isError ? (
          <Notice tone="signal" title="The Superset dashboards did not load">
            {errorMessage(dashboards.error)}
          </Notice>
        ) : dashboards.data.length === 0 ? (
          <p className="border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            No dashboards have been built in Superset yet. Open Superset to make the first one from
            an approved dataset.
          </p>
        ) : (
          <ul className="divide-y divide-border border border-border bg-surface-raised">
            {dashboards.data.map((dashboard) => (
              <li
                key={dashboard.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{dashboard.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboard.owners.length > 0 ? `${dashboard.owners.join(", ")} · ` : ""}
                    changed {dashboard.changed}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone={dashboard.published ? "ok" : "neutral"}>
                    {dashboard.published ? "published" : "draft"}
                  </Chip>
                  <QuietButton
                    className="px-3 py-1.5 text-xs"
                    aria-expanded={viewing === dashboard.id}
                    onClick={() => setViewing(viewing === dashboard.id ? null : dashboard.id)}
                  >
                    {viewing === dashboard.id ? "Close" : "View here"}
                  </QuietButton>
                  <OpenSupersetButton
                    next={new URL(dashboard.url).pathname}
                    label="Edit in Superset"
                    className="px-3 py-1.5 text-xs"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open ? (
        <div className="mt-4">
          <SupersetEmbed dashboardId={open.id} title={open.title} />
        </div>
      ) : null}
    </section>
  );
}
