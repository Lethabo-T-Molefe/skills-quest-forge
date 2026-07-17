import { useQuery } from "@tanstack/react-query";
import { getGrants, getGrantUtilisationByProvince, type GrantFilters } from "@/lib/api/grants";

export function useGrants(filters: GrantFilters = {}) {
  return useQuery({
    queryKey: ["grants", filters],
    queryFn: () => getGrants(filters),
    staleTime: 60 * 1000,
  });
}

export function useGrantUtilisationByProvince() {
  return useQuery({
    queryKey: ["grants", "utilisation"],
    queryFn: getGrantUtilisationByProvince,
    staleTime: 60 * 1000,
  });
}
