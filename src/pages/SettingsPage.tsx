import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, Notice, Panel, QuietButton } from "@/components";
import {
  SecuritySettings,
  createSlackLinkCode,
  demoAvailable,
  resendVerification,
  roleLabels,
  signInDemo,
  useCurrentUser,
  type RoleId,
} from "@/features/auth";
import {
  OpenJupyterButton,
  OpenSupersetButton,
  integrationStatusQuery,
} from "@/features/integrations";
import { MainLayout } from "@/layouts/MainLayout";
import { notifyError } from "@/lib/notify";

const roles = Object.entries(roleLabels) as [RoleId, string][];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right break-words">{children}</dd>
    </div>
  );
}

/** How much of a monthly allowance is used, as a bar and in words. */
function Quota({
  label,
  text,
  used,
  limit,
}: {
  label: string;
  text: string;
  used: number | undefined;
  limit: number | null | undefined;
}) {
  const share = limit && used !== undefined ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <li>
      <div className="flex flex-wrap justify-between gap-x-4">
        <span className="text-muted-foreground">{label}</span>
        <span className="num">{text}</span>
      </div>
      {limit ? (
        <div className="mt-1.5 h-1 bg-surface-alt" aria-hidden>
          <div
            className={share >= 90 ? "h-1 bg-signal-strong" : "h-1 bg-surface-inverse"}
            style={{ width: `${share}%` }}
          />
        </div>
      ) : null}
    </li>
  );
}

export function SettingsPage() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const demo = useQuery({
    queryKey: ["auth", "demo"],
    queryFn: demoAvailable,
    staleTime: Infinity,
  });
  const integrations = useQuery(integrationStatusQuery());

  const resend = useMutation({
    mutationFn: () => resendVerification(user.email),
    onSuccess: () => toast.success("A new verification link is on its way."),
    onError: notifyError("The link could not be sent."),
  });

  const slack = useMutation({
    mutationFn: createSlackLinkCode,
    onError: notifyError("A Slack code could not be made."),
  });

  const switchRole = useMutation({
    mutationFn: (role: RoleId) => signInDemo(role),
    onSuccess: async (member) => {
      // A different member is signed in now, so nothing cached for the last one may be shown.
      queryClient.clear();
      await navigate({ to: "/workspace" });
      toast.success(`Now signed in as ${member.name}`, { description: member.role });
    },
    onError: notifyError("The demo member could not be signed in."),
  });

  const anyIntegration = integrations.data?.superset.enabled || integrations.data?.jupyter.enabled;

  return (
    <MainLayout
      title="Settings"
      description="Your identity, sign-in security, fair-use quotas and the tools connected to your account."
    >
      {!user.verified ? (
        <Notice
          className="mb-6"
          tone="warn"
          title="Your email is not verified yet"
          action={
            <QuietButton disabled={resend.isPending} onClick={() => resend.mutate()}>
              {resend.isPending ? "Sending…" : "Send the link again"}
            </QuietButton>
          }
        >
          Open the link we sent to {user.email}. Uploading and analysis unlock once it is verified.
        </Notice>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="heading-2">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Name">{user.name}</Row>
            <Row label="Email">{user.email}</Row>
            <Row label="Role">{user.role}</Row>
            <Row label="Team">{user.team ?? "None"}</Row>
            <Row label="Workspace">{user.workspace}</Row>
            <Row label="Email verified">{user.verified ? "Yes" : "No"}</Row>
            <Row label="Multi-factor">{user.mfaEnabled ? "On" : "Off"}</Row>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            An administrator changes your role and team. Every change is written to the audit trail.
          </p>
        </Panel>

        <Panel>
          <h2 className="heading-2">Quotas this month</h2>
          <ul className="mt-4 space-y-4 text-sm">
            <Quota
              label="Sandbox compute"
              text={user.quotas.compute}
              used={user.quotas.used?.computeSeconds}
              limit={user.quotas.limits?.computeSeconds}
            />
            <Quota
              label="Storage"
              text={user.quotas.storage}
              used={user.quotas.used?.storageBytes}
              limit={user.quotas.limits?.storageBytes}
            />
            <Quota
              label="Assistant questions"
              text={user.quotas.ai}
              used={user.quotas.used?.aiQueries}
              limit={user.quotas.limits?.aiQueries}
            />
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Compute and assistant questions reset on the first of each month. Storage counts the
            datasets you own.
          </p>
        </Panel>
      </div>

      <div className="mt-6">
        <SecuritySettings />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        {anyIntegration ? (
          <Panel>
            <h2 className="heading-2">Analysis tools</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Superset and Jupyter open already signed in as you, with your DataForge role. They
              read approved data only, and your row policies apply there too.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <OpenSupersetButton label="Open Superset" />
              <OpenJupyterButton label="Open Jupyter" />
            </div>
            {integrations.data?.superset.enabled && !integrations.data.superset.reachable ? (
              <p className="mt-3 text-xs text-warning">Superset is not running at the moment.</p>
            ) : null}
            {integrations.data?.jupyter.enabled && !integrations.data.jupyter.reachable ? (
              <p className="mt-3 text-xs text-warning">Jupyter is not running at the moment.</p>
            ) : null}
          </Panel>
        ) : null}

        <Panel>
          <h2 className="heading-2">Slack</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Link your Slack account to ask questions from Slack. Answers there use your role,
            exactly as they do here.
          </p>
          {slack.data ? (
            <div className="mt-4 space-y-2" aria-live="polite">
              <p className="text-sm">{slack.data.instruction}</p>
              <p className="num w-fit bg-surface-inverse px-4 py-2 font-mono text-lg tracking-widest text-background">
                {slack.data.code}
              </p>
              <p className="text-xs text-muted-foreground">
                The code works once and expires in {slack.data.expiresInMinutes} minutes.
              </p>
            </div>
          ) : (
            <QuietButton className="mt-4" disabled={slack.isPending} onClick={() => slack.mutate()}>
              {slack.isPending ? "Making a code…" : "Get a link code"}
            </QuietButton>
          )}
        </Panel>
      </div>

      {demo.data ? (
        <Panel className="mt-6">
          <h2 id="demo-role" className="heading-2">
            Demo: sign in as another member
          </h2>
          <p className="mt-2 max-w-[68ch] text-sm text-muted-foreground">
            This workspace is running in demo mode. Each button signs you in as the seeded member
            with that role, so you can see how the screens and the data change. It is switched off
            in production, where an administrator assigns roles.
          </p>
          {/* A labelled group, not a <label>: a label would attach itself to the first button only. */}
          <div role="group" aria-labelledby="demo-role" className="mt-3 flex flex-wrap gap-2">
            {roles.map(([id, label]) => (
              <QuietButton
                key={id}
                aria-pressed={user.roleId === id}
                active={user.roleId === id}
                disabled={switchRole.isPending}
                onClick={() => {
                  if (user.roleId !== id) switchRole.mutate(id);
                }}
              >
                {label}
              </QuietButton>
            ))}
          </div>
          <div className="mt-4">
            <Chip>
              Signed in as {user.name} · {user.role}
            </Chip>
          </div>
        </Panel>
      ) : null}
    </MainLayout>
  );
}
