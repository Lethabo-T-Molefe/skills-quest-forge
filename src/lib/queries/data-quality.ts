import { useQuery } from "@tanstack/react-query";
import { getQualityReport } from "@/lib/api/data-quality";

export function useQualityReport(tableName: string | undefined) {
  return useQuery({
    queryKey: ["data-quality", tableName],
    queryFn: () => getQualityReport(tableName as string),
    enabled: !!tableName,
    staleTime: 60 * 1000,
  });
}
