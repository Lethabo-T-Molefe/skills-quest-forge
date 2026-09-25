import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { CleaningStepDef } from "../types";

const cleaningSteps: CleaningStepDef[] = [
  {
    id: "types",
    title: "Fix column types",
    question: "enrolled_on is stored as text. How should it be read?",
    options: ["Date (day first)", "Date (month first)", "Leave as text"],
    affected: "enrolled_on, fee_paid",
    preview: {
      before: ["2026/03/14", "14-03-2026", "March 14 2026", "—"],
      after: ["2026-03-14", "2026-03-14", "2026-03-14", "null"],
    },
  },
  {
    id: "missing",
    title: "Handle missing values",
    question: "region is empty in 12% of rows. What should happen to them?",
    options: ["Fill with 'Unknown'", "Drop those rows", "Leave blank"],
    affected: "region, fee_paid",
    preview: {
      before: ["Gauteng", "", "Limpopo", ""],
      after: ["Gauteng", "Unknown", "Limpopo", "Unknown"],
    },
  },
  {
    id: "duplicates",
    title: "Remove duplicates",
    question: "312 rows repeat the same learner, course and date. Remove them?",
    options: ["Keep the first row", "Keep the most recent row", "Keep all rows"],
    affected: "whole table",
    preview: {
      before: ["LR-100238 · Data literacy", "LR-100238 · Data literacy", "LR-100412 · SQL basics"],
      after: ["LR-100238 · Data literacy", "LR-100412 · SQL basics"],
    },
  },
  {
    id: "formats",
    title: "Standardise formats",
    question: "fee_paid mixes currency symbols and spacing. Normalise to a number?",
    options: ["Number, 2 decimals", "Keep formatted text"],
    affected: "fee_paid",
    preview: {
      before: ["R 1 250.00", "1250", "R1,250.00"],
      after: ["1250.00", "1250.00", "1250.00"],
    },
  },
  {
    id: "outliers",
    title: "Handle outliers",
    question: "45 fee values sit far outside the normal range. What should happen?",
    options: ["Flag only", "Cap at the 99th percentile", "Drop those rows"],
    affected: "fee_paid",
    preview: {
      before: ["1250.00", "980000.00", "1400.00"],
      after: ["1250.00", "1250.00 (flagged)", "1400.00"],
    },
  },
  {
    id: "columns",
    title: "Rename or drop columns",
    question: "id_number is masked personal information. Drop it from the clean table?",
    options: ["Drop the column", "Keep it masked"],
    affected: "id_number",
    preview: {
      before: ["learner_id, full_name, id_number, …"],
      after: ["learner_id, full_name, …"],
    },
  },
];

export function fetchCleaningSteps() {
  return mockResponse(cleaningSteps);
}

export const cleaningStepsQuery = () =>
  queryOptions({ queryKey: ["cleaning", "steps"], queryFn: fetchCleaningSteps });
