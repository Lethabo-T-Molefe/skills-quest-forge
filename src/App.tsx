import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  notFound,
} from "@tanstack/react-router";
import { pageTitle, siteConfig } from "@/config/site";
import { currentUserQuery } from "@/features/auth";
import { auditEventsQuery } from "@/features/audit";
import { datasetQuery, datasetsQuery } from "@/features/datasets";
import { metricSummariesQuery } from "@/features/metrics";
import { alertsQuery } from "@/features/monitors";
import { DatasetDetailPage } from "@/pages/DatasetDetailPage";
import { DatasetsPage } from "@/pages/DatasetsPage";
import { ErrorPage } from "@/pages/ErrorPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OverviewPage } from "@/pages/OverviewPage";

/** Builds the title/description/og tags every page shares. */
function pageMeta(title: string, description: string) {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // The layout needs the signed-in user on every page, so load it before any route renders.
  loader: ({ context }) => context.queryClient.ensureQueryData(currentUserQuery()),
  head: () => ({
    meta: [...pageMeta(siteConfig.name, siteConfig.description), { property: "og:type", content: "website" }],
  }),
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

const overviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(metricSummariesQuery()),
      queryClient.ensureQueryData(datasetsQuery()),
      queryClient.ensureQueryData(alertsQuery()),
      queryClient.ensureQueryData(auditEventsQuery()),
    ]),
  head: () => ({
    meta: pageMeta(
      pageTitle("Workspace overview"),
      "DataForge is a governed analytics workspace: upload data, clean it step by step, ask questions in plain English and share the answer.",
    ),
  }),
  component: OverviewPage,
});

const datasetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "datasets",
  loader: ({ context }) => context.queryClient.ensureQueryData(datasetsQuery()),
  head: () => ({
    meta: pageMeta(
      pageTitle("Dataset catalogue"),
      "Browse governed datasets with their classification, approval status and quality profile.",
    ),
  }),
  component: DatasetsPage,
});

const datasetDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "datasets/$datasetId",
  loader: async ({ context, params }) => {
    const dataset = await context.queryClient.ensureQueryData(datasetQuery(params.datasetId));
    if (!dataset) throw notFound();
    return { dataset };
  },
  head: ({ loaderData }) => ({
    meta: pageMeta(
      pageTitle(loaderData?.dataset.name ?? "Dataset"),
      loaderData?.dataset.description ?? "Dataset profile and quality report.",
    ),
  }),
  component: DatasetDetailPage,
});

const routeTree = rootRoute.addChildren([overviewRoute, datasetsRoute, datasetDetailRoute]);

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
