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
import { ApiError, onSessionEnd } from "@/lib/api";
import { isPublicPath } from "@/config/public";
import { pageTitle, siteConfig } from "@/config/site";
import {
  analysisCatalogueQuery,
  parseAnalyseSearch,
  parseAskSearch,
  parseBuildSearch,
  parseCodeSearch,
} from "@/features/analysis";
import {
  authPaths,
  currentUserQuery,
  emailLinkPaths,
  getSession,
  orgMembersQuery,
} from "@/features/auth";
import { RECENT_ACTIVITY_LIMIT, auditEventsQuery } from "@/features/audit";
import { cleaningCatalogueQuery, cleaningStudioQuery } from "@/features/cleaning";
import { connectorsQuery } from "@/features/connectors";
import { dashboardQuery, dashboardsQuery } from "@/features/dashboards";
import { datasetQuery, datasetsQuery } from "@/features/datasets";
import { metricDefinitionsQuery, metricSummariesQuery } from "@/features/metrics";
import { alertQuery, alertsQuery, monitorsQuery } from "@/features/monitors";
import { AdminPage } from "@/pages/AdminPage";
import { AlertDetailPage } from "@/pages/AlertDetailPage";
import { AuditPage } from "@/pages/AuditPage";
import { CleaningPage } from "@/pages/CleaningPage";
import { CleaningStudioPage } from "@/pages/CleaningStudioPage";
import { ConnectPage } from "@/pages/ConnectPage";
import { DashboardDetailPage } from "@/pages/DashboardDetailPage";
import { DashboardsPage } from "@/pages/DashboardsPage";
import { DatasetDetailPage } from "@/pages/DatasetDetailPage";
import { DatasetsPage } from "@/pages/DatasetsPage";
import { EmbedPage } from "@/pages/EmbedPage";
import { ErrorPage } from "@/pages/ErrorPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { GovernancePage } from "@/pages/GovernancePage";
import { MfaPage } from "@/pages/MfaPage";
import { MonitorsPage } from "@/pages/MonitorsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { PendingPage } from "@/pages/PendingPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { SearchPage } from "@/pages/SearchPage";
import { SemanticPage } from "@/pages/SemanticPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SignInPage } from "@/pages/SignInPage";
import { UploadPage } from "@/pages/UploadPage";
import { VerifyPage } from "@/pages/VerifyPage";
import { AnalysePage } from "@/pages/analyse/AnalysePage";
import { AskPage } from "@/pages/analyse/AskPage";
import { BuildPage } from "@/pages/analyse/BuildPage";
import { CodePage } from "@/pages/analyse/CodePage";
import { PredictPage } from "@/pages/analyse/PredictPage";
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

/** A loader asking for one thing by id: when the API has no such thing, show the not-found page. */
async function orNotFound<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) throw notFound();
    throw error;
  }
}

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: ({ location }) => {
    const session = getSession();
    if (!session && !isPublicPath(location.pathname)) {
      throw redirect({ to: "/sign-in" });
    }
    // Links from an email (verify, reset) can be opened while signed in, so they stay reachable.
    if (session && isAuthPath(location.pathname) && !emailLinkPaths.includes(location.pathname)) {
      throw redirect({ to: "/workspace" });
    }
  },
  loader: ({ context, location }) => {
    if (isPublicPath(location.pathname) || isAuthPath(location.pathname)) return;
    return context.queryClient.ensureQueryData(currentUserQuery());
  },
  head: () => ({
    meta: [
      ...pageMeta(siteConfig.name, siteConfig.description),
      { property: "og:type", content: "website" },
    ],
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
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : undefined,
  }),
  head: () => ({
    meta: pageMeta(pageTitle("Verify email"), "Verify your email before running analysis."),
  }),
  component: VerifyPage,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "forgot-password",
  head: () => ({
    meta: pageMeta(pageTitle("Reset your password"), "Get a link to choose a new password."),
  }),
  component: ForgotPasswordPage,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "reset-password",
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : undefined,
  }),
  head: () => ({
    meta: pageMeta(pageTitle("Choose a password"), "Set a new password for your account."),
  }),
  component: ResetPasswordPage,
});

const embedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "embed/$dashboardId",
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  head: () => ({
    meta: [
      ...pageMeta(pageTitle("Dashboard"), "A read-only DataForge dashboard."),
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EmbedPage,
});

const mfaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "mfa",
  head: () => ({
    meta: pageMeta(pageTitle("Second factor"), "Approve this sign-in with a second factor."),
  }),
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
    meta: pageMeta(
      pageTitle("Product"),
      "Guided cleaning, a grounded assistant, and a path from no-code to code.",
    ),
  }),
  component: ProductPage,
});

