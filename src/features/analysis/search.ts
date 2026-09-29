import { isMethodId } from "./data/methods";
import type { MethodId } from "./types";

/** The context the Analyse tabs carry between ways of working. */
export interface AnalyseSearch {
  dataset?: string | undefined;
  method?: MethodId | undefined;
}

export function parseAnalyseSearch(search: Record<string, unknown>): AnalyseSearch {
  const parsed: AnalyseSearch = {};
  if (typeof search["dataset"] === "string") parsed.dataset = search["dataset"];
  if (isMethodId(search["method"])) parsed.method = search["method"];
  return parsed;
}

export interface BuildSearch extends AnalyseSearch {
  measure?: string | undefined;
  dimension?: string | undefined;
  region?: string | undefined;
}

export function parseBuildSearch(search: Record<string, unknown>): BuildSearch {
  const parsed: BuildSearch = parseAnalyseSearch(search);
  for (const key of ["measure", "dimension", "region"] as const) {
    const value = search[key];
    if (typeof value === "string") parsed[key] = value;
  }
  return parsed;
}

export interface AskSearch extends AnalyseSearch {
  q?: string | undefined;
}

export function parseAskSearch(search: Record<string, unknown>): AskSearch {
  const parsed: AskSearch = parseAnalyseSearch(search);
  if (typeof search["q"] === "string") parsed.q = search["q"];
  return parsed;
}

export interface CodeSearch extends AnalyseSearch {
  sql?: string | undefined;
}

export function parseCodeSearch(search: Record<string, unknown>): CodeSearch {
  const parsed: CodeSearch = parseAnalyseSearch(search);
  if (typeof search["sql"] === "string") parsed.sql = search["sql"];
  return parsed;
}
