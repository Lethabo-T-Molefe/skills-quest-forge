import { useQuery } from "@tanstack/react-query";
import { getLineageGraph } from "@/lib/api/lineage";

export function useLineageGraph(pipeline: string) {
  return useQuery({
    queryKey: ["lineage", pipeline],
    queryFn: () => getLineageGraph(pipeline),
    staleTime: 60 * 1000,
    enabled: Boolean(pipeline),
  });
}
