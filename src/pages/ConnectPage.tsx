import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { BackLink, Chip, Field, HelpTip, Segmented, SignalButton, TextInput } from "@/components";
import { useConnectors } from "@/features/connectors";
import { MainLayout } from "@/layouts/MainLayout";

const kinds = [
  { value: "postgres", label: "Relational database" },
  { value: "warehouse", label: "Cloud warehouse" },
  { value: "spreadsheet", label: "Spreadsheet file" },
] as const;

type Kind = (typeof kinds)[number]["value"];

export function ConnectPage() {
  const connectors = useConnectors();
  const [kind, setKind] = useState<Kind>("postgres");

  return (
    <MainLayout
      back={<BackLink to="/datasets">All datasets</BackLink>}
      title="Connect a source"
      description="A read-only connection to a live source. Its tables appear in Datasets, classified and masked like an upload, and wait for a steward's approval."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
        <section className="panel p-5" aria-label="New connection">
          <h2 className="font-display text-xl">New connection</h2>
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              toast.success("Connection requested", {
                description: "Its tables will appear in Datasets as waiting until a steward approves them.",
              });
            }}
          >
            <Segmented label="Source type" value={kind} onValueChange={setKind} options={[...kinds]} />
            <Field label="Display name">
              <TextInput placeholder="Finance warehouse" required />
            </Field>
            {kind !== "spreadsheet" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Host">
                  <TextInput placeholder="warehouse.internal" required />
                </Field>
                <Field label="Database">
                  <TextInput placeholder="analytics" required />
                </Field>
              </div>
            ) : (
              <Field label="Spreadsheet path">
                <TextInput placeholder="shared/fee_schedule.xlsx" required />
              </Field>
            )}
            <p className="text-xs text-muted-foreground">
              Credentials stay in the secrets service and are issued as short-lived, scoped tokens. The connection can
              only read.
            </p>
            <SignalButton type="submit">Request the connection</SignalButton>
          </form>
        </section>

        <section aria-label="Existing connections">
          <h2 className="font-sans mb-3 text-sm font-medium">Existing connections</h2>
          <ul className="divide-y divide-border border border-border bg-surface-raised">
            {connectors.map((connector) => (
              <li key={connector.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{connector.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{connector.sourcePath}</p>
                  </div>
                  <Chip tone={connector.status === "connected" ? "ok" : "warn"}>{connector.status}</Chip>
                </div>
                <p className="num mt-2 text-xs text-muted-foreground">
                  {connector.tables} tables · owner {connector.owner} · synced {connector.lastSync}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <HelpTip>
              Until a steward approves a connected table, it cannot be analysed. Stewards find it under{" "}
              <Link to="/governance" className="text-signal-strong underline-offset-4 hover:underline">
                Approvals
              </Link>
              .
            </HelpTip>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
