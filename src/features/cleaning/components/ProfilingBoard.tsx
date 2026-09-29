import { Chip, TabsContent, TabsList, TabsRoot, TabsTrigger } from "@/components";
import { formatNumber } from "@/lib/format";
import type { CleaningProfile } from "../types";

/**
 * The measurement step before any change, split into tabs so each view fits on screen:
 * an overview, the columns, the shapes of values, why blanks happen, and keys and links.
 */
export function ProfilingBoard({ profile }: { profile: CleaningProfile }) {
  const patterned = profile.columns.filter(
    (column) => column.patterns.length > 1 || column.patterns.some((item) => item.rare),
  );

  return (
    <TabsRoot defaultValue="overview">
      <TabsList aria-label="Profile views">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="columns">Columns</TabsTrigger>
        <TabsTrigger value="patterns">Value shapes</TabsTrigger>
        <TabsTrigger value="missing">Why blanks happen</TabsTrigger>
        <TabsTrigger value="keys">Keys and links</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        <p className="max-w-[72ch] text-sm text-muted-foreground">
          Profiling measures the file before anything changes: empty cells, the shapes of values, columns that should
          agree, and IDs missing from the master list. Measured on <span className="num">{formatNumber(profile.rows)}</span>{" "}
          rows.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-3">
          {profile.dimensions.map((item) => (
            <div key={item.name} className="bg-surface-raised p-4">
              <p className="text-xs text-muted-foreground">{item.name}</p>
              <p className="num mt-1 font-display text-2xl font-light">{item.score}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="columns" className="mt-4">
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-strong bg-surface-alt text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Column</th>
                <th className="px-3 py-2 font-medium">Stored as</th>
                <th className="px-3 py-2 font-medium">Looks like</th>
                <th className="px-3 py-2 font-medium">Empty</th>
                <th className="px-3 py-2 font-medium">Distinct</th>
                <th className="px-3 py-2 font-medium">Why blanks happen</th>
              </tr>
            </thead>
            <tbody className="bg-surface-raised">
              {profile.columns.map((column) => (
                <tr key={column.name} className="border-b border-border align-top last:border-0">
                  <td className="px-3 py-2 font-medium">
                    {column.name}
                    {column.masked ? <span className="ml-2 text-xs text-signal-strong">masked</span> : null}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{column.declaredType}</td>
                  <td className="px-3 py-2">{column.inferredType}</td>
                  <td className={`num px-3 py-2 ${column.nullPct > 5 ? "text-signal-strong" : "text-muted-foreground"}`}>
                    {column.nullPct}%
                  </td>
                  <td className="num px-3 py-2 text-muted-foreground">{formatNumber(column.distinct)}</td>
                  <td className="px-3 py-2">
                    <Chip tone={column.missingness === "none" ? "ok" : column.missingness === "MNAR" ? "signal" : "warn"}>
                      {column.missingness === "none" ? "complete" : column.missingness}
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="patterns" className="mt-4">
        <p className="max-w-[72ch] text-sm text-muted-foreground">
          Each value is reduced to its shape: 0821234567 becomes 9999999999. Rare shapes are usually typing errors.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {patterned.map((column) => (
            <div key={column.name} className="border border-border bg-surface-raised p-3">
              <p className="text-sm font-medium">{column.name}</p>
              <ul className="mt-2 space-y-1 font-mono text-xs">
                {column.patterns.map((item) => (
                  <li key={item.pattern} className="flex justify-between gap-3">
                    <span>
                      {item.pattern}
                      {item.rare ? <span className="ml-2 font-sans text-signal-strong">rare</span> : null}
                    </span>
                    <span className="num text-muted-foreground">{formatNumber(item.count)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="missing" className="mt-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <div>
            <p className="text-sm">
              Little&apos;s MCAR test · {profile.littlesMcar.statistic} · p = {profile.littlesMcar.pValue}
            </p>
            <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">{profile.littlesMcar.reading}</p>
            <ul className="mt-4 space-y-2">
              {profile.columns
                .filter((column) => column.missingness !== "none")
                .map((column) => (
                  <li key={column.name} className="text-sm">
                    <span className="font-medium">{column.name}</span>{" "}
                    <Chip tone={column.missingness === "MNAR" ? "signal" : "warn"}>{column.missingness}</Chip>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{column.missingNote}</span>
                  </li>
                ))}
            </ul>
          </div>
          <dl className="space-y-3 bg-surface-alt p-4 text-sm">
            <div>
              <dt className="font-medium">MCAR: missing completely at random</dt>
              <dd className="text-muted-foreground">The blank is unrelated to anything. Dropping those rows is unbiased but wastes data.</dd>
            </div>
            <div>
              <dt className="font-medium">MAR: missing at random</dt>
              <dd className="text-muted-foreground">The blank depends on other columns we can see. Filling it from those columns is valid.</dd>
            </div>
            <div>
              <dt className="font-medium">MNAR: missing not at random</dt>
              <dd className="text-muted-foreground">The blank depends on the hidden value itself. Keep a flag, or model why it is missing.</dd>
            </div>
          </dl>
        </div>
      </TabsContent>

      <TabsContent value="keys" className="mt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-wide text-muted-foreground uppercase">Candidate keys</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {profile.candidateKeys.map((key) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-wide text-muted-foreground uppercase">Columns that should agree</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {profile.dependencies.map((item) => (
                <li key={`${item.left}-${item.right}`}>
                  <p className="text-xs text-muted-foreground">
                    {item.left} → {item.right}
                  </p>
                  <p>
                    {item.hold ? "Holds" : "Does not hold"} · {item.support}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-wide text-muted-foreground uppercase">Links to other tables</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {profile.crossTable.map((item) => (
                <li key={item.parent}>
                  <p className="text-xs text-muted-foreground">
                    {item.child} vs {item.parent}
                  </p>
                  <p>
                    {item.orphanPct}% not found. {item.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </TabsContent>
    </TabsRoot>
  );
}
