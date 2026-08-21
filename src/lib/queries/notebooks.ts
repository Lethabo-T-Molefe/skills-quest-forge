import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLanguages, listNotebooks } from "@/lib/api/notebooks";

export function useLanguages() {
  return useQuery({ queryKey: ["notebooks", "languages"], queryFn: getLanguages, staleTime: Infinity });
}

export function useNotebookList() {
  return useQuery({ queryKey: ["notebooks", "files"], queryFn: listNotebooks, staleTime: 10 * 1000 });
}

export function useInvalidateNotebookList() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["notebooks", "files"] });
}
