import { useQuery } from "@tanstack/react-query";
import { listDashboards, getChartData } from "@/lib/api/bi";

export function useBiDashboards() {
  return useQuery({ queryKey: ["bi", "dashboards"], queryFn: listDashboards, staleTime: 60 * 1000 });
}

export function useBiChartData(chartId: number) {
  return useQuery({ queryKey: ["bi", "chart", chartId], queryFn: () => getChartData(chartId) });
}
