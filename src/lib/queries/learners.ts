import { useQuery } from "@tanstack/react-query";
import {
  getEnrolmentTrend,
  getLearnerCohorts,
  type LearnerCohortFilters,
} from "@/lib/api/learners";

export function useLearnerCohorts(filters: LearnerCohortFilters = {}) {
  return useQuery({
    queryKey: ["learners", "cohorts", filters],
    queryFn: () => getLearnerCohorts(filters),
    staleTime: 60 * 1000,
  });
}

export function useEnrolmentTrend() {
  return useQuery({
    queryKey: ["learners", "enrolment-trend"],
    queryFn: getEnrolmentTrend,
    staleTime: 60 * 1000,
  });
}
