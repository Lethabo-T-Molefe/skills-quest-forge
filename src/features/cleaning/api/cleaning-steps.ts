import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import { cleaningStudio } from "../data/catalogue";
import { enrolmentProfile } from "../data/profile";
import type { CleaningProfile, CleaningStudioData } from "../types";

export function fetchCleaningStudio() {
  return mockResponse(cleaningStudio);
}

export function fetchCleaningProfile() {
  return mockResponse(enrolmentProfile);
}

export const cleaningStepsQuery = () =>
  queryOptions({ queryKey: ["cleaning", "studio"], queryFn: fetchCleaningStudio });

export const cleaningProfileQuery = () =>
  queryOptions({ queryKey: ["cleaning", "profile"], queryFn: fetchCleaningProfile });

export type { CleaningProfile, CleaningStudioData };
