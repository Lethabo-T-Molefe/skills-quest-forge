import type { FactRow } from "../types";

/**
 * Mock fact table behind the analysis tools: one row per region, course and month.
 * Generated from a fixed seed so every visit shows the same numbers, and tuned to match
 * the figures used elsewhere in the prototype (Gauteng leads, Free State revenue drops in March,
 * SQL basics completion climbs past 70%).
 */

export const MONTHS = [
  { id: "2025-10", label: "Oct 2025", short: "Oct" },
  { id: "2025-11", label: "Nov 2025", short: "Nov" },
  { id: "2025-12", label: "Dec 2025", short: "Dec" },
  { id: "2026-01", label: "Jan 2026", short: "Jan" },
  { id: "2026-02", label: "Feb 2026", short: "Feb" },
  { id: "2026-03", label: "Mar 2026", short: "Mar" },
] as const;

export const REGIONS = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Free State",
  "Mpumalanga",
] as const;

export const COURSES = ["Data literacy", "SQL basics", "Python for analysts", "Stewardship 101"] as const;

const regionMonthlyEnrolments: Record<string, number> = {
  Gauteng: 3290,
  "Western Cape": 1520,
  "KwaZulu-Natal": 1247,
  "Eastern Cape": 718,
  Limpopo: 530,
  "Free State": 398,
  Mpumalanga: 332,
};

const courseShare: Record<string, number> = {
  "Data literacy": 0.4,
  "SQL basics": 0.22,
  "Python for analysts": 0.26,
  "Stewardship 101": 0.12,
};

/** December dips, January and February peak. */
const season = [0.92, 0.98, 0.85, 1.08, 1.15, 1.02];

const courseCompletion: Record<string, { base: number; perMonth: number }> = {
  "Data literacy": { base: 0.672, perMonth: 0.004 },
  "SQL basics": { base: 0.63, perMonth: 0.017 },
  "Python for analysts": { base: 0.628, perMonth: 0.004 },
  "Stewardship 101": { base: 0.585, perMonth: 0.003 },
};

const regionCompletionShift: Record<string, number> = {
  Gauteng: 0.02,
  "Western Cape": 0.035,
  "KwaZulu-Natal": -0.005,
  "Eastern Cape": -0.02,
  Limpopo: -0.03,
  "Free State": -0.025,
  Mpumalanga: -0.02,
};

const courseFee: Record<string, number> = {
  "Data literacy": 1080,
  "SQL basics": 1240,
  "Python for analysts": 1460,
  "Stewardship 101": 1020,
};

const regionFeeFactor: Record<string, number> = {
  Gauteng: 1.11,
  "Western Cape": 1.06,
  "KwaZulu-Natal": 0.95,
  "Eastern Cape": 0.86,
  Limpopo: 0.84,
  "Free State": 0.81,
  Mpumalanga: 0.83,
};

/** mulberry32: a tiny deterministic PRNG, so the mock data never changes between visits. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(): FactRow[] {
  const random = seeded(20260314);
  const noise = () => random() * 2 - 1;
  const rows: FactRow[] = [];

  MONTHS.forEach((month, monthIndex) => {
    for (const region of REGIONS) {
      for (const course of COURSES) {
        // Free State: fewer Bloemfontein enrolments and more subsidised fees in March.
        const freeStateMarch = region === "Free State" && month.id === "2026-03";
        const volume =
          (regionMonthlyEnrolments[region] ?? 0) *
          (courseShare[course] ?? 0) *
          (season[monthIndex] ?? 1) *
          (1 + noise() * 0.06) *
          (freeStateMarch ? 0.78 : 1);
        const enrolments = Math.max(1, Math.round(volume));

        const completion = courseCompletion[course] ?? { base: 0.65, perMonth: 0 };
        const rate = Math.min(
          0.95,
          completion.base + completion.perMonth * monthIndex + (regionCompletionShift[region] ?? 0) + noise() * 0.015,
        );
        const completions = Math.round(enrolments * rate);

        const fee =
          (courseFee[course] ?? 1200) * (regionFeeFactor[region] ?? 1) * (freeStateMarch ? 0.94 : 1) * (1 + noise() * 0.02);
        const revenue = Math.round(enrolments * fee);

        // Learners who complete tend to log more sessions, which the relationship method can surface.
        const sessionsPerLearner = 1.5 + 2.2 * rate + noise() * 0.15;
        const sessions = Math.round(enrolments * sessionsPerLearner);

        rows.push({ region, course, month: month.id, enrolments, completions, revenue, sessions });
      }
    }
  });

  return rows;
}

export const factRows: FactRow[] = build();

export function monthLabel(id: string, short = false) {
  const month = MONTHS.find((item) => item.id === id);
  if (!month) return id;
  return short ? month.short : month.label;
}
