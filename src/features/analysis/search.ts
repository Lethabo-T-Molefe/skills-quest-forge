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
  /** Keeps one value of one dimension, written as "dimension:value" (for example "region:Gauteng"). */
  only?: string | undefined;
}

export function parseBuildSearch(search: Record<string, unknown>): BuildSearch {
  const parsed: BuildSearch = parseAnalyseSearch(search);
  for (const key of ["measure", "dimension", "only"] as const) {
    const value = search[key];
    if (typeof value === "string") parsed[key] = value;
  }
  // Links made before filters were general named the region directly.
  if (!parsed.only && typeof search["region"] === "string")
    parsed.only = `region:${search["region"]}`;
  return parsed;
}

/** The filters a build link asks for, as dimension id to value. */
export function filtersFromSearch(search: BuildSearch): Record<string, string> {
  const [dimension, ...rest] = (search.only ?? "").split(":");
  const value = rest.join(":");
  return dimension && value ? { [dimension]: value } : {};
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
  /** A notebook to open on the Notebooks tab. */
  notebook?: string | undefined;
}

export function parseCodeSearch(search: Record<string, unknown>): CodeSearch {
  const parsed: CodeSearch = parseAnalyseSearch(search);
  if (typeof search["sql"] === "string") parsed.sql = search["sql"];
  if (typeof search["notebook"] === "string") parsed.notebook = search["notebook"];
  return parsed;
}
