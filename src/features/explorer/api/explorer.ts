import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { ExploreDefinition, ExploreResult, RegionRow, TrendPoint } from "../types";

const exploreRows: RegionRow[] = [
  { region: "Gauteng", enrolments: 19740, completions: 13418, revenue: 2410500 },
  { region: "Western Cape", enrolments: 9120, completions: 6870, revenue: 1284000 },
  { region: "KwaZulu-Natal", enrolments: 7480, completions: 4920, revenue: 964300 },
  { region: "Eastern Cape", enrolments: 4310, completions: 2611, revenue: 512800 },
  { region: "Limpopo", enrolments: 3180, completions: 1944, revenue: 388400 },
  { region: "Free State", enrolments: 2390, completions: 1402, revenue: 248900 },
  { region: "Mpumalanga", enrolments: 1993, completions: 1215, revenue: 214600 },
];

const trendRows: TrendPoint[] = [
  { month: "Oct", value: 412 },
  { month: "Nov", value: 448 },
  { month: "Dec", value: 391 },
  { month: "Jan", value: 503 },
  { month: "Feb", value: 561 },
  { month: "Mar", value: 432 },
];

export function fetchRegionRows() {
  return mockResponse(exploreRows);
}

export function fetchTrend() {
  return mockResponse(trendRows);
}

export const regionRowsQuery = () => queryOptions({ queryKey: ["explorer", "regions"], queryFn: fetchRegionRows });

export const trendQuery = () => queryOptions({ queryKey: ["explorer", "trend"], queryFn: fetchTrend });

export function defaultExploreDefinition(datasetId: string, datasetName: string): ExploreDefinition {
  return {
    datasetId,
    datasetName,
    chartType: "bar",
    xField: "region",
    yField: "enrolments",
    aggregation: "sum",
    filterField: "",
    filterValue: "",
  };
}

export function buildExploreResult(definition: ExploreDefinition): ExploreResult {
  const filtered = definition.filterValue
    ? exploreRows.filter((row) => row.region.toLowerCase().includes(definition.filterValue.toLowerCase()))
    : exploreRows;

  const series = filtered.map((row) => {
    const value =
      definition.yField === "completions"
        ? row.completions
        : definition.yField === "revenue"
          ? row.revenue
          : row.enrolments;
    return { name: row.region, value };
  });

  const sql = `SELECT ${definition.xField},
       ${definition.aggregation.toUpperCase()}(${definition.yField}) AS ${definition.yField}
FROM   ${definition.datasetId.replace(/-/g, "_")}
${definition.filterValue && definition.filterField ? `WHERE  ${definition.filterField} = '${definition.filterValue}'` : ""}
GROUP  BY ${definition.xField}
ORDER  BY ${definition.yField} DESC;`;

  return {
    definition,
    sql: sql.replace(/\n{2,}/g, "\n"),
    explanation: `Grouped ${definition.datasetName} by ${definition.xField} and took the ${definition.aggregation} of ${definition.yField}. The query will only return rows your role is allowed to see.`,
    columns: [definition.xField, definition.yField],
    rows: series.map((item) => [item.name, item.value]),
    series,
  };
}
