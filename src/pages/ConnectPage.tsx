import { useState } from "react";
import { toast } from "sonner";
import { Chip, Field, HelpTip, inputClass, MediaFrame, Panel, SignalButton } from "@/components";
import { media } from "@/config/media";
import { useConnectors } from "@/features/connectors";
import { MainLayout } from "@/layouts/MainLayout";

const kinds = [
  { id: "postgres", label: "Relational database" },
  { id: "warehouse", label: "Cloud warehouse" },
  { id: "spreadsheet", label: "Spreadsheet file" },
] as const;

export function ConnectPage() {
  const connectors = useConnectors();
  const [kind, setKind] = useState<(typeof kinds)[number]["id"]>("postgres");

  return (
    <MainLayout
      label="governed live sources"
      title="Connect a source"
      intro="A read-only connector reads from a live source under credentials held in the secrets service. Its tables appear in the catalogue with classification and masking applied, exactly as an upload would."
    >
      <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
        <Panel>
          <h2 className="heading-2">New connector</h2>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              toast.success("Connector requested. Tables will appear as pending until a Steward approves them.");
            }}
          >
            <div className="flex flex-wrap gap-2">
              {kinds.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setKind(item.id)}
                  className={`rounded-[999px] border px-4 py-2 text-sm ${
                    kind === item.id
                      ? "border-transparent bg-surface-inverse text-background"
                      : "border-line-strong"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Field label="Display name">
              <input className={inputClass} placeholder="Finance warehouse" />
            </Field>
            {kind !== "spreadsheet" ? (
              <>
                <Field label="Host">
                  <input className={inputClass} placeholder="warehouse.internal" />
                </Field>
                <Field label="Database">
                  <input className={inputClass} placeholder="analytics" />
                </Field>
              </>
            ) : (
              <Field label="Spreadsheet path">
                <input className={inputClass} placeholder="shared/fee_schedule.xlsx" />
              </Field>
            )}
            <p className="text-xs text-muted-foreground">
              Credentials are held in the secrets service and issued as short-lived scoped tokens. The connector is
              read-only.
            </p>
            <SignalButton type="submit">Request connection</SignalButton>
          </form>
        </Panel>

        <div className="space-y-3">
          <MediaFrame {...media.waiting} ratio="16 / 10" />
          {connectors.map((connector) => (
            <Panel key={connector.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="label-paren">({connector.kind})</p>
                  <h2 className="heading-2 mt-1">{connector.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{connector.sourcePath}</p>
                </div>
                <Chip tone={connector.status === "connected" ? "ok" : "warn"}>{connector.status}</Chip>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip>{connector.tables} tables</Chip>
                <Chip>Owner · {connector.owner}</Chip>
                <Chip>Synced {connector.lastSync}</Chip>
              </div>
            </Panel>
          ))}
          <HelpTip>
            Until a Steward approves a connected table, it is not queryable in the cleaned or analytics layers.
          </HelpTip>
        </div>
      </div>
    </MainLayout>
  );
}
