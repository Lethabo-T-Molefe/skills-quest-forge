import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrentUser } from "@/features/auth";
import { SharePanel } from "@/features/sharing";
import { notifyError } from "@/lib/notify";
import {
  datasetSharesQuery,
  refreshDatasets,
  shareDataset,
  unshareDataset,
  updateDataset,
} from "../api/datasets";
import type { Dataset, Visibility } from "../types";

/** Who can see a dataset: its visibility, and the people it is shared with by name. */
export function DatasetSharing({ dataset }: { dataset: Dataset }) {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const canEdit = dataset.ownerId === user.id || user.roleId === "admin";
  const shares = useQuery(datasetSharesQuery(dataset.id));
  const refreshShares = () =>
    queryClient.invalidateQueries({ queryKey: datasetSharesQuery(dataset.id).queryKey });

  const visibility = useMutation({
    mutationFn: (next: Visibility) => updateDataset(dataset.id, { visibility: next }),
    onSuccess: async () => {
      await refreshDatasets(queryClient);
      toast.success("Visibility saved");
    },
    onError: notifyError("The visibility could not be changed."),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => unshareDataset(dataset.id, userId),
    onSuccess: refreshShares,
    onError: notifyError("Sharing could not be changed."),
  });

  async function add(email: string) {
    try {
      const result = await shareDataset(dataset.id, [email]);
      await refreshShares();
      toast.success(
        result.added.length > 0 ? `Shared with ${result.added.join(", ")}` : "Already shared",
      );
    } catch (error) {
      notifyError("The dataset could not be shared.")(error);
      throw error;
    }
  }

  return (
    <SharePanel
      visibility={dataset.visibility}
      members={shares.data ?? []}
      canEdit={canEdit}
      busy={visibility.isPending}
      onVisibilityChange={(next) => visibility.mutate(next)}
      onAdd={add}
      onRemove={(member) => remove.mutate(member.id)}
    />
  );
}
