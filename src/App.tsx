import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  notFound,
  redirect,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { isPublicPath } from "@/config/public";
import { pageTitle, siteConfig } from "@/config/site";
import { authPaths, currentUserQuery, getSession, orgMembersQuery } from "@/features/auth";
import { auditEventsQuery } from "@/features/audit";
import { assistantExamplesQuery } from "@/features/assistant";
import { cleaningProfileQuery, cleaningStepsQuery } from "@/features/cleaning";
import { connectorsQuery } from "@/features/connectors";
import { dashboardQuery, dashboardsQuery } from "@/features/dashboards";
import { datasetQuery, datasetsQuery } from "@/features/datasets";
import { metricDefinitionsQuery, metricSummariesQuery } from "@/features/metrics";
import { alertQuery, alertsQuery, monitorsQuery, predictionQuery } from "@/features/monitors";
import { notebooksQuery } from "@/features/workbench";
import { AdminPage } from "@/pages/AdminPage";
import { AlertDetailPage } from "@/pages/AlertDetailPage";
import { AssistantPage } from "@/pages/AssistantPage";
import { AuditPage } from "@/pages/AuditPage";
import { CleaningPage } from "@/pages/CleaningPage";
import { CleaningStudioPage } from "@/pages/CleaningStudioPage";
import { ConnectPage } from "@/pages/ConnectPage";
import { DashboardDetailPage } from "@/pages/DashboardDetailPage";
import { DashboardsPage } from "@/pages/DashboardsPage";
import { DatasetDetailPage } from "@/pages/DatasetDetailPage";
import { DatasetsPage } from "@/pages/DatasetsPage";
import { ErrorPage } from "@/pages/ErrorPage";
import { ExplorerPage } from "@/pages/ExplorerPage";
import { GovernancePage } from "@/pages/GovernancePage";
import { MfaPage } from "@/pages/MfaPage";
import { MonitorsPage } from "@/pages/MonitorsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { PredictPage } from "@/pages/PredictPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { SearchPage } from "@/pages/SearchPage";
import { SemanticPage } from "@/pages/SemanticPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SignInPage } from "@/pages/SignInPage";
import { UploadPage } from "@/pages/UploadPage";
import { VerifyPage } from "@/pages/VerifyPage";
import { WorkbenchPage } from "@/pages/WorkbenchPage";
import { AudiencePage } from "@/pages/public/AudiencePage";
import { ContactPage } from "@/pages/public/ContactPage";
import { LandingPage } from "@/pages/public/LandingPage";
import { ProductPage } from "@/pages/public/ProductPage";
import { SecurityPage } from "@/pages/public/SecurityPage";

function pageMeta(title: string, description: string) {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}

function isAuthPath(pathname: string) {
  return (authPaths as readonly string[]).includes(pathname);
}

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: ({ location }) => {
    const session = getSession();
    if (!session && !isPublicPath(location.pathname)) {
      throw redirect({ to: "/sign-in" });
    }
    if (session && isAuthPath(location.pathname)) {
      throw redirect({ to: "/workspace" });
    }
  },
  loader: ({ context, location }) => {
    if (isPublicPath(location.pathname)) return;
    return context.queryClient.ensureQueryData(currentUserQuery());
  },
  head: () => ({
    meta: [...pageMeta(siteConfig.name, siteConfig.description), { property: "og:type", content: "website" }],
  }),
  component: () => (
    <>
      <HeadContent />
      <Outlet />
      <Toaster />
    </>
  ),
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "sign-in",
  head: () => ({ meta: pageMeta(pageTitle("Sign in"), "Sign in to your DataForge workspace.") }),
  component: SignInPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "register",
  head: () => ({ meta: pageMeta(pageTitle("Register"), "Create a DataForge account.") }),
  component: RegisterPage,
});

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "verify",
  head: () => ({ meta: pageMeta(pageTitle("Verify email"), "Verify your email before running analysis.") }),
  component: VerifyPage,
});

const mfaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "mfa",
  head: () => ({ meta: pageMeta(pageTitle("Second factor"), "Approve this sign-in with a second factor.") }),
  component: MfaPage,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  head: () => ({
    meta: pageMeta(
      siteConfig.name,
      "DataForge is a governed analytics platform that lets any member of an organisation do real data work.",
    ),
  }),
  component: LandingPage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "product",
  head: () => ({
    meta: pageMeta(pageTitle("Product"), "Guided cleaning, a grounded assistant, and a path from no-code to code."),
  }),
  component: ProductPage,
});

const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "security",
  head: () => ({
    meta: pageMeta(pageTitle("Security"), "Classification, masking, sandboxed execution and an immutable audit trail."),
  }),
  component: SecurityPage,
});

const audienceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "who",
  head: () => ({
    meta: pageMeta(pageTitle("Who it is for"), "Roles across one organisation, from everyday analysts to auditors."),
  }),
  component: AudiencePage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "contact",
  head: () => ({
    meta: pageMeta(pageTitle("Contact"), "Write to Amina Patel, platform contact."),
  }),
  component: ContactPage,
});

const overviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "workspace",
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

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "datasets/upload",
  head: () => ({ meta: pageMeta(pageTitle("Upload a file"), "Land a file in bronze, profiled and masked.") }),
  component: UploadPage,
});

const connectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "datasets/connect",
  loader: ({ context }) => context.queryClient.ensureQueryData(connectorsQuery()),
  head: () => ({ meta: pageMeta(pageTitle("Connect a source"), "Add a governed read-only connector.") }),
  component: ConnectPage,
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

const cleaningStudioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "clean",
  loader: ({ context }) => context.queryClient.ensureQueryData(datasetsQuery()),
  head: () => ({
    meta: pageMeta(
      pageTitle("Clean data"),
      "Guided cleaning studio. Profile a file, work one family of problems at a time, and save a versioned silver recipe.",
    ),
  }),
  component: CleaningStudioPage,
});

const cleaningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "datasets/$datasetId/clean",
  loader: async ({ context, params }) => {
    const [dataset] = await Promise.all([
      context.queryClient.ensureQueryData(datasetQuery(params.datasetId)),
      context.queryClient.ensureQueryData(cleaningStepsQuery()),
      context.queryClient.ensureQueryData(cleaningProfileQuery()),
    ]);
    if (!dataset) throw notFound();
    return { dataset };
  },
  head: () => ({ meta: pageMeta(pageTitle("Cleaning wizard"), "Guided step-by-step data cleaning.") }),
  component: CleaningPage,
});

const assistantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "assistant",
  loader: ({ context }) => context.queryClient.ensureQueryData(assistantExamplesQuery()),
  head: () => ({
    meta: pageMeta(pageTitle("Assistant"), "Ask a grounded question in plain English."),
  }),
  component: AssistantPage,
});

const explorerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "explorer",
  validateSearch: (search: Record<string, unknown>) =>
    typeof search["dataset"] === "string" ? { dataset: search["dataset"] } : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(datasetsQuery()),
  head: () => ({ meta: pageMeta(pageTitle("Explorer"), "Point-and-click charts with generated SQL.") }),
  component: ExplorerPage,
});

const dashboardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "dashboards",
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardsQuery()),
  head: () => ({ meta: pageMeta(pageTitle("Dashboards"), "Saved charts and governed metrics.") }),
  component: DashboardsPage,
});

const dashboardDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "dashboards/$dashboardId",
  loader: async ({ context, params }) => {
    const dashboard = await context.queryClient.ensureQueryData(dashboardQuery(params.dashboardId));
    if (!dashboard) throw notFound();
    return { dashboard };
  },
  head: ({ loaderData }) => ({
    meta: pageMeta(pageTitle(loaderData?.dashboard.name ?? "Dashboard"), loaderData?.dashboard.description ?? ""),
  }),
  component: DashboardDetailPage,
});

const monitorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "monitors",
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(monitorsQuery()),
      context.queryClient.ensureQueryData(alertsQuery()),
    ]),
  head: () => ({ meta: pageMeta(pageTitle("Monitors"), "Track metrics and explain alerts.") }),
  component: MonitorsPage,
});

const alertDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "monitors/$alertId",
  loader: async ({ context, params }) => {
    const alert = await context.queryClient.ensureQueryData(alertQuery(params.alertId));
    if (!alert) throw notFound();
    return { alert };
  },
  head: ({ loaderData }) => ({
    meta: pageMeta(pageTitle(loaderData?.alert.metric ?? "Alert"), loaderData?.alert.message ?? ""),
  }),
  component: AlertDetailPage,
});

const semanticRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "semantic",
  loader: ({ context }) => context.queryClient.ensureQueryData(metricDefinitionsQuery()),
  head: () => ({ meta: pageMeta(pageTitle("Semantic layer"), "Shared metric definitions.") }),
  component: SemanticPage,
});

const auditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "audit",
  loader: ({ context }) => context.queryClient.ensureQueryData(auditEventsQuery()),
  head: () => ({ meta: pageMeta(pageTitle("Audit trail"), "Immutable record of who did what, and when.") }),
  component: AuditPage,
});

const workbenchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "workbench",
  validateSearch: (search: Record<string, unknown>) =>
    typeof search["sql"] === "string" ? { sql: search["sql"] } : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(notebooksQuery()),
  head: () => ({ meta: pageMeta(pageTitle("Workbench"), "SQL workbench and sandboxed notebooks.") }),
  component: WorkbenchPage,
});

const predictRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "predict",
  loader: ({ context }) => context.queryClient.ensureQueryData(predictionQuery()),
  head: () => ({ meta: pageMeta(pageTitle("Predict"), "Guided, explainable scores.") }),
  component: PredictPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "admin",
  loader: ({ context }) => context.queryClient.ensureQueryData(orgMembersQuery()),
  head: () => ({ meta: pageMeta(pageTitle("Users and roles"), "Members, roles and quotas.") }),
  component: AdminPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "settings",
  head: () => ({ meta: pageMeta(pageTitle("Settings"), "Account, role and quotas.") }),
  component: SettingsPage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "search",
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(datasetsQuery()),
      context.queryClient.ensureQueryData(dashboardsQuery()),
    ]),
  head: () => ({ meta: pageMeta(pageTitle("Search"), "Search the catalogue.") }),
  component: SearchPage,
});

const governanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "governance",
  loader: ({ context }) => context.queryClient.ensureQueryData(datasetsQuery()),
  head: () => ({ meta: pageMeta(pageTitle("Approvals"), "Steward approval and classification queue.") }),
  component: GovernancePage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  productRoute,
  securityRoute,
  audienceRoute,
  contactRoute,
  signInRoute,
  registerRoute,
  verifyRoute,
  mfaRoute,
  overviewRoute,
  datasetsRoute,
  uploadRoute,
  connectRoute,
  datasetDetailRoute,
  cleaningStudioRoute,
  cleaningRoute,
  assistantRoute,
  explorerRoute,
  dashboardsRoute,
  dashboardDetailRoute,
  monitorsRoute,
  alertDetailRoute,
  semanticRoute,
  auditRoute,
  workbenchRoute,
  predictRoute,
  adminRoute,
  settingsRoute,
  searchRoute,
  governanceRoute,
]);

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
