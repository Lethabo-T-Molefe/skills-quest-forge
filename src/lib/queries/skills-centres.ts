import { useQuery } from "@tanstack/react-query";
import {
  getCentreUtilisationHeatmap,
  getSkillsCentres,
  type SkillsCentreFilters,
} from "@/lib/api/skills-centres";

export function useSkillsCentres(filters: SkillsCentreFilters = {}) {
  return useQuery({
    queryKey: ["centres", filters],
    queryFn: () => getSkillsCentres(filters),
    staleTime: 60 * 1000,
  });
}

export function useCentreUtilisationHeatmap() {
  return useQuery({
    queryKey: ["centres", "utilisation"],
    queryFn: getCentreUtilisationHeatmap,
    staleTime: 60 * 1000,
  });
}
