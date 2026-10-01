import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LayoutDashboard } from "lucide-react";
import { Drawer, Field, QuietButton, SelectMenu, SignalButton, TextInput } from "@/components";
import { errorMessage } from "@/lib/api";
import { addChart, chartTypeFor, createDashboard, dashboardsQuery } from "../api/dashboards";
import type { ChartSettings } from "../types";

const NEW = "__new__";

/**
 * Save a chart to one of the member's dashboards, or to a new one. The dashboard stores the settings, not the
 * numbers, so every viewer sees the chart computed under their own role.
 */
export function SaveToDashboard({
  title,
  config,
  sql,
  explanation,
  className,
}: {
  title: string;
  config?: ChartSettings | undefined;
  sql?: string | undefined;
  explanation?: string | undefined;
  className?: string | undefined;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<string>("");
  const [name, setName] = useState("");
  const [chartTitle, setChartTitle] = useState(title);
  const [busy, setBusy] = useState(false);
  const dashboards = useQuery({ ...dashboardsQuery(), enabled: open });
  const editable = (dashboards.data ?? []).filter((item) => item.canEdit);
  const chosen = target || editable[0]?.id || NEW;

  async function save() {
    setBusy(true);
    try {
      let dashboardId = chosen;
      if (chosen === NEW) {
        const created = await createDashboard({
          name: name.trim() || "My scratch board",
          description: "",
          visibility: "private",
        });
        dashboardId = created.id;
      }
      await addChart(dashboardId, {
        title: chartTitle.trim() || title,
        type: chartTypeFor(config?.method ?? "compare"),
        ...(config ? { config } : { sql: sql ?? "" }),
        ...(explanation ? { explanation } : {}),
      });
      await queryClient.invalidateQueries({ queryKey: ["dashboards"] });
      setOpen(false);
      toast.success("Chart saved", {
        description: "It is computed for each viewer under their own permissions.",
        action: {
          label: "Open",
          onClick: () => void navigate({ to: "/dashboards/$dashboardId", params: { dashboardId } }),
        },
      });
    } catch (error) {
      toast.error(errorMessage(error, "The chart could not be saved."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SignalButton className={className ?? "px-3.5 py-1.5 text-xs"} onClick={() => setOpen(true)}>
        <LayoutDashboard className="size-3.5" strokeWidth={1.75} aria-hidden />
        Save to a dashboard
      </SignalButton>
      <Drawer open={open} title="Save to a dashboard" onClose={() => setOpen(false)}>
        <div className="space-y-5">
          <Field label="Chart title">
            <TextInput value={chartTitle} onChange={(event) => setChartTitle(event.target.value)} />
          </Field>
          {dashboards.isPending ? (
            <p className="text-sm text-muted-foreground">Loading your dashboards…</p>
          ) : dashboards.isError ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage(dashboards.error, "Your dashboards did not load.")}
            </p>
          ) : (
            <SelectMenu
              label="Dashboard"
              value={chosen}
              onValueChange={setTarget}
              options={[
                ...editable.map((item) => ({
                  value: item.id,
                  label: `${item.name} · ${item.visibility}`,
                })),
                { value: NEW, label: "A new private dashboard" },
              ]}
            />
          )}
          {chosen === NEW ? (
            <Field label="New dashboard name">
              <TextInput
                value={name}
                placeholder="My scratch board"
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
          ) : null}
          <p className="text-xs text-muted-foreground">
            The dashboard keeps these settings, not a copy of the numbers. Shared viewers see only
            rows their role permits.
          </p>
          <div className="flex flex-wrap gap-2">
            <SignalButton disabled={busy} onClick={() => void save()}>
              {busy ? "Saving…" : "Save chart"}
            </SignalButton>
            <QuietButton onClick={() => setOpen(false)}>Cancel</QuietButton>
          </div>
        </div>
      </Drawer>
    </>
  );
}