const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "security",
  head: () => ({
    meta: pageMeta(
      pageTitle("Security"),
      "Classification, masking, sandboxed execution and an immutable audit trail.",
    ),
  }),
  component: SecurityPage,
});

const audienceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "who",
  head: () => ({
    meta: pageMeta(
      pageTitle("Who it is for"),
      "Roles across one organisation, from everyday analysts to auditors.",
    ),
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

/* ------------------------------------------------------------------ home and data */

const overviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "workspace",
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(metricSummariesQuery()),
      queryClient.ensureQueryData(datasetsQuery()),
      queryClient.ensureQueryData(alertsQuery()),
      queryClient.ensureQueryData(auditEventsQuery({ limit: RECENT_ACTIVITY_LIMIT })),
      queryClient.ensureQueryData(dashboardsQuery()),
      queryClient.ensureQueryData(analysisCatalogueQuery()),
    ]),
  head: () => ({
    meta: pageMeta(
      pageTitle("Home"),
      "Your next steps: bring data in, clean it, analyse it and share the answer.",
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
      pageTitle("Datasets"),
      "Every dataset with its classification, approval status, quality and next step.",
    ),
  }),
  component: DatasetsPage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "datasets/upload",
  head: () => ({
    meta: pageMeta(pageTitle("Upload a file"), "Land a file in bronze, profiled and masked."),
  }),
  component: UploadPage,
});

const connectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "datasets/connect",
  loader: ({ context }) => context.queryClient.ensureQueryData(connectorsQuery()),
  head: () => ({
    meta: pageMeta(pageTitle("Connect a source"), "Add a governed read-only connector."),
  }),
  component: ConnectPage,
});

const datasetDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "datasets/$datasetId",
  loader: async ({ context, params }) => ({
    dataset: await orNotFound(context.queryClient.ensureQueryData(datasetQuery(params.datasetId))),
  }),
  head: ({ loaderData }) => ({
    meta: pageMeta(
      pageTitle(loaderData?.dataset.name ?? "Dataset"),
      loaderData?.dataset.description ?? "Dataset profile and quality report.",
    ),
  }),
  component: DatasetDetailPage,
});

/* ------------------------------------------------------------------ clean */

const cleaningStudioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "clean",
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(datasetsQuery()),
      context.queryClient.ensureQueryData(cleaningCatalogueQuery()),
    ]),
  head: () => ({
    meta: pageMeta(
      pageTitle("Clean"),
      "Choose a file to clean. Profile it, fix one family of problems at a time, and save a versioned silver recipe.",
    ),
  }),
  component: CleaningStudioPage,
});

const cleaningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "clean/$datasetId",
  // An insight links to the cleaning step it is about.
  validateSearch: (search: Record<string, unknown>): { step?: string } =>
    typeof search["step"] === "string" ? { step: search["step"] } : {},
  loader: async ({ context, params }) => {
    const [dataset] = await orNotFound(
      Promise.all([
        context.queryClient.ensureQueryData(datasetQuery(params.datasetId)),
        // The method previews are worked out on a sample, which takes a moment the first time.
        context.queryClient.ensureQueryData(cleaningStudioQuery(params.datasetId)),
      ]),
    );
    return { dataset };
  },
  head: ({ loaderData }) => ({
    meta: pageMeta(
      pageTitle(`Clean ${loaderData?.dataset.name ?? "data"}`),
      "Guided, step-by-step data cleaning.",
    ),
  }),
  component: CleaningPage,
});

/* ------------------------------------------------------------------ analyse */

const analyseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "analyse",
  validateSearch: parseAnalyseSearch,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(datasetsQuery()),
      context.queryClient.ensureQueryData(analysisCatalogueQuery()),
    ]),
  head: () => ({
    meta: pageMeta(
      pageTitle("Analyse"),
      "Choose the data, the kind of question and how you want to work.",
    ),
  }),
  component: AnalysePage,
});

const analyseAskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "analyse/ask",
  validateSearch: parseAskSearch,
  head: () => ({
    meta: pageMeta(pageTitle("Ask a question"), "Ask a grounded question in plain English."),
  }),
  component: AskPage,
});

const analyseBuildRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "analyse/build",
  validateSearch: parseBuildSearch,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(datasetsQuery()),
      context.queryClient.ensureQueryData(analysisCatalogueQuery()),
    ]),
  head: () => ({
    meta: pageMeta(
      pageTitle("Build a chart"),
      "Point-and-click analysis where you choose how the numbers are calculated.",
    ),
  }),
  component: BuildPage,
});

const analyseCodeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "analyse/code",
  validateSearch: parseCodeSearch,
  head: () => ({
    meta: pageMeta(pageTitle("Write SQL"), "SQL workbench and sandboxed notebooks."),
  }),
  component: CodePage,
});

const analysePredictRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "analyse/predict",
  validateSearch: parseAnalyseSearch,
  head: () => ({ meta: pageMeta(pageTitle("Predict"), "Guided, explainable scores.") }),
  component: PredictPage,
});

/* ------------------------------------------------------------------ share and watch */

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
  loader: async ({ context, params }) => ({
    dashboard: await orNotFound(
      context.queryClient.ensureQueryData(dashboardQuery(params.dashboardId)),
    ),
  }),
  head: ({ loaderData }) => ({
    meta: pageMeta(
      pageTitle(loaderData?.dashboard.name ?? "Dashboard"),
      loaderData?.dashboard.description ?? "",
    ),
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
      // The form for a new monitor chooses from the datasets that can be analysed.
      context.queryClient.ensureQueryData(analysisCatalogueQuery()),
    ]),
  head: () => ({ meta: pageMeta(pageTitle("Monitors"), "Track metrics and explain alerts.") }),
  component: MonitorsPage,
});

const alertDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "monitors/$alertId",
  loader: async ({ context, params }) => ({
    alert: await orNotFound(context.queryClient.ensureQueryData(alertQuery(params.alertId))),
  }),
  head: ({ loaderData }) => ({
    meta: pageMeta(pageTitle(loaderData?.alert.metric ?? "Alert"), loaderData?.alert.message ?? ""),
  }),
  component: AlertDetailPage,
});

/* ------------------------------------------------------------------ governance and account */

const semanticRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "semantic",
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(metricDefinitionsQuery()),
      // Defining a metric chooses from the columns of approved datasets.
      context.queryClient.ensureQueryData(datasetsQuery()),
    ]),
  head: () => ({ meta: pageMeta(pageTitle("Metrics"), "Shared metric definitions.") }),
  component: SemanticPage,
});

const governanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "governance",
  loader: ({ context }) => context.queryClient.ensureQueryData(datasetsQuery()),
  head: () => ({
    meta: pageMeta(pageTitle("Approvals"), "Steward approval and classification queue."),
  }),
  component: GovernancePage,
});

const auditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "audit",
  head: () => ({
    meta: pageMeta(pageTitle("Audit trail"), "Immutable record of who did what, and when."),
  }),
  component: AuditPage,
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
  head: () => ({ meta: pageMeta(pageTitle("Search"), "Search the catalogue.") }),
  component: SearchPage,
});

/* ------------------------------------------------------------------ old addresses */

// Earlier versions used these paths. They redirect so bookmarks and shared links keep working.
const legacyCleaningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "datasets/$datasetId/clean",
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/clean/$datasetId",
      params: { datasetId: params.datasetId },
      replace: true,
    });
  },
});

const legacyAssistantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "assistant",
  beforeLoad: () => {
    throw redirect({ to: "/analyse/ask", replace: true });
  },
});

const legacyExplorerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "explorer",
  validateSearch: parseBuildSearch,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/analyse/build", search, replace: true });
  },
});

const legacyWorkbenchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "workbench",
  validateSearch: parseCodeSearch,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/analyse/code", search, replace: true });
  },
});

const legacyPredictRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "predict",
  beforeLoad: () => {
    throw redirect({ to: "/analyse/predict", replace: true });
  },
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
  forgotPasswordRoute,
  resetPasswordRoute,
  embedRoute,
  mfaRoute,
  overviewRoute,
  datasetsRoute,
  uploadRoute,
  connectRoute,
  datasetDetailRoute,
  cleaningStudioRoute,
  cleaningRoute,
  analyseRoute,
  analyseAskRoute,
  analyseBuildRoute,
  analyseCodeRoute,
  analysePredictRoute,
  dashboardsRoute,
  dashboardDetailRoute,
  monitorsRoute,
  alertDetailRoute,
  semanticRoute,
  governanceRoute,
  auditRoute,
  adminRoute,
  settingsRoute,
  searchRoute,
  legacyCleaningRoute,
  legacyAssistantRoute,
  legacyExplorerRoute,
  legacyWorkbenchRoute,
  legacyPredictRoute,
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      // A refused or missing resource will not change by asking again; a dropped connection might.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
        failureCount < 2,
    },
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  // Shown when a page's data takes more than a moment, so a slow request never looks like a dead click.
  defaultPendingComponent: PendingPage,
  defaultPendingMs: 400,
});

// When the API ends the session (sign-out elsewhere, an expired or replayed refresh token), start again.
onSessionEnd(() => {
  queryClient.clear();
  if (!isPublicPath(router.state.location.pathname)) void router.navigate({ to: "/sign-in" });
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
