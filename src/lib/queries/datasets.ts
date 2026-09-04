import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listDatasets, getDataset, uploadDataset, type Dataset } from "@/lib/api";

export function useDatasets(search?: string) {
  return useQuery({
    queryKey: ["datasets", search ?? null],
    queryFn: () => listDatasets(search),
    staleTime: 30 * 1000,
  });
}

export function useDataset(id: number | null) {
  return useQuery({
    queryKey: ["datasets", "detail", id],
    queryFn: () => getDataset(id as number),
    enabled: id !== null,
  });
}

export function useUploadDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      name,
      description,
      tags,
      classification,
    }: {
      file: File;
      name: string;
      description?: string;
      tags?: string[];
      classification?: string;
    }) => uploadDataset(file, name, { description, tags, classification }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });
}

export type { Dataset };
