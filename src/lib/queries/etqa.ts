import { useQuery } from "@tanstack/react-query";
import {
  getAppTargets,
  getAssessmentSummary,
  getCertificationTrend,
  getProviderAccreditationSummary,
} from "@/lib/api/etqa";

export function useAppTargets() {
  return useQuery({
    queryKey: ["etqa", "app-targets"],
    queryFn: getAppTargets,
    staleTime: 60 * 1000,
  });
}

export function useCertificationTrend() {
  return useQuery({
    queryKey: ["etqa", "certification-trend"],
    queryFn: getCertificationTrend,
    staleTime: 60 * 1000,
  });
}

export function useProviderAccreditationSummary() {
  return useQuery({
    queryKey: ["etqa", "providers"],
    queryFn: getProviderAccreditationSummary,
    staleTime: 60 * 1000,
  });
}

export function useAssessmentSummary() {
  return useQuery({
    queryKey: ["etqa", "assessments", "summary"],
    queryFn: getAssessmentSummary,
    staleTime: 60 * 1000,
  });
}
