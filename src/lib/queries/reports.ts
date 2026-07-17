import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createScheduledReport,
  generateReport,
  getReportHistory,
  getScheduledReports,
  toggleScheduledReport,
  type GenerateReportInput,
  type ScheduleReportInput,
} from "@/lib/api/reports";

const historyKey = ["reports", "history"] as const;
const scheduledKey = ["reports", "scheduled"] as const;

export function useReportHistory() {
  return useQuery({
    queryKey: historyKey,
    queryFn: getReportHistory,
    staleTime: 60 * 1000,
  });
}

export function useScheduledReports() {
  return useQuery({
    queryKey: scheduledKey,
    queryFn: getScheduledReports,
    staleTime: 60 * 1000,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GenerateReportInput) => generateReport(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKey });
    },
  });
}

export function useCreateScheduledReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleReportInput) => createScheduledReport(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledKey });
    },
  });
}

export function useToggleScheduledReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      toggleScheduledReport(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledKey });
    },
  });
}
