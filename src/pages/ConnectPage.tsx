import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BackLink, Field, HelpTip, Notice, Segmented, SignalButton, TextInput } from "@/components";
import { hasPermission, useCurrentUser } from "@/features/auth";
import {
  ConnectorCard,
  refreshConnectors,
  requestConnector,
  useConnectors,
  type ConnectorKind,
} from "@/features/connectors";
import { MainLayout } from "@/layouts/MainLayout";
import { notifyError } from "@/lib/notify";

const kinds: { value: ConnectorKind; label: string }[] = [
  { value: "postgres", label: "Relational database" },
  { value: "warehouse", label: "Cloud warehouse" },
  { value: "spreadsheet", label: "Spreadsheet file" },
];

const emptyForm = {
  name: "",
  host: "",
  port: "5432",
  database: "",
  schema: "public",
  user: "",
  password: "",
};

export function ConnectPage() {
  const connectors = useConnectors();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<ConnectorKind>("postgres");
  const [form, setForm] = useState(emptyForm);
  const steward = hasPermission(user, "manage_connectors");
  const mayRequest = steward || hasPermission(user, "request_connectors");
  const set = (field: keyof typeof emptyForm) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const request = useMutation({
    mutationFn: () =>
      requestConnector(
        kind === "spreadsheet"
          ? { name: form.name.trim(), kind }
          : {
              name: form.name.trim(),
              kind,
              host: form.host.trim(),
              port: Number(form.port) || 5432,
              database: form.database.trim(),
              schema: form.schema.trim() || "public",
              user: form.user.trim(),
              password: form.password,
            },
      ),
    onSuccess: async (connector) => {
      await refreshConnectors(queryClient);
      setForm(emptyForm);
      if (connector.status === "connected") {
        toast.success(`${connector.name} is connected`, {
          description: "Browse its tables and import the ones you need.",
        });
      } else if (connector.status === "error") {
        toast.error(`${connector.name} was saved but could not connect`, {
          description: connector.lastError ?? undefined,
        });
      } else {
        toast.success("Connection requested", {
          description:
            connector.kind === "spreadsheet"
              ? "Upload the workbook to it, then a steward approves it."
              : "A steward tests and approves it before its tables can be imported.",
        });
      }
    },
    onError: notifyError("The connection could not be requested."),
  });

  return (
    <MainLayout
      back={<BackLink to="/datasets">All datasets</BackLink>}
      title="Connect a source"
      description="A read-only connection to a live source. Its tables are imported as datasets, classified and masked like an upload, and wait for a steward's approval."
    >
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="panel p-5" aria-labelledby="new-connection">
          <h2 id="new-connection" className="font-display text-xl">
            New connection
          </h2>
          {!mayRequest ? (
            <Notice className="mt-4" tone="warn" title="Your role cannot connect sources">
              Analysts, practitioners and stewards can ask for a connection.
            </Notice>
          ) : (
            <form
              className="mt-4 space-y-4"
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                request.mutate();
              }}
            >
              <Segmented label="Source type" value={kind} onValueChange={setKind} options={kinds} />
              <Field label="Display name">
                <TextInput
                  value={form.name}
                  onChange={(event) => set("name")(event.target.value)}
                  placeholder={kind === "spreadsheet" ? "Fee schedule" : "Finance warehouse"}
                  maxLength={200}
                  required
                />
              </Field>
              {kind !== "spreadsheet" ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <Field label="Host">
                      <TextInput
                        value={form.host}
                        onChange={(event) => set("host")(event.target.value)}
                        placeholder="warehouse.internal"
                        autoComplete="off"
                        required
                      />
                    </Field>
                    <Field label="Port">
                      <TextInput
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={65535}
                        value={form.port}
                        onChange={(event) => set("port")(event.target.value)}
                        required
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Database">
                      <TextInput
                        value={form.database}
                        onChange={(event) => set("database")(event.target.value)}
                        placeholder="analytics"
                        autoComplete="off"
                        required
                      />
                    </Field>
                    <Field label="Schema">
                      <TextInput
                        value={form.schema}
                        onChange={(event) => set("schema")(event.target.value)}
                        placeholder="public"
                        autoComplete="off"
                      />
                    </Field>
                    <Field label="Read-only user">
                      <TextInput
                        value={form.user}
                        onChange={(event) => set("user")(event.target.value)}
                        placeholder="dataforge_reader"
                        autoComplete="off"
                        required
                      />
                    </Field>
                    <Field label="Password">
                      <TextInput
                        type="password"
                        value={form.password}
                        onChange={(event) => set("password")(event.target.value)}
                        autoComplete="new-password"
                        maxLength={500}
                      />
                    </Field>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  After the connection is saved, upload the Excel workbook to it. Each sheet is
                  offered as a table.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                The password is encrypted before it is stored and is never shown again. Every query
                runs in a read-only transaction, so the source cannot be changed from here.
              </p>
              <SignalButton type="submit" disabled={request.isPending}>
                {request.isPending
                  ? "Saving…"
                  : steward && kind !== "spreadsheet"
                    ? "Test and connect"
                    : "Request the connection"}
              </SignalButton>
            </form>
          )}
        </section>

        <section aria-labelledby="existing-connections">
          <h2 id="existing-connections" className="font-sans mb-3 text-sm font-medium">
            Existing connections
          </h2>
          {connectors.length === 0 ? (
            <p className="border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
              No sources are connected yet.
            </p>
          ) : (
            <ul className="divide-y divide-border border border-border bg-surface-raised">
              {connectors.map((connector) => (
                <ConnectorCard key={connector.id} connector={connector} />
              ))}
            </ul>
          )}
          <div className="mt-3">
            <HelpTip>
              An imported table lands as raw data. It is cleaned, then a steward approves it under{" "}
              <Link
                to="/governance"
                className="text-signal-strong underline-offset-4 hover:underline"
              >
                Approvals
              </Link>{" "}
              before anyone can analyse it.
            </HelpTip>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
