import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpenCheck, ExternalLink, PieChart } from "lucide-react";
import { quietButtonClass } from "@/components";
import { canWriteCode, useCurrentUser } from "@/features/auth";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  SUPERSET_ROLES,
  integrationStatusQuery,
  openJupyter,
  openNotebookInJupyter,
  openSqlInJupyter,
  openSuperset,
} from "../api/integrations";

function ActionButton({
  label,
  icon,
  run,
  className,
}: {
  label: string;
  icon: ReactNode;
  run: () => Promise<void>;
  className?: string | undefined;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className={cn(quietButtonClass, className)}
      onClick={() => {
        setBusy(true);
        run()
          .catch((error: unknown) => toast.error(errorMessage(error, `${label} did not open.`)))
          .finally(() => setBusy(false));
      }}
    >
      {icon}
      {busy ? "Opening…" : label}
      <ExternalLink className="size-3.5 opacity-60" strokeWidth={1.5} aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </button>
  );
}

function useIntegration(name: "superset" | "jupyter") {
  const status = useQuery(integrationStatusQuery());
  return status.data?.[name];
}

/** Opens Superset (dashboards, Explore, SQL Lab), signed in with the member's DataForge role. */
export function OpenSupersetButton({
  next,
  label = "Open in Superset",
  className,
}: {
  next?: string;
  label?: string;
  className?: string;
}) {
  const user = useCurrentUser();
  const status = useIntegration("superset");
  if (!status?.enabled || !SUPERSET_ROLES.includes(user.roleId)) return null;
  return (
    <ActionButton
      label={label}
      className={className}
      icon={<PieChart className="size-4" strokeWidth={1.5} aria-hidden />}
      run={() => openSuperset(next)}
    />
  );
}

/** Opens the member's Jupyter folder, or a given notebook or SQL there. For roles that write code. */
export function OpenJupyterButton({
  sql,
  title = "From DataForge",
  notebookId,
  label = "Open in Jupyter",
  className,
}: {
  sql?: string | undefined;
  title?: string;
  notebookId?: string;
  label?: string;
  className?: string;
}) {
  const user = useCurrentUser();
  const status = useIntegration("jupyter");
  if (!status?.enabled || !canWriteCode(user)) return null;
  const run = notebookId
    ? () => openNotebookInJupyter(notebookId)
    : sql
      ? () => openSqlInJupyter(title, sql)
      : () => openJupyter();
  return (
    <ActionButton
      label={label}
      className={className}
      icon={<BookOpenCheck className="size-4" strokeWidth={1.5} aria-hidden />}
      run={run}
    />
  );
}
