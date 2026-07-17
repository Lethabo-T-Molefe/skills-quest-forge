import { useQuery } from "@tanstack/react-query";
import { exploreTable, runSql } from "@/lib/api/analytics";

export function useExploreTable(table: string) {
  return useQuery({
    queryKey: ["analytics", "explore", table],
    queryFn: () => exploreTable(table),
    staleTime: 60 * 1000,
  });
}

export function useSqlQuery(sql: string, enabled: boolean) {
  return useQuery({
    queryKey: ["analytics", "sql", sql],
    queryFn: () => runSql(sql),
    enabled,
    staleTime: 0,
  });
}
